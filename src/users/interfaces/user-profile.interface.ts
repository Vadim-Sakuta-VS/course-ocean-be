import { UserRole } from '../entities/user.entity';

export interface IUserProfile {
  id: string;
  roles: UserRole[];
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}
