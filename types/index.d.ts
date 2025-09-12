import { UserRole } from '../src/users/entities/user.entity';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      roles: UserRole[];
    }

    interface Request {
      user?: User;
    }
  }
}
