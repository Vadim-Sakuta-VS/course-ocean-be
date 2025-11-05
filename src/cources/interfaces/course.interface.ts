import {
  ICreateSectionContent,
  ISectionContent,
} from './section-content.interface';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum Language {
  EN = 'EN',
  RU = 'RU',
}

export interface ICreateCourse {
  authorId: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  level?: CourseLevel;
  language?: Language;
  learningSkills?: string[];
  requirements?: string[];
  duration?: number;
  price?: number;
  discount?: number;
  discountStartDate?: string | Date;
  discountEndDate?: string | Date;
  isReviewsEnabled?: boolean;
  topicId?: string;
  sections?: ICreateSectionContent[];
}

export interface ICourse extends ICreateCourse {
  id: string;
  sections: ISectionContent[];
}
