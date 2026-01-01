/**
 * @file conversationParticipant.entity.ts
 * @module Chat/Domain
 * @layer Domain
 * @description ConversationParticipant Entity - Read-only representation of conversation participants
 */

export interface ConversationParticipantProps {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: Date;
}

export class ConversationParticipant {
  constructor(private readonly props: ConversationParticipantProps) {}

  public static create(props: ConversationParticipantProps): ConversationParticipant {
    return new ConversationParticipant(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get conversationId(): string {
    return this.props.conversationId;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get joinedAt(): Date {
    return this.props.joinedAt;
  }

  public isUser(userId: string): boolean {
    return this.userId === userId;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      conversationId: this.conversationId,
      userId: this.userId,
      joinedAt: this.joinedAt,
    };
  }
}
