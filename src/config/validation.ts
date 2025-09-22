import { plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class EnvVars {
  @IsString() @IsNotEmpty() MONGO_URI!: string;
  @IsString() @IsNotEmpty() JWT_SECRET!: string;
  @IsString() @IsOptional() JWT_EXPIRES?: string;
  @IsString() @IsOptional() PORT?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: false });
  // Throwing on error handled by Nest ConfigModule’s `validate` option if desired.
  return validated;
}
