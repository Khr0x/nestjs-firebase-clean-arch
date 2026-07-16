import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AssignGeneratedPasswordUseCase } from '../../application/use-cases/assign-generated-password.use-case';
import { UserCreatedEvent } from '../../domain/events/user-created.event';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    private readonly assignGeneratedPassword: AssignGeneratedPasswordUseCase,
  ) {}

  @OnEvent('user.created', { async: true })
  async handle(event: UserCreatedEvent): Promise<void> {
    if (event.hasPassword) {
      return;
    }

    try {
      await this.assignGeneratedPassword.execute(event.userId);
    } catch (error) {
      this.logger.error(
        `Failed to assign generated password for user ${event.userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
