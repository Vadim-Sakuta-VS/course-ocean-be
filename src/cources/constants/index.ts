import { CourseDurationFilter } from '../dto/search-query.dto';

export const COURSE_DURATION_FILTER_SQL_MAP: Record<
  CourseDurationFilter,
  string
> = {
  [CourseDurationFilter.NIL_TO_ONE_HOUR]:
    '(coalesce(sum(sub_lc.duration), 0) >= 0 and coalesce(sum(sub_lc.duration), 0) <= 3600)',
  [CourseDurationFilter.ONE_TO_TWO_HOURS]:
    '(coalesce(sum(sub_lc.duration), 0) >= 3600 and coalesce(sum(sub_lc.duration), 0) <= 7200)',
  [CourseDurationFilter.TWO_TO_FIVE_HOURS]:
    '(coalesce(sum(sub_lc.duration), 0) >= 7200 and coalesce(sum(sub_lc.duration), 0) <= 18000)',
  [CourseDurationFilter.FIVE_TO_TEN_HOURS]:
    '(coalesce(sum(sub_lc.duration), 0) >= 18000 and coalesce(sum(sub_lc.duration), 0) <= 36000)',
  [CourseDurationFilter.MORE_TEN_HOURS]:
    'coalesce(sum(sub_lc.duration), 0) >= 36000',
};
