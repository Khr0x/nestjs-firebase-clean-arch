import { User } from '../../domain/entities/user.entity';

export type UserOutput = {
  id: string;
  username: string;
  email: string;
};

export function toUserOutput(user: User): UserOutput {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
