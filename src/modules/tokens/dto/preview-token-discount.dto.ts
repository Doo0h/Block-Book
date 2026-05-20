import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class PreviewTokenDiscountDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bookPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tokenAmount: number;
}
