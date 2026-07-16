import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../src/config/firebase.config';
import { User } from '../../src/domain/entities/user.entity';
import {
  FIRESTORE_DB,
  FirebaseModule,
} from '../../src/infrastructure/firebase/firebase.module';
import { FirestoreUserRepository } from '../../src/infrastructure/firebase/firestore-user.repository';

const describeWithEmulator = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

describeWithEmulator('repositorio de usuarios en Firestore', () => {
  let module: TestingModule;
  let db: Firestore;
  let repo: FirestoreUserRepository;

  beforeAll(async () => {
    process.env.FIREBASE_PROJECT_ID ??= 'demo-nestjs-firebase-clean-arch';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [firebaseConfig],
        }),
        FirebaseModule,
      ],
      providers: [FirestoreUserRepository],
    }).compile();

    db = module.get<Firestore>(FIRESTORE_DB);
    repo = module.get(FirestoreUserRepository);
  });

  beforeEach(async () => {
    await clearUsers(db);
  });

  afterAll(async () => {
    await clearUsers(db);
    await module.close();
  });

  it('crea, lee, lista, actualiza y elimina usuarios', async () => {
    const ada = User.create({
      id: 'user-ada',
      username: 'Ada',
      email: 'ada@example.com',
    });
    const grace = User.create({
      id: 'user-grace',
      username: 'Grace',
      email: 'grace@example.com',
      password: 'existing-hash',
    });

    await repo.create(grace);
    await repo.create(ada);

    await expect(repo.findById('missing')).resolves.toBeNull();
    await expect(repo.findById('user-ada')).resolves.toEqual(ada);
    await expect(repo.findByEmail('ada@example.com')).resolves.toEqual(ada);
    await expect(repo.findByEmail('missing@example.com')).resolves.toBeNull();
    await expect(repo.findAll(1, 1)).resolves.toEqual([ada]);
    await expect(repo.findAll(2, 1)).resolves.toEqual([grace]);

    const updated = User.create({
      id: 'user-ada',
      username: 'Ada Lovelace',
      email: 'lovelace@example.com',
      createdAt: ada.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await repo.update(updated);
    await expect(repo.findById('user-ada')).resolves.toEqual(updated);

    await repo.updatePassword('user-ada', 'generated-hash');
    const userWithPassword = await repo.findById('user-ada');
    expect(userWithPassword).toMatchObject({
      id: 'user-ada',
      username: 'Ada Lovelace',
      email: 'lovelace@example.com',
      password: 'generated-hash',
      createdAt: updated.createdAt,
      updatedAt: userWithPassword?.updatedAt,
    });

    await repo.delete('user-ada');
    await expect(repo.findById('user-ada')).resolves.toBeNull();
  });
});

async function clearUsers(db: Firestore): Promise<void> {
  const snapshot = await db.collection('users').get();

  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}
