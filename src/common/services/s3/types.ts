export type UploadObject = {
  filename: string;
  isPublic: boolean;
  contentType: string;
  directories?: string[];
  buffer?: Buffer;
  ttl?: number;
};
