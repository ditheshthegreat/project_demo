/**
 * @file conversation.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description Conversation Entity - Message Thread Reference
 */

export interface ConversationProps {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Conversation {
  constructor(private readonly props: ConversationProps) {}

  public static create(props: Partial<ConversationProps> & { id: string; participant1Id: string; participant2Id: string }): Conversation {
    if (props.participant1Id === props.participant2Id) {
      throw new Error('Cannot create conversation with same user');
    }

    return new Conversation({
      id: props.id,
      participant1Id: props.participant1Id,
      participant2Id: props.participant2Id,
      lastMessageAt: props.lastMessageAt || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get participant1Id(): string {
    return this.props.participant1Id;
  }

  public get participant2Id(): string {
    return this.props.participant2Id;
  }

  public get lastMessageAt(): Date | null {
    return this.props.lastMessageAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isParticipant(userId: string): boolean {
    return this.participant1Id === userId || this.participant2Id === userId;
  }

  public getOtherParticipant(userId: string): string | null {
    if (this.participant1Id === userId) {
      return this.participant2Id;
    }
    if (this.participant2Id === userId) {
      return this.participant1Id;
    }
    return null;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      participant1Id: this.participant1Id,
      participant2Id: this.participant2Id,
      lastMessageAt: this.lastMessageAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
