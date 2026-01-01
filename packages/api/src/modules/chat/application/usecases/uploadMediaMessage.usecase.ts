/**
 * @file uploadMediaMessage.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Upload Media Message Use Case
 */

import { Message, MessageType } from '../../domain/entities/message.entity';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { s3Service } from '../../../../shared/infra/storage/s3.service';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class UploadMediaMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(input: {
    conversationId: string;
    senderId: string;
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
    type: MessageType.IMAGE | MessageType.AUDIO;
    caption?: string;
  }): Promise<Message> {
    // Security: Check if sender is soft-deleted
    const sender = await prisma.user.findUnique({
      where: { id: input.senderId },
      select: { isDeleted: true },
    });
    
    if (!sender || sender.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify conversation exists
    const conversation = await this.conversationRepository.findById(input.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify sender is participant
    const isParticipant = await this.conversationRepository.isParticipant(
      input.conversationId,
      input.senderId
    );
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    // Security: Check if users are blocked
    const participants = await this.conversationRepository.getParticipants(input.conversationId);
    const otherParticipantIds = participants
      .filter(p => p.userId !== input.senderId)
      .map(p => p.userId);

    for (const otherUserId of otherParticipantIds) {
      const isBlocked = await this.checkIfUsersBlocked(input.senderId, otherUserId);
      if (isBlocked) {
        throw new Error('Cannot send message to blocked user');
      }
    }

    // Validate file size (10MB for images, 25MB for audio)
    const maxSize = input.type === MessageType.IMAGE ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    if (input.file.size > maxSize) {
      throw new Error(`File size exceeds limit (${maxSize / (1024 * 1024)}MB)`);
    }

    // Validate MIME type
    const validMimeTypes = input.type === MessageType.IMAGE
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      : ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'];

    if (!validMimeTypes.includes(input.file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${validMimeTypes.join(', ')}`);
    }

    // Generate storage key with appropriate folder
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = input.file.originalname.split('.').pop() || (input.type === MessageType.IMAGE ? 'jpg' : 'mp3');
    const folder = input.type === MessageType.IMAGE ? 'chat-images' : 'chat-audio';
    const key = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to S3
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getS3Client } = await import('../../../../shared/infra/storage/s3.client');
    const { getS3Config } = await import('../../../../shared/infra/storage/s3.config');

    const client = getS3Client();
    const config = getS3Config();

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: input.file.buffer,
      ContentType: input.file.mimetype,
    });

    await client.send(command);

    // Create message entity with media URL
    const message = Message.create({
      id: '',
      conversationId: input.conversationId,
      senderId: input.senderId,
      content: input.caption?.trim() || null,
      type: input.type,
      mediaUrl: key,
      mediaType: input.file.mimetype,
    });

    // Save message
    const savedMessage = await this.messageRepository.create(message);

    // Update conversation's last message timestamp
    await this.conversationRepository.updateLastMessageAt(
      input.conversationId,
      savedMessage.createdAt
    );

    return savedMessage;
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
