import { randomUUID } from 'node:crypto';
import { CreateUserInput } from '../dtos/create-user.input';
import { toUserOutput, UserOutput } from '../dtos/user.output';
import { User } from '../../domain/entities/user.entity';
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error';
import { InvalidUserDataError } from '../../domain/errors/invalid-user-data.error';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { UserRepository } from '../../domain/ports/user.repository';

export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly events: EventPublisher,
  ) {}

  async execute(input: CreateUserInput): Promise<UserOutput> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);

    if (existing) {
      throw new EmailAlreadyInUseError(email);
    }

    if (input.password !== undefined && !input.password.trim()) {
      throw new InvalidUserDataError('La contraseña no puede estar vacía');
    }

    const password = input.password !== undefined
      ? await this.hasher.hash(input.password)
      : undefined;
    const user = User.create({
      id: randomUUID(),
      username: input.username,
      email,
      password,
    });
    const created = await this.users.create(user);

    await this.events.publish(
      new UserCreatedEvent(created.id, created.hasPassword()),
    );

    return toUserOutput(created);
  }
}
