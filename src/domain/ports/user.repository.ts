import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<User[]>;
  update(user: User): Promise<void>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  delete(id: string): Promise<void>;
}
