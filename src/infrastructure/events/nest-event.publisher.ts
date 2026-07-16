import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { EventPublisher } from '../../domain/ports/event-publisher';

@Injectable()
export class NestEventPublisher implements EventPublisher {
  constructor(private readonly events: EventEmitter2) {}

  publish(event: UserCreatedEvent): Promise<void> {
    this.events.emit('user.created', event);
    return Promise.resolve();
  }
}
