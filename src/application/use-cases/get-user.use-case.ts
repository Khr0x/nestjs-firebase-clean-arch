import { toUserOutput, UserOutput } from '../dtos/user.output';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRepository } from '../../domain/ports/user.repository';

export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<UserOutput> {
    const user = await this.users.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return toUserOutput(user);
  }
}
