/**
 * @file feedReport.repository.impl.ts
 * @module Community/Infrastructure
 * @layer Infrastructure
 * @description FeedReport Repository Implementation (Prisma Adapter)
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { FeedReport, FeedReportStatus } from '../../domain/entities/feedReport.entity';
import { IFeedReportRepository } from '../../domain/repositories/IFeedReportRepository';

export class FeedReportRepositoryImpl implements IFeedReportRepository {
  async reportFeed(
    reporterId: string,
    feedId: string,
    reason: string,
    description?: string
  ): Promise<FeedReport> {
    const report = await prisma.feedReport.create({
      data: {
        reporterId,
        feedId,
        reason,
        description: description || null,
        status: 'PENDING',
      },
    });

    return this.mapToDomain(report);
  }

  async hasReported(reporterId: string, feedId: string): Promise<boolean> {
    const report = await prisma.feedReport.findUnique({
      where: {
        reporterId_feedId: {
          reporterId,
          feedId,
        },
      },
    });

    return report !== null;
  }

  async getReportsByFeed(feedId: string): Promise<FeedReport[]> {
    const reports = await prisma.feedReport.findMany({
      where: { feedId },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(this.mapToDomain);
  }

  async getReportsByReporter(reporterId: string): Promise<FeedReport[]> {
    const reports = await prisma.feedReport.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(this.mapToDomain);
  }

  private mapToDomain(prismaReport: any): FeedReport {
    return FeedReport.create({
      id: prismaReport.id,
      reporterId: prismaReport.reporterId,
      feedId: prismaReport.feedId,
      reason: prismaReport.reason,
      description: prismaReport.description,
      status: prismaReport.status as FeedReportStatus,
      createdAt: prismaReport.createdAt,
    });
  }
}
