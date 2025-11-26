export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date
  ) {}

  public static create(userId: string, email: string): UserRegisteredEvent {
    return new UserRegisteredEvent(userId, email, new Date());
  }
}
