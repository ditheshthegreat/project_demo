/**
 * @file s3.service.ts
 * @module Shared/Infrastructure/Storage
 * @layer Infrastructure
 * @description S3 Upload Service
 * 
 * Provider-agnostic storage service that works with:
 * - MinIO (local)
 * - DigitalOcean Spaces (production)
 * - AWS S3
 * - Any S3-compatible provider
 */

import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from './s3.client';
import { getS3Config } from './s3.config';

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

/**
 * S3 Storage Service
 * 
 * Handles file uploads and deletions to S3-compatible storage.
 * Provider is determined by environment variables only.
 */
export class S3Service {
  private readonly client = getS3Client();
  private readonly config = getS3Config();

  /**
   * Upload file to S3-compatible storage (private)
   * 
   * @param buffer - File buffer
   * @param filename - Original filename (for reference)
   * @param mimeType - File MIME type
   * @returns {Promise<UploadResult>} Signed URL (valid for 1 hour), storage key, and metadata
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop() || 'jpg';
    const key = `feeds/${timestamp}-${randomString}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Private object - no ACL specified
    });

    await this.client.send(command);

    // Generate signed URL (valid for 1 hour)
    const url = await this.getSignedUrl(key);

    return { 
      url, 
      key,
      filename,
      mimeType,
      fileSize: buffer.length
    };
  }

  /**
   * Generate signed URL for private S3 object
   * 
   * @param key - S3 object key
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
    return signedUrl;
  }

  /**
   * Delete file from S3-compatible storage
   * 
   * @param key - File key/path in bucket
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Upload multiple files to S3-compatible storage
   * 
   * @param files - Array of file objects with buffer, filename, and mimeType
   * @returns {Promise<UploadResult[]>} Array of public URLs and keys
   */
  async uploadFiles(
    files: Array<{ buffer: Buffer; filename: string; mimeType: string }>
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.filename, file.mimeType)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete multiple files from S3-compatible storage
   * 
   * @param keys - Array of file keys to delete
   */
  async deleteFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map((key) => this.deleteFile(key));
    await Promise.all(deletePromises);
  }
}

// Export singleton instance
export const s3Service = new S3Service();
