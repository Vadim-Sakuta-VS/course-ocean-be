import { MimeType } from '../types/enums';

export const IMAGE_MIME_TYPE_REGEXP = new RegExp(
  `${MimeType.JPG}|${MimeType.PNG}|${MimeType.AVIF}|${MimeType.WEBP}`,
);
export const MAX_IMAGE_SIZE = 2e7; // bytes
export const IMAGE_UPLOAD_TTL = 300; // seconds
export const MAX_VIDEO_SIZE = 1e10; // bytes
