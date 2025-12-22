/**
 * @file s3.client.ts
 * @module Shared/Infrastructure/Storage
 * @layer Infrastructure
 * @description S3 Client Singleton
 * 
 * Unified S3 client that works with:
 * - MinIO (local development)
 * - DigitalOcean Spaces
 * - AWS S3
 * - Any S3-compatible service
 */

import { S3Client } from '@aws-sdk/client-s3';
import { getS3Config } from './s3.config';

let s3ClientInstance: S3Client | null = null;

/**
 * Get or create S3 client singleton
 * 
 * Configuration is read from environment variables:
 * - S3_ENDPOINT: S3 endpoint URL
 * - S3_REGION: AWS region or provider region
 * - S3_ACCESS_KEY: Access key ID
 * - S3_SECRET_KEY: Secret access key
 * - S3_FORCE_PATH_STYLE: Use path-style URLs (required for MinIO)
 * 
 * @returns {S3Client} Configured S3 client instance
 */
export function getS3Client(): S3Client {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const config = getS3Config();

  s3ClientInstance = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
  });

  return s3ClientInstance;
}
