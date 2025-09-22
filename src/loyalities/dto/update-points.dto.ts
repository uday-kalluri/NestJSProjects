import { IsInt, Min, IsString } from 'class-validator';
export class UpdatePointsDto {
  @IsInt() @Min(-100000) delta: number;
  @IsString() reason: string;
}