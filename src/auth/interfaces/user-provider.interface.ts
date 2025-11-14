import { IUserProfile } from '../../users/interfaces/user-profile.interface';
import { AuthProvider } from '../entities/user-providers.entity';

export interface IUserProvider {
  id?: string;
  providerId: string;
  type: AuthProvider;
  user: IUserProfile;
}
