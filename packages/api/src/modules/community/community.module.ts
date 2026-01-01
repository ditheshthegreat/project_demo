/**
 * @file community.module.ts
 * @module Community
 * @layer Module
 * @description Community Module - Dependency Injection Container
 * 
 * Assembles all components of the Community module using dependency injection.
 * Follows Clean Architecture by wiring together layers without coupling them.
 * 
 * **Architecture Layers:**
 * 1. Infrastructure: PostRepository implementation
 * 2. Application: Use cases for feed operations
 * 3. Interface: FeedController and FeedRoutes for HTTP
 * 
 * @example
 * import { communityRouter } from './modules/community/community.module';
 * app.use('/api/community', communityRouter);
 */

import { Router } from 'express';
import { PostRepositoryImpl } from './infrastructure/database/postRepository.impl';
import { LikeRepositoryImpl } from './infrastructure/database/likeRepository.impl';
import { CommentRepositoryImpl } from './infrastructure/database/commentRepository.impl';
import { FeedSettingsRepositoryImpl } from './infrastructure/database/feedSettingsRepository.impl';
import { UserProfileRepositoryImpl } from './infrastructure/database/userProfileRepository.impl';
import { FriendRepositoryImpl } from './infrastructure/database/friendRepository.impl';
import { BlockedUserRepositoryImpl } from './infrastructure/database/blockedUser.repository.impl';
import { UserReportRepositoryImpl } from './infrastructure/database/userReport.repository.impl';
import { FeedReportRepositoryImpl } from './infrastructure/database/feedReport.repository.impl';
import { CreatePostUseCase } from './application/usecases/createPost.usecase';
import { GetFeedUseCase } from './application/usecases/getFeed.usecase';
import { GetPostByIdUseCase } from './application/usecases/getPostById.usecase';
import { DeletePostUseCase } from './application/usecases/deletePost.usecase';
import { AddLikeUseCase } from './application/usecases/addLike.usecase';
import { RemoveLikeUseCase } from './application/usecases/removeLike.usecase';
import { AddCommentUseCase } from './application/usecases/addComment.usecase';
import { GetCommentsUseCase } from './application/usecases/getComments.usecase';
import { DeleteCommentUseCase } from './application/usecases/deleteComment.usecase';
import { UpdateCommentUseCase } from './application/usecases/updateComment.usecase';
import { GetFeedSettingsUseCase } from './application/usecases/getFeedSettings.usecase';
import { UpdateFeedSettingsUseCase } from './application/usecases/updateFeedSettings.usecase';
import { ExploreUsersUseCase } from './application/usecases/exploreUsers.usecase';
import { SearchUsersUseCase } from './application/usecases/searchUsers.usecase';
import { NearbyUsersUseCase } from './application/usecases/nearbyUsers.usecase';
import { SendFriendRequestUseCase } from './application/usecases/sendFriendRequest.usecase';
import { GetPendingRequestsUseCase } from './application/usecases/getPendingRequests.usecase';
import { AcceptFriendRequestUseCase } from './application/usecases/acceptFriendRequest.usecase';
import { RejectFriendRequestUseCase } from './application/usecases/rejectFriendRequest.usecase';
import { GetFriendsUseCase } from './application/usecases/getFriends.usecase';
import { RemoveFriendUseCase } from './application/usecases/removeFriend.usecase';
import { CancelFriendRequestUseCase } from './application/usecases/cancelFriendRequest.usecase';
import { GetUserProfileUseCase } from './application/usecases/getUserProfile.usecase';
import { GetMyProfileUseCase } from './application/usecases/getMyProfile.usecase';
import { StartConversationUseCase } from './application/usecases/startConversation.usecase';
import { GetConversationsUseCase } from './application/usecases/getConversations.usecase';
import { BlockUserUseCase } from './application/usecases/blockUser.usecase';
import { UnblockUserUseCase } from './application/usecases/unblockUser.usecase';
import { ReportUserUseCase } from './application/usecases/reportUser.usecase';
import { GetBlockedUsersUseCase } from './application/usecases/getBlockedUsers.usecase';
import { ReportFeedUseCase } from './application/usecases/reportFeed.usecase';
import { NotificationRepositoryImpl } from '../notifications/infrastructure/database/notification.repository.impl';
import { CreateNotificationUseCase } from '../notifications/application/usecases/createNotification.usecase';
import { FeedController } from './interfaces/controllers/feed.controller';
import { FeedRoutes } from './interfaces/routes/feed.routes';
import { ExploreController } from './interfaces/controllers/explore.controller';
import { ExploreRoutes } from './interfaces/routes/explore.routes';
import { FriendController } from './interfaces/controllers/friend.controller';
import { FriendRoutes } from './interfaces/routes/friend.routes';
import { ProfileController } from './interfaces/controllers/profile.controller';
import { ProfileRoutes } from './interfaces/routes/profile.routes';
import { MessageController } from './interfaces/controllers/message.controller';
import { MessageRoutes } from './interfaces/routes/message.routes';
import { ModerationController } from './interfaces/controllers/moderation.controller';
import { ModerationRoutes } from './interfaces/routes/moderation.routes';
import { CommentRoutes } from './interfaces/routes/comment.routes';
import { ConversationRepositoryImpl } from './infrastructure/database/conversationRepository.impl';
import { verifyAuth } from '../../shared/middleware/verifyAuth.middleware';

/**
 * Community Module
 * 
 * Dependency injection container for community functionality.
 * Feed posts with photo, location, and review types.
 */
export class CommunityModule {
  private router: Router;

  constructor() {
    // Infrastructure layer: Repositories
    const postRepository = new PostRepositoryImpl();
    const likeRepository = new LikeRepositoryImpl();
    const commentRepository = new CommentRepositoryImpl();
    const feedSettingsRepository = new FeedSettingsRepositoryImpl();
    const userProfileRepository = new UserProfileRepositoryImpl();
    const friendRepository = new FriendRepositoryImpl();
    const conversationRepository = new ConversationRepositoryImpl();
    const blockedUserRepository = new BlockedUserRepositoryImpl();
    const userReportRepository = new UserReportRepositoryImpl();
    const feedReportRepository = new FeedReportRepositoryImpl();

    // Notifications infrastructure
    const notificationRepository = new NotificationRepositoryImpl();
    const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository);

    // Application layer: Use cases
    const createPostUseCase = new CreatePostUseCase(postRepository);
    const getFeedUseCase = new GetFeedUseCase(postRepository);
    const getPostByIdUseCase = new GetPostByIdUseCase(postRepository);
    const deletePostUseCase = new DeletePostUseCase(postRepository);
    const addLikeUseCase = new AddLikeUseCase(likeRepository, postRepository, createNotificationUseCase);
    const removeLikeUseCase = new RemoveLikeUseCase(likeRepository, postRepository);
    const addCommentUseCase = new AddCommentUseCase(commentRepository, postRepository, createNotificationUseCase);
    const getCommentsUseCase = new GetCommentsUseCase(commentRepository, postRepository);
    const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository, postRepository);
    const updateCommentUseCase = new UpdateCommentUseCase(commentRepository);
    const getFeedSettingsUseCase = new GetFeedSettingsUseCase(feedSettingsRepository);
    const updateFeedSettingsUseCase = new UpdateFeedSettingsUseCase(feedSettingsRepository);
    const exploreUsersUseCase = new ExploreUsersUseCase(userProfileRepository);
    const searchUsersUseCase = new SearchUsersUseCase(userProfileRepository);
    const nearbyUsersUseCase = new NearbyUsersUseCase(userProfileRepository);
    const sendFriendRequestUseCase = new SendFriendRequestUseCase(friendRepository, createNotificationUseCase);
    const getPendingRequestsUseCase = new GetPendingRequestsUseCase(friendRepository);
    const acceptFriendRequestUseCase = new AcceptFriendRequestUseCase(friendRepository, createNotificationUseCase);
    const rejectFriendRequestUseCase = new RejectFriendRequestUseCase(friendRepository);
    const getFriendsUseCase = new GetFriendsUseCase(friendRepository);
    const removeFriendUseCase = new RemoveFriendUseCase(friendRepository);
    const cancelFriendRequestUseCase = new CancelFriendRequestUseCase(friendRepository);
    const getUserProfileUseCase = new GetUserProfileUseCase(userProfileRepository, postRepository, friendRepository);
    const getMyProfileUseCase = new GetMyProfileUseCase(userProfileRepository, postRepository, friendRepository);
    const startConversationUseCase = new StartConversationUseCase(conversationRepository);
    const getConversationsUseCase = new GetConversationsUseCase(conversationRepository);
    const blockUserUseCase = new BlockUserUseCase(blockedUserRepository);
    const unblockUserUseCase = new UnblockUserUseCase(blockedUserRepository);
    const reportUserUseCase = new ReportUserUseCase(userReportRepository);
    const getBlockedUsersUseCase = new GetBlockedUsersUseCase(blockedUserRepository);
    const reportFeedUseCase = new ReportFeedUseCase(feedReportRepository);

    // Interface layer: HTTP controller and routes
    const feedController = new FeedController(
      createPostUseCase,
      getFeedUseCase,
      getPostByIdUseCase,
      deletePostUseCase,
      addLikeUseCase,
      removeLikeUseCase,
      addCommentUseCase,
      getCommentsUseCase,
      deleteCommentUseCase,
      updateCommentUseCase,
      getFeedSettingsUseCase,
      updateFeedSettingsUseCase,
      reportFeedUseCase
    );
    const feedRoutes = new FeedRoutes(feedController);

    const exploreController = new ExploreController(
      exploreUsersUseCase,
      searchUsersUseCase,
      nearbyUsersUseCase
    );
    const exploreRoutes = new ExploreRoutes(exploreController);

    const friendController = new FriendController(
      sendFriendRequestUseCase,
      getPendingRequestsUseCase,
      acceptFriendRequestUseCase,
      rejectFriendRequestUseCase,
      getFriendsUseCase,
      removeFriendUseCase,
      cancelFriendRequestUseCase
    );
    const friendRoutes = new FriendRoutes(friendController);

    const profileController = new ProfileController(
      getUserProfileUseCase,
      getMyProfileUseCase
    );
    const profileRoutes = new ProfileRoutes(profileController);

    const messageController = new MessageController(
      startConversationUseCase,
      getConversationsUseCase
    );
    const messageRoutes = new MessageRoutes(messageController);

    const moderationController = new ModerationController(
      blockUserUseCase,
      unblockUserUseCase,
      reportUserUseCase,
      getBlockedUsersUseCase
    );
    const moderationRoutes = new ModerationRoutes(moderationController);

    const commentRoutes = new CommentRoutes(feedController);

    // Create root community router
    this.router = Router();
    
    // Mount feed routes at /feed
    this.router.use('/feed', feedRoutes.getRouter());
    
    // Mount explore routes at /explore
    this.router.use('/explore', exploreRoutes.getRouter());
    
    // Mount friend routes at /friend and /friends
    this.router.use('/friend', friendRoutes.getRouter());
    this.router.use('/friends', friendRoutes.getRouter());
    
    // Mount profile routes at /profile
    this.router.use('/profile', profileRoutes.getRouter());
    
    // Mount message routes at /message and /messages
    this.router.use('/message', messageRoutes.getRouter());
    this.router.use('/messages', messageRoutes.getRouter());
    
    // Mount comment routes at /comment
    this.router.use('/comment', commentRoutes.getRouter());
    
    // Mount moderation routes (block, report) at root /api/community
    this.router.use('/', moderationRoutes.getRouter());
  }

  /**
   * Get Express router with community routes
   * 
   * @returns {Router} Express router
   */
  getRouter(): Router {
    return this.router;
  }
}

/**
 * Singleton instance of Community Module
 * 
 * Export router for use in main application.
 */
const communityModuleInstance = new CommunityModule();
export const communityRouter = communityModuleInstance.getRouter();
