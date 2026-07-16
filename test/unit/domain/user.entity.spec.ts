import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { InvalidUserDataError } from '../../../src/domain/errors/invalid-user-data.error';
import { UserCreatedEvent } from '../../../src/domain/events/user-created.event';
import { User } from '../../../src/domain/entities/user.entity';

describe('entidad User', () => {
  it('crea un usuario válido con password', () => {
    const user = User.create({
      id: 'user-1',
      username: 'cristian',
      email: 'cristian@example.com',
      password: 'secret123',
    });

    expect(user).toMatchObject({
      id: 'user-1',
      username: 'cristian',
      email: 'cristian@example.com',
      password: 'secret123',
    });
    expect(typeof user.createdAt).toBe('string');
    expect(typeof user.updatedAt).toBe('string');
    expect(user.createdAt).toBe(user.updatedAt);
    expect(user.hasPassword()).toBe(true);
  });

  it('crea un usuario válido sin password', () => {
    const user = User.create({
      id: 'user-1',
      username: 'cristian',
      email: 'cristian@example.com',
    });

    expect(user.password).toBeUndefined();
    expect(user.createdAt).toEqual(expect.any(String));
    expect(user.updatedAt).toEqual(expect.any(String));
    expect(user.hasPassword()).toBe(false);
  });

  it.each([
    ['id', { id: '', username: 'cristian', email: 'cristian@example.com' }],
    ['username', { id: 'user-1', username: '', email: 'cristian@example.com' }],
    ['email', { id: 'user-1', username: 'cristian', email: '' }],
  ])('falla cuando %s está vacío', (_field, props) => {
    expect(() => User.create(props)).toThrow(InvalidUserDataError);
  });

  it('falla cuando el email es inválido', () => {
    expect(() =>
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'not-an-email',
      }),
    ).toThrow(InvalidUserDataError);
  });

  it('falla cuando el password proporcionado está vacío', () => {
    expect(() =>
      User.create({
        id: 'user-1',
        username: 'cristian',
        email: 'cristian@example.com',
        password: ' ',
      }),
    ).toThrow(InvalidUserDataError);
  });
});

describe('evento UserCreatedEvent', () => {
  it('conserva el id del usuario y la bandera de password', () => {
    const event = new UserCreatedEvent('user-1', false);

    expect(event.userId).toBe('user-1');
    expect(event.hasPassword).toBe(false);
  });
});

describe('arquitectura de dominio', () => {
  it('no importa dependencias de framework ni infraestructura', () => {
    const domainDir = join(process.cwd(), 'src/domain');
    const forbiddenImports = /from ['"](?:@nestjs\/|firebase-admin|bcrypt)/;

    const files = collectTsFiles(domainDir);

    expect(files).not.toHaveLength(0);
    for (const file of files) {
      expect(readFileSync(file, 'utf8')).not.toMatch(forbiddenImports);
    }
  });
});

function collectTsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return collectTsFiles(path);
    }

    return path.endsWith('.ts') ? [path] : [];
  });
}
