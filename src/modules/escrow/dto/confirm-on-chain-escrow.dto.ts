import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmOnChainEscrowDto {
  @IsString()
  @IsNotEmpty()
  confirmTxHash: string;
}
