/**
 * @file uploadChatMedia.middleware.ts
 * @module Shared/Middleware
 * @layer Infrastructure
 * @description Multer middleware for chat media uploads (images and audio)
 */

import multer from 'multer';
import { BadRequestException } from '../core/exceptions/AppException';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`Invalid file type: ${file.mimetype}`), false);
  }
};

export const uploadChatMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max (covers both images and audio)
  }
}).single('media');
