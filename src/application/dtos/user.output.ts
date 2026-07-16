import { User } from '../../domain/entities/user.entity';

export type UserOutput = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export function toUserOutput(user: User): UserOutput {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
