/**
 * @file getConversations.usecase.ts
 * @module Chat/Application
 * @layer Application
 * @description Get Conversations Use Case
 */

import { IConversationRepository, ConversationInfo } from '../../domain/repositories/IConversationRepository';

export class GetConversationsUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(userId: string): Promise<ConversationInfo[]> {
    // Get all conversations for user, sorted by last message
    const conversations = await this.conversationRepository.findByUserId(userId);

    // Sort by lastMessageAt descending (most recent first)
    return conversations.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    });
  }
}
