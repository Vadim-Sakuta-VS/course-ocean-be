export class PageableContentDto<T> {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  content: T[];
}
