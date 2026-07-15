import { UserCreatedEvent } from '../events/user-created.event';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventPublisher {
  publish(event: UserCreatedEvent): Promise<void>;
}
