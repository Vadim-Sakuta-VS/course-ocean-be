import { IFile } from '../../files/interfaces/file.interface';

export interface ICreateLectureContent {
  order: number;
  title?: string;
  isPreviewEnabled?: boolean;
}

export interface ILectureContent extends ICreateLectureContent {
  id: string;
  videoFile?: IFile | null;
}
