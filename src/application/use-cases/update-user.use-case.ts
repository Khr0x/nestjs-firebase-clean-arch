import { UpdateUserInput } from '../dtos/update-user.input';
import { toUserOutput, UserOutput } from '../dtos/user.output';
import { User } from '../../domain/entities/user.entity';
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error';
import { InvalidUserDataError } from '../../domain/errors/invalid-user-data.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRepository } from '../../domain/ports/user.repository';

export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string, input: UpdateUserInput): Promise<UserOutput> {
    const email = input.email?.trim().toLowerCase();

    if (input.username === undefined && input.email === undefined) {
      throw new InvalidUserDataError('No hay datos de usuario para actualizar');
    }

    const current = await this.users.findById(id);

    if (!current) {
      throw new UserNotFoundError(id);
    }

    if (email !== undefined && email !== current.email) {
      const existing = await this.users.findByEmail(email);

      if (existing && existing.id !== id) {
        throw new EmailAlreadyInUseError(email);
      }
    }

    const updated = User.create({
      id: current.id,
      username: input.username ?? current.username,
      email: email ?? current.email,
      password: current.password,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.users.update(updated);

    return toUserOutput(updated);
  }
}
