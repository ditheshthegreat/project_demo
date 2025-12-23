/**
 * @file s3.config.ts
 * @module Shared/Infrastructure/Storage
 * @layer Infrastructure
 * @description S3-Compatible Storage Configuration
 * 
 * Unified configuration for S3-compatible storage providers:
 * - Local: MinIO
 * - Production: DigitalOcean Spaces, AWS S3, etc.
 * 
 * Switching between providers happens via environment variables only.
 */

export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  publicUrl: string;
}

/**
 * Load S3 configuration from environment variables
 * 
 * @example Local MinIO:
 * S3_ENDPOINT=http://localhost:9000
 * S3_REGION=us-east-1
 * S3_BUCKET=inklusio
 * S3_ACCESS_KEY=minioadmin
 * S3_SECRET_KEY=minioadmin
 * S3_FORCE_PATH_STYLE=true
 * S3_PUBLIC_URL=http://localhost:9000/inklusio
 * 
 * @example DigitalOcean Spaces:
 * S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
 * S3_REGION=nyc3
 * S3_BUCKET=inklusio
 * S3_ACCESS_KEY=your_spaces_key
 * S3_SECRET_KEY=your_spaces_secret
 * S3_FORCE_PATH_STYLE=false
 * S3_PUBLIC_URL=https://inklusio.nyc3.cdn.digitaloceanspaces.com
 */
export function getS3Config(): S3Config {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || 'us-east-1';
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
  const publicUrl = process.env.S3_PUBLIC_URL;

  if (!endpoint) {
    throw new Error('S3_ENDPOINT is required');
  }

  if (!bucket) {
    throw new Error('S3_BUCKET is required');
  }

  if (!accessKeyId) {
    throw new Error('S3_ACCESS_KEY is required');
  }

  if (!secretAccessKey) {
    throw new Error('S3_SECRET_KEY is required');
  }

  if (!publicUrl) {
    throw new Error('S3_PUBLIC_URL is required');
  }

  return {
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle,
    publicUrl,
  };
}
