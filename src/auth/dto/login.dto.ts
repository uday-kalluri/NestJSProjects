import { IsString } from 'class-validator';
export class LoginDto {
  @IsString() identity: string; // email or username
  @IsString() password: string;
}
