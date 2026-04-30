import { IsMongoId } from 'class-validator';

export class LockEscrowDto {
  @IsMongoId()
  tradeId: string;
}
