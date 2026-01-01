/**
 * @file blockedUser.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description BlockedUser Entity - Represents a user blocking relationship
 */

export interface BlockedUserProps {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

export class BlockedUser {
  constructor(private readonly props: BlockedUserProps) {}

  public static create(props: Partial<BlockedUserProps> & {
    blockerId: string;
    blockedId: string;
  }): BlockedUser {
    if (props.blockerId === props.blockedId) {
      throw new Error('Cannot block yourself');
    }

    return new BlockedUser({
      id: props.id || '',
      blockerId: props.blockerId,
      blockedId: props.blockedId,
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get blockerId(): string {
    return this.props.blockerId;
  }

  public get blockedId(): string {
    return this.props.blockedId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      blockerId: this.blockerId,
      blockedId: this.blockedId,
      createdAt: this.createdAt,
    };
  }
}
