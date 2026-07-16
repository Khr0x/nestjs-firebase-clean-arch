import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserUseCase } from '../src/application/use-cases/create-user.use-case';
import { AssignGeneratedPasswordUseCase } from '../src/application/use-cases/assign-generated-password.use-case';
import { GetUserUseCase } from '../src/application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../src/application/use-cases/update-user.use-case';
import { EmailAlreadyInUseError } from '../src/domain/errors/email-already-in-use.error';
import { UserNotFoundError } from '../src/domain/errors/user-not-found.error';
import { UserCreatedEvent } from '../src/domain/events/user-created.event';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter';

describe('Users API (e2e)', () => {
  const userId = '2b22e97e-92f4-4dc5-9e15-e3ddc4b9bbf5';
  let app: INestApplication;
  let createUser: { execute: jest.Mock };
  let assignGeneratedPassword: { execute: jest.Mock };
  let getUser: { execute: jest.Mock };
  let updateUser: { execute: jest.Mock };

  beforeEach(async () => {
    createUser = {
      execute: jest.fn().mockResolvedValue({
        id: userId,
        username: 'cristian',
        email: 'cristian@example.com',
        createdAt: '2026-07-15T00:00:00.000Z',
        updatedAt: '2026-07-15T00:00:00.000Z',
      }),
    };
    assignGeneratedPassword = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    getUser = {
      execute: jest.fn().mockRejectedValue(new UserNotFoundError('missing')),
    };
    updateUser = {
      execute: jest
        .fn()
        .mockRejectedValue(new EmailAlreadyInUseError('used@example.com')),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CreateUserUseCase)
      .useValue(createUser)
      .overrideProvider(AssignGeneratedPasswordUseCase)
      .useValue(assignGeneratedPassword)
      .overrideProvider(GetUserUseCase)
      .useValue(getUser)
      .overrideProvider(UpdateUserUseCase)
      .useValue(updateUser)
      .compile();

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
  });

  afterEach(async () => {
    await app?.close();
  });

  it('rechaza body inválido al crear', () => {
    return request(app.getHttpServer() as Server)
      .post('/users')
      .send({ username: '', email: 'invalid' })
      .expect(400);
  });

  it('rechaza password sin mayúscula o símbolo', () => {
    return request(app.getHttpServer() as Server)
      .post('/users')
      .send({
        username: 'cristian',
        email: 'cristian@example.com',
        password: 'secret123',
      })
      .expect(400);
  });

  it('crea usuario sin exponer password', async () => {
    await request(app.getHttpServer() as Server)
      .post('/users')
      .send({
        username: 'cristian',
        email: 'cristian@example.com',
        password: 'Secret123!',
      })
      .expect(201)
      .expect({
        id: userId,
        username: 'cristian',
        email: 'cristian@example.com',
        createdAt: '2026-07-15T00:00:00.000Z',
        updatedAt: '2026-07-15T00:00:00.000Z',
      });

    expect(createUser.execute).toHaveBeenCalledWith({
      username: 'cristian',
      email: 'cristian@example.com',
      password: 'Secret123!',
    });
  });

  it('rechaza password en patch', () => {
    return request(app.getHttpServer() as Server)
      .patch(`/users/${userId}`)
      .send({ password: 'secret123' })
      .expect(400);
  });

  it('traduce usuario inexistente a 404', () => {
    return request(app.getHttpServer() as Server)
      .get(`/users/${userId}`)
      .expect(404);
  });

  it('traduce email duplicado a 409', () => {
    return request(app.getHttpServer() as Server)
      .patch(`/users/${userId}`)
      .send({ email: 'used@example.com' })
      .expect(409);
  });

  it('rechaza ids que no son uuid', () => {
    return request(app.getHttpServer() as Server)
      .get('/users/not-a-uuid')
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          message: 'El id debe ser un UUID válido',
        });
      });
  });

  it('conecta el evento user.created con la asignación de password', async () => {
    app.get(EventEmitter2).emit('user.created', new UserCreatedEvent(userId, false));

    await new Promise((resolve) => setImmediate(resolve));

    expect(assignGeneratedPassword.execute).toHaveBeenCalledWith(userId);
  });
});
