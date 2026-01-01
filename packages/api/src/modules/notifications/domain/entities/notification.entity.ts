/**
 * @file notification.entity.ts
 * @module Notifications/Domain
 * @layer Domain
 * @description Notification Entity - Represents a notification
 */

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  MESSAGE = 'MESSAGE',
  FEED_REPORT = 'FEED_REPORT',
  SYSTEM = 'SYSTEM',
}

export interface NotificationProps {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

export class Notification {
  constructor(private readonly props: NotificationProps) {}

  public static create(props: Partial<NotificationProps> & {
    userId: string;
    actorId: string;
    type: NotificationType;
    entityId: string;
    title: string;
    body: string;
  }): Notification {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!props.actorId || props.actorId.trim().length === 0) {
      throw new Error('Actor ID is required');
    }

    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!props.body || props.body.trim().length === 0) {
      throw new Error('Body is required');
    }

    if (!props.entityId || props.entityId.trim().length === 0) {
      throw new Error('Entity ID is required');
    }

    if (!Object.values(NotificationType).includes(props.type)) {
      throw new Error('Invalid notification type');
    }

    return new Notification({
      id: props.id || '',
      userId: props.userId.trim(),
      actorId: props.actorId.trim(),
      type: props.type,
      entityId: props.entityId.trim(),
      title: props.title.trim(),
      body: props.body.trim(),
      isRead: props.isRead ?? false,
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get actorId(): string {
    return this.props.actorId;
  }

  public get type(): NotificationType {
    return this.props.type;
  }

  public get entityId(): string {
    return this.props.entityId;
  }

  public get title(): string {
    return this.props.title;
  }

  public get body(): string {
    return this.props.body;
  }

  public get isRead(): boolean {
    return this.props.isRead;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public markAsRead(): void {
    (this.props as any).isRead = true;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      actorId: this.actorId,
      type: this.type,
      entityId: this.entityId,
      title: this.title,
      body: this.body,
      isRead: this.isRead,
      createdAt: this.createdAt,
    };
  }
}
