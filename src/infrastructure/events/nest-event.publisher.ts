import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { EventPublisher } from '../../domain/ports/event-publisher';

@Injectable()
export class NestEventPublisher implements EventPublisher {
  constructor(private readonly events: EventEmitter2) {}

  async publish(event: UserCreatedEvent): Promise<void> {
    await this.events.emitAsync('user.created', event);
  }
}
