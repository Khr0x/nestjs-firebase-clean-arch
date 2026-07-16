import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
}));
