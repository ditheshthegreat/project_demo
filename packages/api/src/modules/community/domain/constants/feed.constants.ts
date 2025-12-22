/**
 * @file feed.constants.ts
 * @module Community/Domain/Constants
 * @layer Domain
 * @description Feed Domain Constants
 * 
 * Defines business constants for feed functionality.
 */

/**
 * Feed Post Types
 * - photo: Post with image/photo
 * - location: Post with location/place
 * - review: Post with review/rating
 */
export const FEED_TYPES = {
  PHOTO: 'photo',
  LOCATION: 'location',
  REVIEW: 'review',
} as const;

export type FeedType = typeof FEED_TYPES[keyof typeof FEED_TYPES];

/**
 * Post Visibility Options
 * - public: Visible to everyone
 * - friends: Visible to friends only
 * - private: Visible to author only
 */
export const VISIBILITY = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  PRIVATE: 'private',
} as const;

export type Visibility = typeof VISIBILITY[keyof typeof VISIBILITY];

/**
 * Feed Constants
 */
export const FEED_CONSTANTS = {
  MAX_CONTENT_LENGTH: 5000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;
