/**
 * @file userReport.repository.impl.ts
 * @module Community/Infrastructure
 * @layer Infrastructure
 * @description UserReport Repository Implementation (Prisma Adapter)
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { UserReport, ReportStatus } from '../../domain/entities/userReport.entity';
import { IUserReportRepository } from '../../domain/repositories/IUserReportRepository';

export class UserReportRepositoryImpl implements IUserReportRepository {
  async reportUser(
    reporterId: string,
    reportedUserId: string,
    reason: string,
    description?: string
  ): Promise<UserReport> {
    const report = await prisma.userReport.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        description: description || null,
        status: 'PENDING',
      },
    });

    return this.mapToDomain(report);
  }

  async getReportsByReporter(reporterId: string): Promise<UserReport[]> {
    const reports = await prisma.userReport.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(this.mapToDomain);
  }

  async getReportsByReportedUser(reportedUserId: string): Promise<UserReport[]> {
    const reports = await prisma.userReport.findMany({
      where: { reportedUserId },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(this.mapToDomain);
  }

  private mapToDomain(prismaReport: any): UserReport {
    return UserReport.create({
      id: prismaReport.id,
      reporterId: prismaReport.reporterId,
      reportedUserId: prismaReport.reportedUserId,
      reason: prismaReport.reason,
      description: prismaReport.description,
      status: prismaReport.status as ReportStatus,
      createdAt: prismaReport.createdAt,
    });
  }
}
