import { CourseLevel } from './course.interface';
import { IPageableFilter } from '../../common/interfaces/pageable-filter.interface';

export enum CourseDurationFilter {
  NIL_TO_ONE_HOUR,
  ONE_TO_TWO_HOURS,
  TWO_TO_FIVE_HOURS,
  FIVE_TO_TEN_HOURS,
  MORE_TEN_HOURS,
}

export enum CoursePriceFilter {
  PAID,
  FREE,
}

export enum CourseSorting {
  POPULAR,
  NEW,
  HIGHEST_PRICE,
  LOWEST_PRICE,
}

export interface ICoursesFilter extends IPageableFilter {
  creationDateStart?: string;
  creationDateEnd?: string;
  ratingFrom?: number;
  ratingTo?: number;
  categoryIds?: string[];
  subcategoryIds?: string[];
  topicIds?: string[];
  level?: CourseLevel[];
  duration?: CourseDurationFilter[];
  price?: CoursePriceFilter[];
  isActive: boolean;
  search?: string;
  sorting: CourseSorting;
}
