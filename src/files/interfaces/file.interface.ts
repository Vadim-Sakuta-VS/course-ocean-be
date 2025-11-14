export interface IFile {
  id: string;
  originalFilename: string;
  storageFilePath: string;
  isPublic: boolean;
  mimeType: string;
  size: number;
  duration?: number | null;
}
