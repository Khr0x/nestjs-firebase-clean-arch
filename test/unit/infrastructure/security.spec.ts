import { ConfigService } from '@nestjs/config';
import { BcryptPasswordHasher } from '../../../src/infrastructure/security/bcrypt-password.hasher';
import { CryptoPasswordGenerator } from '../../../src/infrastructure/security/crypto-password.generator';

describe('generador de passwords con crypto', () => {
  const generator = new CryptoPasswordGenerator();
  const passwordPolicy =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+[\]{}]).{8,}$/;

  it('genera un password de 16 caracteres con todas las clases requeridas', () => {
    const password = generator.generate();

    expect(password).toHaveLength(16);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()\-_=+[\]{}]/);
    expect(password).toMatch(passwordPolicy);
  });

  it('no genera el mismo password dos veces', () => {
    expect(generator.generate()).not.toBe(generator.generate());
  });
});

describe('hasher de passwords con bcrypt', () => {
  const hasher = new BcryptPasswordHasher(
    new ConfigService({ security: { bcryptSaltRounds: 4 } }),
  );

  it('hashea y compara passwords', async () => {
    const hash = await hasher.hash('plain-password');

    expect(hash).not.toBe('plain-password');
    await expect(hasher.compare('plain-password', hash)).resolves.toBe(true);
    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});
