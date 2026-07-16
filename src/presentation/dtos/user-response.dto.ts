import { UserOutput } from '../../application/dtos/user.output';

export class UserResponseDto {
  id!: string;
  username!: string;
  email!: string;
  createdAt!: string;
  updatedAt!: string;

  static from(user: UserOutput): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
