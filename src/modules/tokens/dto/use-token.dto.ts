import { Type } from 'class-transformer';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UseTokenDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEthereumAddress()
  studentAddress: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bookPrice: number;

  @IsString()
  @IsNotEmpty()
  bookId: string;
}