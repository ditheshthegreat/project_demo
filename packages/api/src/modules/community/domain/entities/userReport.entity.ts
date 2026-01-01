/**
 * @file userReport.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description UserReport Entity - Represents a user report
 */

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export interface UserReportProps {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  createdAt: Date;
}

export class UserReport {
  constructor(private readonly props: UserReportProps) {}

  public static create(props: Partial<UserReportProps> & {
    reporterId: string;
    reportedUserId: string;
    reason: string;
  }): UserReport {
    if (props.reporterId === props.reportedUserId) {
      throw new Error('Cannot report yourself');
    }

    if (!props.reason || props.reason.trim().length === 0) {
      throw new Error('Report reason is required');
    }

    return new UserReport({
      id: props.id || '',
      reporterId: props.reporterId,
      reportedUserId: props.reportedUserId,
      reason: props.reason.trim(),
      description: props.description?.trim() || null,
      status: props.status || ReportStatus.PENDING,
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get reporterId(): string {
    return this.props.reporterId;
  }

  public get reportedUserId(): string {
    return this.props.reportedUserId;
  }

  public get reason(): string {
    return this.props.reason;
  }

  public get description(): string | null | undefined {
    return this.props.description;
  }

  public get status(): ReportStatus {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      reporterId: this.reporterId,
      reportedUserId: this.reportedUserId,
      reason: this.reason,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
