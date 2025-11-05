import {
  ICreateLectureContent,
  ILectureContent,
} from './lecture-content.interface';

export interface ICreateSectionContent {
  order: number;
  title?: string;
  lectures?: ICreateLectureContent[];
  isPreviewEnabled?: boolean;
}

export interface ISectionContent extends ICreateSectionContent {
  id: string;
  lectures: ILectureContent[];
}
