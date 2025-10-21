import { FindOptionsRelations } from 'typeorm';
import { CourseDurationFilter } from '../dto/search-query.dto';
import { CourseEntity } from '../entities/course.entity';

export const COURSE_DURATION_FILTER_SQL_MAP: Record<
  CourseDurationFilter,
  string
> = {
  [CourseDurationFilter.NIL_TO_ONE_HOUR]:
    '(c.duration >= 0 and c.duration <= 3600)',
  [CourseDurationFilter.ONE_TO_TWO_HOURS]:
    '(c.duration >= 3600 and c.duration <= 7200)',
  [CourseDurationFilter.TWO_TO_FIVE_HOURS]:
    '(c.duration >= 7200 and c.duration <= 18000)',
  [CourseDurationFilter.FIVE_TO_TEN_HOURS]:
    '(c.duration >= 18000 and c.duration <= 36000)',
  [CourseDurationFilter.MORE_TEN_HOURS]: 'c.duration >= 36000',
};

export const FIND_COURSE_RELATIONS: FindOptionsRelations<CourseEntity> = {
  author: true,
  sections: {
    lectures: true,
  },
};
