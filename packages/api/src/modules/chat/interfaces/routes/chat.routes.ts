/**
 * @file chat.routes.ts
 * @module Chat/Interfaces/Routes
 * @layer Interface
 * @description Chat Routes - REST API endpoints for chat messages
 */

import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { verifyAuth } from '../../../../shared/middleware/verifyAuth.middleware';
import { uploadChatMedia } from '../../../../shared/middleware/uploadChatMedia.middleware';

export class ChatRoutes {
  public router: Router;
  private controller: ChatController;

  constructor(chatController: ChatController) {
    this.router = Router();
    this.controller = chatController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/chat/conversations:
     *   get:
     *     summary: Get user's conversations
     *     description: |
     *       Retrieve all conversations for the authenticated user, sorted by most recent message.
     *       
     *       **Security:**
     *       - Requires Firebase authentication token
     *       - Only returns conversations where user is a participant
     *       - Soft-deleted users will receive 404 error
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Conversations retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *                       type:
     *                         type: string
     *                         example: "PRIVATE"
     *                         description: Conversation type (PRIVATE or GROUP)
     *                       lastMessageAt:
     *                         type: string
     *                         format: date-time
     *                         nullable: true
     *                         example: "2024-12-24T01:30:00.000Z"
     *                       createdById:
     *                         type: string
     *                         format: uuid
     *                         example: "f1e2d3c4-b5a6-4c5d-8e9f-0a1b2c3d4e5f"
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                         example: "2024-12-20T10:00:00.000Z"
     *                       updatedAt:
     *                         type: string
     *                         format: date-time
     *                         example: "2024-12-24T01:30:00.000Z"
     *                 message:
     *                   type: string
     *                   example: "Conversations retrieved successfully"
     *       401:
     *         description: Unauthorized - Invalid or missing Firebase token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       404:
     *         description: User not found or soft-deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "User not found"
     */
    this.router.get('/conversations', verifyAuth, this.controller.getConversations.bind(this.controller));

    /**
     * @swagger
     * /api/chat/conversations/{id}/messages:
     *   get:
     *     summary: Get messages in a conversation
     *     description: |
     *       Retrieve messages for a specific conversation with pagination support.
     *       Messages are returned in descending order (newest first).
     *       
     *       **Security:**
     *       - Requires Firebase authentication token
     *       - User must be a participant in the conversation
     *       - Soft-deleted users cannot access messages
     *       - Only non-deleted messages are returned
     *       
     *       **Pagination:**
     *       - Default limit: 50 messages
     *       - Maximum limit: 100 messages per request
     *       - Use offset for pagination through message history
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Conversation ID (UUID)
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 50
     *           minimum: 1
     *           maximum: 100
     *         description: Number of messages to retrieve per page
     *         example: 50
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           default: 0
     *           minimum: 0
     *         description: Number of messages to skip (for pagination)
     *         example: 0
     *     responses:
     *       200:
     *         description: Messages retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     messages:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                             example: "m1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o"
     *                           conversationId:
     *                             type: string
     *                             format: uuid
     *                             example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *                           senderId:
     *                             type: string
     *                             format: uuid
     *                             example: "u1s2e3r4-i5d6-4a5b-8c9d-0e1f2a3b4c5d"
     *                           content:
     *                             type: string
     *                             example: "Hello! How are you today?"
     *                           type:
     *                             type: string
     *                             enum: [TEXT, IMAGE, AUDIO]
     *                             example: "TEXT"
     *                             description: Message type
     *                           readAt:
     *                             type: string
     *                             format: date-time
     *                             nullable: true
     *                             example: "2024-12-24T01:35:00.000Z"
     *                             description: When message was read (null if unread)
     *                           isDeleted:
     *                             type: boolean
     *                             example: false
     *                           createdAt:
     *                             type: string
     *                             format: date-time
     *                             example: "2024-12-24T01:30:00.000Z"
     *                     total:
     *                       type: integer
     *                       example: 150
     *                       description: Total number of messages in conversation
     *                     limit:
     *                       type: integer
     *                       example: 50
     *                     offset:
     *                       type: integer
     *                       example: 0
     *                 message:
     *                   type: string
     *                   example: "Messages retrieved successfully"
     *       400:
     *         description: Validation error - Invalid query parameters
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Validation failed"
     *       401:
     *         description: Unauthorized - Invalid or missing Firebase token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       403:
     *         description: Forbidden - User is not a participant in this conversation
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "User is not a participant in this conversation"
     *       404:
     *         description: Conversation not found or user account deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Conversation not found"
     */
    this.router.get('/conversations/:id/messages', verifyAuth, this.controller.getMessages.bind(this.controller));

    /**
     * @swagger
     * /api/chat/messages:
     *   post:
     *     summary: Send a message (REST fallback)
     *     description: |
     *       Send a message via REST API as a fallback when WebSocket is unavailable.
     *       For real-time messaging, prefer WebSocket event `message:send`.
     *       
     *       **Security:**
     *       - Requires Firebase authentication token
     *       - User must be a participant in the conversation
     *       - Blocked users cannot send messages
     *       - Soft-deleted users cannot send messages
     *       
     *       **Message Processing:**
     *       1. Message is validated (content length, type)
     *       2. Security checks are performed
     *       3. Message is saved to database
     *       4. Conversation lastMessageAt is updated
     *       5. Message is returned (for real-time, use WebSocket)
     *       
     *       **Validation Rules:**
     *       - Content: 1-10,000 characters
     *       - Content is automatically trimmed
     *       - Empty content after trimming is rejected
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - conversationId
     *               - content
     *             properties:
     *               conversationId:
     *                 type: string
     *                 format: uuid
     *                 description: The conversation to send the message to
     *                 example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *               content:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 10000
     *                 description: Message content (will be trimmed)
     *                 example: "Hello! How are you today?"
     *               type:
     *                 type: string
     *                 enum: [TEXT, IMAGE, AUDIO]
     *                 default: TEXT
     *                 description: Type of message (TEXT for regular messages)
     *                 example: "TEXT"
     *     responses:
     *       201:
     *         description: Message sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                       example: "m1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o"
     *                     conversationId:
     *                       type: string
     *                       format: uuid
     *                       example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *                     senderId:
     *                       type: string
     *                       format: uuid
     *                       example: "u1s2e3r4-i5d6-4a5b-8c9d-0e1f2a3b4c5d"
     *                     content:
     *                       type: string
     *                       example: "Hello! How are you today?"
     *                     type:
     *                       type: string
     *                       enum: [TEXT, IMAGE, AUDIO]
     *                       example: "TEXT"
     *                     readAt:
     *                       type: string
     *                       format: date-time
     *                       nullable: true
     *                       example: null
     *                     isDeleted:
     *                       type: boolean
     *                       example: false
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                       example: "2024-12-24T01:45:00.000Z"
     *                 message:
     *                   type: string
     *                   example: "Message sent successfully"
     *       400:
     *         description: Validation error - Invalid request body
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Validation failed"
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                   example: [{"path": ["content"], "message": "Message content cannot be empty"}]
     *       401:
     *         description: Unauthorized - Invalid or missing Firebase token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Unauthorized"
     *       403:
     *         description: Forbidden - User cannot send messages (not participant, blocked, or deleted)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Cannot send message to blocked user"
     *       404:
     *         description: Conversation not found or user account deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Conversation not found"
     */
    this.router.post('/messages', verifyAuth, this.controller.sendMessage.bind(this.controller));

    /**
     * @swagger
     * /api/chat/message/{id}/react:
     *   post:
     *     summary: Add reaction to a message
     *     description: |
     *       Add or update emoji reaction to a message.
     *       Each user can have only one reaction per message (upsert behavior).
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - User must be a participant in the conversation
     *       - Soft-deleted users cannot react
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Message ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - emoji
     *             properties:
     *               emoji:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 10
     *                 example: "👍"
     *     responses:
     *       200:
     *         description: Reaction added successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     messageId:
     *                       type: string
     *                     userId:
     *                       type: string
     *                     emoji:
     *                       type: string
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not a conversation participant
     *       404:
     *         description: Message not found
     *   delete:
     *     summary: Remove reaction from a message
     *     description: |
     *       Remove user's reaction from a message.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - User must be a participant in the conversation
     *       - Can only remove own reaction
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Message ID
     *     responses:
     *       200:
     *         description: Reaction removed successfully
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not a conversation participant
     *       404:
     *         description: Reaction not found
     */
    this.router.post('/message/:id/react', verifyAuth, this.controller.addReaction.bind(this.controller));
    this.router.delete('/message/:id/react', verifyAuth, this.controller.removeReaction.bind(this.controller));

    /**
     * @swagger
     * /api/chat/message/media:
     *   post:
     *     summary: Upload media message (image or audio)
     *     description: |
     *       Upload a media file (image or audio) as a chat message.
     *       File is uploaded to S3/MinIO and URL is stored with the message.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - User must be a participant in the conversation
     *       - Blocked users cannot send media
     *       - Soft-deleted users cannot send media
     *       
     *       **File Limits:**
     *       - Images: Max 10MB (JPEG, PNG, GIF, WebP)
     *       - Audio: Max 25MB (MP3, WAV, OGG, AAC, M4A)
     *       
     *       **Note:** Caption is optional for media messages
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - conversationId
     *               - type
     *               - media
     *             properties:
     *               conversationId:
     *                 type: string
     *                 format: uuid
     *                 description: Conversation ID
     *               type:
     *                 type: string
     *                 enum: [IMAGE, AUDIO]
     *                 description: Media type
     *               caption:
     *                 type: string
     *                 description: Optional caption for media
     *                 maxLength: 1000
     *               media:
     *                 type: string
     *                 format: binary
     *                 description: Media file to upload
     *     responses:
     *       201:
     *         description: Media message uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     conversationId:
     *                       type: string
     *                     senderId:
     *                       type: string
     *                     content:
     *                       type: string
     *                       nullable: true
     *                     type:
     *                       type: string
     *                       enum: [IMAGE, AUDIO]
     *                     mediaUrl:
     *                       type: string
     *                       description: Signed S3 URL (valid for 1 hour)
     *                     mediaType:
     *                       type: string
     *                       example: "image/jpeg"
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error or file too large
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Not a participant or blocked
     *       404:
     *         description: Conversation not found
     */
    this.router.post('/message/media', verifyAuth, uploadChatMedia as any, this.controller.uploadMediaMessage.bind(this.controller));

    /**
     * @swagger
     * /api/chat/search:
     *   get:
     *     summary: Search messages in user's conversations
     *     description: |
     *       Search for messages by keyword across all user's conversations or within a specific conversation.
     *       Returns paginated results with case-insensitive matching.
     *       
     *       **Security:**
     *       - Requires Firebase authentication
     *       - Only searches in conversations where user is a participant
     *       - Soft-deleted users cannot search
     *       - Only returns non-deleted messages
     *       
     *       **Search Scope:**
     *       - Without conversationId: Searches all user's conversations
     *       - With conversationId: Searches only that conversation (requires participation)
     *     tags: [Chat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: q
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 1
     *           maxLength: 100
     *         description: Search query (case-insensitive)
     *         example: "hello"
     *       - in: query
     *         name: conversationId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Optional - Search within specific conversation
     *         example: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 50
     *         description: Number of results per page
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of results to skip
     *     responses:
     *       200:
     *         description: Search results found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     messages:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                           conversationId:
     *                             type: string
     *                           senderId:
     *                             type: string
     *                           content:
     *                             type: string
     *                             nullable: true
     *                           type:
     *                             type: string
     *                             enum: [TEXT, IMAGE, AUDIO]
     *                           mediaUrl:
     *                             type: string
     *                             nullable: true
     *                           createdAt:
     *                             type: string
     *                             format: date-time
     *                     total:
     *                       type: integer
     *                       example: 150
     *                     limit:
     *                       type: integer
     *                       example: 50
     *                     offset:
     *                       type: integer
     *                       example: 0
     *                 message:
     *                   type: string
     *                   example: "Messages found"
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Not a participant in specified conversation
     *       404:
     *         description: User not found
     */
    this.router.get('/search', verifyAuth, this.controller.searchMessages.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}
