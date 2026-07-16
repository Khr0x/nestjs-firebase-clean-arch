export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly hasPassword: boolean,
  ) {}
}
