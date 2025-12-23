/**
 * @file upload.middleware.ts
 * @module Shared/Middleware
 * @layer Infrastructure
 * @description Multer middleware for handling file uploads
 * 
 * Uses memory storage - files are uploaded to S3 by the controller.
 */

import multer from 'multer';
import { BadRequestException } from '../core/exceptions/AppException';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(
      `Invalid file type. Only JPEG, PNG, and WebP images are allowed.`,
      'INVALID_FILE_TYPE'
    ));
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  }
}).array('images', 5);

export const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 1 // Single file
  }
}).single('profileImage');
