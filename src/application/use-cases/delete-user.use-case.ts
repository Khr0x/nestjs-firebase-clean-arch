import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRepository } from '../../domain/ports/user.repository';

export class DeleteUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.users.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    await this.users.delete(id);
  }
}
