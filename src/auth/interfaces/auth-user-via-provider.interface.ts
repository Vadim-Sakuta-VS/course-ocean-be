import { ICreateUserExternal } from '../../users/interfaces/create-user-external.interface';
import { AuthProvider } from '../entities/user-providers.entity';

export interface IAuthUserViaProvider extends ICreateUserExternal {
  providerType: AuthProvider;
  providerId: string;
}
