// auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Unique username for the user' })
  @IsString() username: string;

  @ApiProperty({ description: 'Password for the user account', minLength: 6 })
  @IsString() @MinLength(6) password: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail() email: string;

  @ApiPropertyOptional({ description: 'Phone number (optional)' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ description: 'Address (optional)' })
  @IsOptional() @IsString() address?: string;
}

