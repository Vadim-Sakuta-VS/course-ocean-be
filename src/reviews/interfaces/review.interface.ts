export interface ICreateReview {
  textContent: string;
  rating: number;
  courseId: string;
}

export interface IReview extends ICreateReview {
  id: string;
}
