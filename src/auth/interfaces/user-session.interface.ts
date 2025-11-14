import type { IResult } from 'ua-parser-js';
import { IUserProfile } from '../../users/interfaces/user-profile.interface';

export interface IUserSession {
  user: IUserProfile;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgentInfo: IResult;
}
