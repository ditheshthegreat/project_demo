/**
 * @file messageRepository.impl.ts
 * @module Chat/Infrastructure
 * @layer Infrastructure
 * @description Message Repository Implementation (Prisma Adapter)
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { Message, MessageType } from '../../domain/entities/message.entity';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';

export class MessageRepositoryImpl implements IMessageRepository {
  async create(message: Message): Promise<Message> {
    const created = await prisma.chatMessage.create({
      data: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        isDeleted: message.isDeleted,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Message | null> {
    const message = await prisma.chatMessage.findUnique({
      where: { id },
    });

    return message ? this.mapToDomain(message) : null;
  }

  async findByConversationId(
    conversationId: string,
    limit: number,
    offset: number
  ): Promise<Message[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return messages.map(this.mapToDomain);
  }

  async countByConversationId(conversationId: string): Promise<number> {
    return await prisma.chatMessage.count({
      where: {
        conversationId,
        isDeleted: false,
      },
    });
  }

  async findByConversationAndSender(
    conversationId: string,
    senderId: string,
    limit: number,
    offset: number
  ): Promise<Message[]> {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        senderId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return messages.map(this.mapToDomain);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.chatMessage.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.chatMessage.count({
      where: { id },
    });
    return count > 0;
  }

  async markAsRead(id: string): Promise<Message> {
    const updated = await prisma.chatMessage.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return this.mapToDomain(updated);
  }

  private mapToDomain(prismaMessage: any): Message {
    return Message.create({
      id: prismaMessage.id,
      conversationId: prismaMessage.conversationId,
      senderId: prismaMessage.senderId,
      content: prismaMessage.content,
      type: prismaMessage.type as MessageType,
      mediaUrl: prismaMessage.mediaUrl,
      mediaType: prismaMessage.mediaType,
      readAt: prismaMessage.readAt,
      isDeleted: prismaMessage.isDeleted,
      createdAt: prismaMessage.createdAt,
    });
  }
}
