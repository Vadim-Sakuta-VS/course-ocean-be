export class CreateUserExternalDto {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
}
