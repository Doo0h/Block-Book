import { Type } from 'class-transformer';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RewardTokenDto {
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
  activityType: string;

  @IsOptional()
  @IsString()
  description?: string;
}