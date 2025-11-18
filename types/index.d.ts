import 'express-session';
import { AuthProvider } from '../src/auth/entities/user-providers.entity';
import { UserRole } from '../src/users/entities/user.entity';

declare global {
  namespace Express {
    interface User {
      id?: string;
      email: string;
      roles?: UserRole[];
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
      isEmailVerified?: boolean;
      providerType?: AuthProvider | null;
      providerId?: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    oauthRedirectUrl?: string;
  }
}
