/**
 * @file reportFeed.usecase.ts
 * @module Community/Application
 * @layer Application
 * @description Report Feed Post Use Case
 */

import { FeedReport } from '../../domain/entities/feedReport.entity';
import { IFeedReportRepository } from '../../domain/repositories/IFeedReportRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ReportFeedUseCase {
  constructor(private readonly feedReportRepository: IFeedReportRepository) {}

  async execute(input: {
    reporterId: string;
    feedId: string;
    reason: string;
    description?: string;
  }): Promise<FeedReport> {
    // Security: Check if reporter is soft-deleted
    const reporter = await prisma.user.findUnique({
      where: { id: input.reporterId },
      select: { isDeleted: true },
    });

    if (!reporter || reporter.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify feed post exists and is not deleted
    const feedPost = await prisma.feedPost.findUnique({
      where: { id: input.feedId },
      select: { userId: true, isDeleted: true },
    });

    if (!feedPost || feedPost.isDeleted) {
      throw new Error('Feed post not found');
    }

    // Validate: Cannot report own post
    if (feedPost.userId === input.reporterId) {
      throw new Error('Cannot report your own post');
    }

    // Check if user has already reported this post
    const hasReported = await this.feedReportRepository.hasReported(
      input.reporterId,
      input.feedId
    );

    if (hasReported) {
      throw new Error('You have already reported this post');
    }

    // Create the report
    const report = await this.feedReportRepository.reportFeed(
      input.reporterId,
      input.feedId,
      input.reason,
      input.description
    );

    return report;
  }
}
