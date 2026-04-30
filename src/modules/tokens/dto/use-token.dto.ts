import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UseTokenDto {
  @IsMongoId()
  userId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
