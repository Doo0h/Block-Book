import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTradeDto {
  @IsMongoId()
  bookId: string;

  @IsMongoId()
  buyerId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  offeredPrice: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pickupLocation?: string;
}
