/**
 * @file message.entity.ts
 * @module Chat/Domain
 * @layer Domain
 * @description Message Entity - Chat message domain model
 */

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export interface MessageProps {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  mediaUrl?: string | null;
  mediaType?: string | null;
  readAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
}

export class Message {
  constructor(private readonly props: MessageProps) {}

  public static create(props: Partial<MessageProps> & {
    id: string;
    conversationId: string;
    senderId: string;
  }): Message {
    const type = props.type || MessageType.TEXT;

    // For TEXT messages, content is required
    if (type === MessageType.TEXT) {
      if (!props.content || props.content.trim().length === 0) {
        throw new Error('Message content cannot be empty');
      }
      if (props.content.length > 10000) {
        throw new Error('Message content exceeds maximum length');
      }
    }

    // For media messages (IMAGE/AUDIO), mediaUrl is required
    if (type === MessageType.IMAGE || type === MessageType.AUDIO) {
      if (!props.mediaUrl) {
        throw new Error('Media URL is required for media messages');
      }
    }

    return new Message({
      id: props.id,
      conversationId: props.conversationId,
      senderId: props.senderId,
      content: props.content ? props.content.trim() : null,
      type: type,
      mediaUrl: props.mediaUrl || null,
      mediaType: props.mediaType || null,
      isDeleted: props.isDeleted || false,
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get conversationId(): string {
    return this.props.conversationId;
  }

  public get senderId(): string {
    return this.props.senderId;
  }

  public get content(): string | null {
    return this.props.content;
  }

  public get type(): MessageType {
    return this.props.type;
  }

  public get mediaUrl(): string | null | undefined {
    return this.props.mediaUrl;
  }

  public get mediaType(): string | null | undefined {
    return this.props.mediaType;
  }

  public get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  public isSentBy(userId: string): boolean {
    return this.senderId === userId;
  }

  public isRead(): boolean {
    return this.readAt !== null && this.readAt !== undefined;
  }

  public isText(): boolean {
    return this.type === MessageType.TEXT;
  }

  public isImage(): boolean {
    return this.type === MessageType.IMAGE;
  }

  public isAudio(): boolean {
    return this.type === MessageType.AUDIO;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      type: this.type,
      mediaUrl: this.mediaUrl,
      mediaType: this.mediaType,
      readAt: this.readAt,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
    };
  }
}
