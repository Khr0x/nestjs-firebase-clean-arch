import { toUserOutput, UserOutput } from '../dtos/user.output';
import { UserRepository } from '../../domain/ports/user.repository';

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(page = 1, limit = 10): Promise<UserOutput[]> {
    const users = await this.users.findAll(
      Math.max(page, 1),
      Math.min(Math.max(limit, 1), 100),
    );

    return users.map(toUserOutput);
  }
}
