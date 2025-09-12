import { UserRole } from '../../users/entities/user.entity';

export enum JwtTokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

export type JwtPayload = {
  id: string;
  email: string;
  roles: UserRole[];
  type: JwtTokenType;
};
