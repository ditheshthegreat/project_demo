/**
 * @file feedReport.entity.ts
 * @module Community/Domain
 * @layer Domain
 * @description FeedReport Entity - Represents a feed post report
 */

export enum FeedReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export interface FeedReportProps {
  id: string;
  reporterId: string;
  feedId: string;
  reason: string;
  description?: string | null;
  status: FeedReportStatus;
  createdAt: Date;
}

export class FeedReport {
  constructor(private readonly props: FeedReportProps) {}

  public static create(props: Partial<FeedReportProps> & {
    reporterId: string;
    feedId: string;
    reason: string;
  }): FeedReport {
    if (!props.reason || props.reason.trim().length === 0) {
      throw new Error('Report reason is required');
    }

    return new FeedReport({
      id: props.id || '',
      reporterId: props.reporterId,
      feedId: props.feedId,
      reason: props.reason.trim(),
      description: props.description?.trim() || null,
      status: props.status || FeedReportStatus.PENDING,
      createdAt: props.createdAt || new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get reporterId(): string {
    return this.props.reporterId;
  }

  public get feedId(): string {
    return this.props.feedId;
  }

  public get reason(): string {
    return this.props.reason;
  }

  public get description(): string | null | undefined {
    return this.props.description;
  }

  public get status(): FeedReportStatus {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      reporterId: this.reporterId,
      feedId: this.feedId,
      reason: this.reason,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
