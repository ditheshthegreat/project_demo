/**
 * @file IFeedReportRepository.ts
 * @module Community/Domain
 * @layer Domain
 * @description FeedReport Repository Interface
 */

import { FeedReport } from '../entities/feedReport.entity';

export interface IFeedReportRepository {
  /**
   * Report a feed post
   */
  reportFeed(
    reporterId: string,
    feedId: string,
    reason: string,
    description?: string
  ): Promise<FeedReport>;

  /**
   * Check if user has already reported a feed post
   */
  hasReported(reporterId: string, feedId: string): Promise<boolean>;

  /**
   * Get reports for a specific feed post
   */
  getReportsByFeed(feedId: string): Promise<FeedReport[]>;

  /**
   * Get reports created by a user
   */
  getReportsByReporter(reporterId: string): Promise<FeedReport[]>;
}
