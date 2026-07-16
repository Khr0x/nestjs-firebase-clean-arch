import { User } from '../../domain/entities/user.entity';
import { InvalidUserDataError } from '../../domain/errors/invalid-user-data.error';

export type UserDocument = {
  username: string;
  email: string;
  password: string | null;
  createdAt: string;
  updatedAt: string;
};

export class UserMapper {
  static toDocument(user: User): UserDocument {
    return {
      username: user.username,
      email: user.email,
      password: user.password ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toEntity(id: string, data: unknown): User {
    if (!isUserDocument(data)) {
      throw new InvalidUserDataError('El documento de usuario en Firestore no es válido');
    }

    return User.create({
      id,
      username: data.username,
      email: data.email,
      password: data.password ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
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
    (typeof data.password === 'string' || data.password === null) &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string'
  );
}
