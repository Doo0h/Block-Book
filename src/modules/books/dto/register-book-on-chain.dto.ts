import { Type } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RegisterBookOnChainDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  blockchainTxHash?: string;

  @IsOptional()
  @IsEthereumAddress()
  contractAddress?: string;

  @IsOptional()
  @IsEthereumAddress()
  ownerAddress?: string;
}
