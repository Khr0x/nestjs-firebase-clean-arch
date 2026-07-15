import { User } from '../../domain/entities/user.entity';
import { InvalidUserDataError } from '../../domain/errors/invalid-user-data.error';

export type UserDocument = {
  username: string;
  email: string;
  password: string | null;
};

export class UserMapper {
  static toDocument(user: User): UserDocument {
    return {
      username: user.username,
      email: user.email,
      password: user.password ?? null,
    };
  }

  static toEntity(id: string, data: unknown): User {
    if (!isUserDocument(data)) {
      throw new InvalidUserDataError('Firestore user document is invalid');
    }

    return User.create({
      id,
      username: data.username,
      email: data.email,
      password: data.password ?? undefined,
    });
  }
}

function isUserDocument(value: unknown): value is UserDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.username === 'string' &&
    typeof data.email === 'string' &&
    (typeof data.password === 'string' || data.password === null)
  );
}
