/**
 * @file IUserReportRepository.ts
 * @module Community/Domain
 * @layer Domain
 * @description UserReport Repository Interface
 */

import { UserReport } from '../entities/userReport.entity';

export interface IUserReportRepository {
  /**
   * Report a user
   */
  reportUser(
    reporterId: string,
    reportedUserId: string,
    reason: string,
    description?: string
  ): Promise<UserReport>;

  /**
   * Get reports created by a user
   */
  getReportsByReporter(reporterId: string): Promise<UserReport[]>;

  /**
   * Get reports against a user
   */
  getReportsByReportedUser(reportedUserId: string): Promise<UserReport[]>;
}
