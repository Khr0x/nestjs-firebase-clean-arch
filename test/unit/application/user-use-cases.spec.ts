import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { AssignGeneratedPasswordUseCase } from '../../../src/application/use-cases/assign-generated-password.use-case';
import { CreateUserUseCase } from '../../../src/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../../src/application/use-cases/delete-user.use-case';
import { GetUserUseCase } from '../../../src/application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../../src/application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../../../src/application/use-cases/update-user.use-case';
import { User } from '../../../src/domain/entities/user.entity';
import { EmailAlreadyInUseError } from '../../../src/domain/errors/email-already-in-use.error';
import { UserNotFoundError } from '../../../src/domain/errors/user-not-found.error';
import { UserCreatedEvent } from '../../../src/domain/events/user-created.event';
import { EventPublisher } from '../../../src/domain/ports/event-publisher';
import { PasswordGenerator } from '../../../src/domain/ports/password-generator';
import { PasswordHasher } from '../../../src/domain/ports/password-hasher';
import { UserRepository } from '../../../src/domain/ports/user.repository';

describe('CreateUserUseCase', () => {
  it('crea usuario con password hasheado y publica evento', async () => {
    const repo = new InMemoryUserRepository();
    const hasher = new FakePasswordHasher();
    const events = new FakeEventPublisher();
    const useCase = new CreateUserUseCase(repo, hasher, events);

    const output = await useCase.execute({
      username: 'cristian',
      email: 'cristian@example.com',
      password: 'secret123',
    });
    const saved = await repo.findById(output.id);

    expect(output).toEqual({
      id: output.id,
      username: 'cristian',
      email: 'cristian@example.com',
    });
    expect(saved?.password).toBe('hashed:secret123');
    expect(events.published).toEqual([new UserCreatedEvent(output.id, true)]);
  });

  it('crea usuario sin password y publica evento', async () => {
    const repo = new InMemoryUserRepository();
    const events = new FakeEventPublisher();
    const useCase = new CreateUserUseCase(
      repo,
      new FakePasswordHasher(),
      events,
    );

    const output = await useCase.execute({
      username: 'cristian',
      email: 'cristian@example.com',
    });
    const saved = await repo.findById(output.id);

    expect(saved?.password).toBeUndefined();
    expect(events.published).toEqual([new UserCreatedEvent(output.id, false)]);
  });

  it('rechaza email duplicado', async () => {
    const repo = new InMemoryUserRepository([
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
      }),
    ]);
    const useCase = new CreateUserUseCase(
      repo,
      new FakePasswordHasher(),
      new FakeEventPublisher(),
    );

    await expect(
      useCase.execute({
        username: 'otro',
        email: 'cristian@example.com',
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
  });
});

describe('AssignGeneratedPasswordUseCase', () => {
  it('genera, hashea y actualiza el password cuando falta', async () => {
    const repo = new InMemoryUserRepository([
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
      }),
    ]);
    const generator = new FakePasswordGenerator();
    const useCase = new AssignGeneratedPasswordUseCase(
      repo,
      generator,
      new FakePasswordHasher(),
    );

    await useCase.execute('user-1');

    expect((await repo.findById('user-1'))?.password).toBe(
      'hashed:generated-password',
    );
    expect(generator.calls).toBe(1);
    expect(repo.updatePasswordCalls).toBe(1);
  });

  it('no hace nada si el usuario no existe o ya tiene password', async () => {
    const repo = new InMemoryUserRepository([
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
        password: 'hashed:secret123',
      }),
    ]);
    const generator = new FakePasswordGenerator();
    const useCase = new AssignGeneratedPasswordUseCase(
      repo,
      generator,
      new FakePasswordHasher(),
    );

    await useCase.execute('missing');
    await useCase.execute('user-1');

    expect(generator.calls).toBe(0);
    expect(repo.updatePasswordCalls).toBe(0);
  });
});

describe('CRUD use cases', () => {
  it('obtiene, lista, actualiza y elimina usuarios sin exponer password', async () => {
    const repo = new InMemoryUserRepository([
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
        password: 'hashed:secret123',
      }),
    ]);

    await expect(new GetUserUseCase(repo).execute('user-1')).resolves.toEqual({
      id: 'user-1',
      username: 'cristian',
      email: 'cristian@example.com',
    });
    expect(await new ListUsersUseCase(repo).execute()).toEqual([
      {
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
      },
    ]);

    await expect(
      new UpdateUserUseCase(repo).execute('user-1', {
        username: 'cris',
        email: 'cris@example.com',
      }),
    ).resolves.toEqual({
      id: 'user-1',
      username: 'cris',
      email: 'cris@example.com',
    });
    expect((await repo.findById('user-1'))?.password).toBe('hashed:secret123');

    await new DeleteUserUseCase(repo).execute('user-1');
    expect(await repo.findById('user-1')).toBeNull();
  });

  it('aplica page/limit al listar, con limit default y máximo', async () => {
    const repo = new InMemoryUserRepository(
      Array.from({ length: 101 }, (_, index) =>
        User.create({
          id: `user-${index}`,
          username: `user-${index}`,
          email: `user-${index}@example.com`,
        }),
      ),
    );
    const useCase = new ListUsersUseCase(repo);

    expect(await useCase.execute()).toHaveLength(10);
    expect(repo.lastPage).toBe(1);
    expect(repo.lastLimit).toBe(10);

    expect((await useCase.execute(2, 10))[0]).toEqual({
      id: 'user-10',
      username: 'user-10',
      email: 'user-10@example.com',
    });
    expect(repo.lastPage).toBe(2);
    expect(repo.lastLimit).toBe(10);

    expect(await useCase.execute(1, 150)).toHaveLength(100);
    expect(repo.lastLimit).toBe(100);
  });

  it('rechaza email duplicado al actualizar', async () => {
    const repo = new InMemoryUserRepository([
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
      }),
      User.create({
        id: 'user-2',
        username: 'ana',
        email: 'ana@example.com',
      }),
    ]);

    await expect(
      new UpdateUserUseCase(repo).execute('user-1', {
        email: 'ana@example.com',
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
  });

  it('lanza UserNotFoundError cuando get/update/delete no encuentran usuario', async () => {
    const repo = new InMemoryUserRepository();

    await expect(new GetUserUseCase(repo).execute('missing')).rejects.toThrow(
      UserNotFoundError,
    );
    await expect(
      new UpdateUserUseCase(repo).execute('missing', { username: 'cris' }),
    ).rejects.toThrow(UserNotFoundError);
    await expect(new DeleteUserUseCase(repo).execute('missing')).rejects.toThrow(
      UserNotFoundError,
    );
  });
});

describe('arquitectura de aplicación', () => {
  it('no importa dependencias de framework ni infraestructura', () => {
    const appDir = join(process.cwd(), 'src/application');
    const forbiddenImports = /from ['"](?:@nestjs\/|firebase-admin|bcrypt)/;

    for (const file of collectTsFiles(appDir)) {
      expect(readFileSync(file, 'utf8')).not.toMatch(forbiddenImports);
    }
  });
});

class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();
  lastPage?: number;
  lastLimit?: number;
  updatePasswordCalls = 0;

  constructor(users: User[] = []) {
    for (const user of users) {
      this.users.set(user.id, user);
    }
  }

  create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(
      [...this.users.values()].find((user) => user.email === email) ?? null,
    );
  }

  findAll(page: number, limit: number): Promise<User[]> {
    this.lastPage = page;
    this.lastLimit = limit;
    return Promise.resolve(
      [...this.users.values()].slice((page - 1) * limit, page * limit),
    );
  }

  update(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }

  updatePassword(id: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(id);

    if (!user) {
      return Promise.resolve();
    }

    this.updatePasswordCalls++;
    this.users.set(
      id,
      User.create({
        id: user.id,
        username: user.username,
        email: user.email,
        password: hashedPassword,
      }),
    );
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }
}

class FakePasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return Promise.resolve(hashed === `hashed:${plain}`);
  }
}

class FakePasswordGenerator implements PasswordGenerator {
  calls = 0;

  generate(): string {
    this.calls++;
    return 'generated-password';
  }
}

class FakeEventPublisher implements EventPublisher {
  readonly published: UserCreatedEvent[] = [];

  publish(event: UserCreatedEvent): Promise<void> {
    this.published.push(event);
    return Promise.resolve();
  }
}

function collectTsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return collectTsFiles(path);
    }

    return path.endsWith('.ts') ? [path] : [];
  });
}
