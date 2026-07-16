import { PasswordGenerator } from '../../domain/ports/password-generator';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { UserRepository } from '../../domain/ports/user.repository';

export class AssignGeneratedPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly generator: PasswordGenerator,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user || user.hasPassword()) {
      return;
    }

    const password = this.generator.generate();
    const hash = await this.hasher.hash(password);

    await this.users.updatePassword(userId, hash);
  }
}
