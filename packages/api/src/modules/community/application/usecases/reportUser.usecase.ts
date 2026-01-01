/**
 * @file reportUser.usecase.ts
 * @module Community/Application
 * @layer Application
 * @description Report User Use Case
 */

import { UserReport } from '../../domain/entities/userReport.entity';
import { IUserReportRepository } from '../../domain/repositories/IUserReportRepository';
import { prisma } from '../../../../shared/infra/prisma/prismaClient';

export class ReportUserUseCase {
  constructor(private readonly userReportRepository: IUserReportRepository) {}

  async execute(input: {
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description?: string;
  }): Promise<UserReport> {
    // Validate: Cannot report yourself
    if (input.reporterId === input.reportedUserId) {
      throw new Error('Cannot report yourself');
    }

    // Security: Check if reporter is soft-deleted
    const reporter = await prisma.user.findUnique({
      where: { id: input.reporterId },
      select: { isDeleted: true },
    });

    if (!reporter || reporter.isDeleted) {
      throw new Error('User account is deleted or not found');
    }

    // Verify reported user exists and is not deleted
    const reportedUser = await prisma.user.findUnique({
      where: { id: input.reportedUserId },
      select: { isDeleted: true },
    });

    if (!reportedUser || reportedUser.isDeleted) {
      throw new Error('User to report not found');
    }

    // Check if reporter has already reported this user
    const existingReport = await prisma.userReport.findFirst({
      where: {
        reporterId: input.reporterId,
        reportedUserId: input.reportedUserId,
      },
    });

    if (existingReport) {
      throw new Error('You have already reported this user');
    }

    // Create the report
    const report = await this.userReportRepository.reportUser(
      input.reporterId,
      input.reportedUserId,
      input.reason,
      input.description
    );

    return report;
  }
}
