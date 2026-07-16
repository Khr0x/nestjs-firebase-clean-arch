import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Firestore } from 'firebase-admin/firestore';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FIRESTORE_DB } from '../src/infrastructure/firebase/firebase.module';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter';

type UserResponse = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type ListUsersResponse = {
  data: UserResponse[];
};

const describeWithEmulator = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

describeWithEmulator('API de usuarios con Firestore (e2e)', () => {
  let app: INestApplication;
  let db: Firestore;

  beforeAll(async () => {
    process.env.FIREBASE_PROJECT_ID ??= 'demo-nestjs-firebase-clean-arch';
    process.env.BCRYPT_SALT_ROUNDS = '4';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    db = app.get<Firestore>(FIRESTORE_DB);
  });

  beforeEach(async () => {
    await clearUsers(db);
  });

  afterAll(async () => {
    await clearUsers(db);
    await app?.close();
  });

  it('crea usuario con password y guarda solo el hash bcrypt', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/users')
      .send({
        username: 'cristian',
        email: 'cristian@example.com',
        password: 'Secret123!',
      })
      .expect(201);
    const body = response.body as UserResponse;

    expect(body).toMatchObject({
      username: 'cristian',
      email: 'cristian@example.com',
    });
    expect(body).not.toHaveProperty('password');

    const snapshot = await db.collection('users').doc(body.id).get();
    const password = snapshot.data()?.password as unknown;

    expect(typeof password).toBe('string');
    expect(password).not.toBe('Secret123!');
    await expect(bcrypt.compare('Secret123!', password)).resolves.toBe(true);
  });

  it('crea usuario sin password y el listener asigna uno', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/users')
      .send({
        username: 'ada',
        email: 'ada@example.com',
      })
      .expect(201);
    const body = response.body as UserResponse;

    expect(body).not.toHaveProperty('password');

    const password = await poll(async () => {
      const snapshot = await db.collection('users').doc(body.id).get();
      const value = snapshot.data()?.password as unknown;

      return typeof value === 'string' ? value : undefined;
    });

    expect(password).toMatch(/^\$2[aby]\$/);
  });

  it('ejecuta el flujo CRUD contra Firestore', async () => {
    const created = await request(app.getHttpServer() as Server)
      .post('/users')
      .send({
        username: 'grace',
        email: 'grace@example.com',
        password: 'Secret123!',
      })
      .expect(201);
    const { id } = created.body as UserResponse;

    const found = await request(app.getHttpServer() as Server)
      .get(`/users/${id}`)
      .expect(200);
    expect(found.body as UserResponse).toMatchObject({
      id,
      username: 'grace',
      email: 'grace@example.com',
    });

    const updated = await request(app.getHttpServer() as Server)
      .patch(`/users/${id}`)
      .send({ username: 'grace hopper' })
      .expect(200);
    expect(updated.body as UserResponse).toMatchObject({
      id,
      username: 'grace hopper',
      email: 'grace@example.com',
    });

    const listed = await request(app.getHttpServer() as Server)
      .get('/users')
      .expect(200);
    expect((listed.body as ListUsersResponse).data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id,
          username: 'grace hopper',
          email: 'grace@example.com',
        }),
      ]),
    );

    await request(app.getHttpServer() as Server)
      .delete(`/users/${id}`)
      .expect(204);

    await request(app.getHttpServer() as Server).get(`/users/${id}`).expect(404);
  });
});

async function clearUsers(db: Firestore): Promise<void> {
  const snapshot = await db.collection('users').get();

  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

async function poll<T>(
  read: () => Promise<T | undefined>,
  attempts = 20,
): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const value = await read();

    if (value !== undefined) {
      return value;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('Se agotó el tiempo esperando la actualización asíncrona');
}
