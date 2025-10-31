import { MimeType } from '../types/enums';

export const IMAGE_MIME_TYPE_REGEXP = new RegExp(
  `${MimeType.JPG}|${MimeType.PNG}|${MimeType.AVIF}|${MimeType.WEBP}`,
);
export const MAX_IMAGE_SIZE = 20 * 1000 * 1000; // 20Mb
export const IMAGE_UPLOAD_TTL = 300; // seconds
export const MAX_VIDEO_SIZE = 10 * 1000 * 1000 * 1000; // 10Gb
export const DEFAULT_FILE_VIEW_TTL = 300; // seconds
