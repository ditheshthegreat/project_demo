/**
 * @file markMessageAsRead.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Mark Message As Read Use Case
 */

import { Message } from '../../domain/entities/message.entity';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class MarkMessageAsReadUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(input: {
    messageId: string;
    userId: string;
  }): Promise<Message> {
    // Security: Check if user is soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { isDeleted: true },
    });
    
    if (!user || user.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Get message
    const message = await this.messageRepository.findById(input.messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Verify user is participant in conversation
    const isParticipant = await this.conversationRepository.isParticipant(
      message.conversationId,
      input.userId
    );
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    // Don't mark own messages as read
    if (message.senderId === input.userId) {
      return message;
    }

    // Security: Check if users are blocked
    const isBlocked = await this.checkIfUsersBlocked(input.userId, message.senderId);
    if (isBlocked) {
      throw new Error('Cannot interact with blocked user');
    }

    // Mark as read
    const updatedMessage = await this.messageRepository.markAsRead(input.messageId);

    return updatedMessage;
  }

  /**
   * Check if two users have blocked each other
   */
  private async checkIfUsersBlocked(userId1: string, userId2: string): Promise<boolean> {
    const blockedFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId1, friendId: userId2, status: 'blocked' },
          { userId: userId2, friendId: userId1, status: 'blocked' },
        ],
      },
    });

    return blockedFriendship !== null;
  }
}
