import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email or username for login' })
  @IsString() identity: string; // email or username

  @ApiProperty({ description: 'Password for the account' })
  @IsString() password: string;
}
