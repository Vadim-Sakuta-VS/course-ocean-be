import { CreateUserExternalDto } from '../../users/dto/create-user-external.dto';
import { AuthProvider } from '../entities/user-providers.entity';

export class CreateUserProviderDto extends CreateUserExternalDto {
  providerType: AuthProvider;
  providerId: string;
}
