import { PaymentStatus } from '../../payments/types';

export interface IUserCourse {
  userId: string;
  courseId: string;
  status: PaymentStatus;
  comment?: string | null;
  price: number;
  saleDate: string | Date;
}
