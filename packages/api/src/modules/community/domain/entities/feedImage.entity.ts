/**
 * @file feedImage.entity.ts
 * @module Community/Domain/Entities
 * @layer Domain
 * @description Feed Image Entity
 */

export interface FeedImageProps {
  id: string;
  postId: string;
  s3Key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  order: number;
  status: 'ready' | 'processing' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export class FeedImage {
  private constructor(private readonly props: FeedImageProps) {}

  static create(props: FeedImageProps): FeedImage {
    return new FeedImage(props);
  }

  get id(): string {
    return this.props.id;
  }

  get postId(): string {
    return this.props.postId;
  }

  get s3Key(): string {
    return this.props.s3Key;
  }

  get filename(): string {
    return this.props.filename;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get width(): number | undefined {
    return this.props.width;
  }

  get height(): number | undefined {
    return this.props.height;
  }

  get order(): number {
    return this.props.order;
  }

  get status(): string {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      postId: this.postId,
      s3Key: this.s3Key,
      filename: this.filename,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      width: this.width,
      height: this.height,
      order: this.order,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
