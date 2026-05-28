import { Type } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOnChainEscrowDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tradeId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  blockchainBookId: number;

  @IsEthereumAddress()
  buyerAddress: string;

  @IsEthereumAddress()
  sellerAddress: string;

  @IsString()
  @IsNotEmpty()
  amountWei: string;

  @IsEthereumAddress()
  escrowContractAddress: string;

  @IsString()
  @IsNotEmpty()
  lockTxHash: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tokenUsed?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;
}
