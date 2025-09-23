import { IsInt, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePointsDto {
  @ApiProperty({ description: 'Points to add or subtract (can be negative)', minimum: -100000 })
  @IsInt() @Min(-100000) delta: number;

  @ApiProperty({ description: 'Reason for the points adjustment' })
  @IsString() reason: string;
}