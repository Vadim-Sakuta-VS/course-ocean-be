import { IPageableFilter } from '../../common/interfaces/pageable-filter.interface';

export interface IReviewsFilter extends IPageableFilter {
  courseId: string;
}
