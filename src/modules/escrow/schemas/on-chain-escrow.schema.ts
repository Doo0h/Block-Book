import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TradeStatus } from '../../../common/enums/trade-status.enum';

export type OnChainEscrowDocument = HydratedDocument<OnChainEscrow>;

@Schema({ timestamps: true, versionKey: false })
export class OnChainEscrow {
  @Prop({ required: true, unique: true, min: 1 })
  tradeId: number;

  @Prop({ required: true, min: 1 })
  blockchainBookId: number;

  @Prop({ required: true })
  buyerAddress: string;

  @Prop({ required: true })
  sellerAddress: string;

  @Prop({ required: true, min: 1 })
  amountWei: string;

  @Prop({ required: true })
  escrowContractAddress: string;

  @Prop({ enum: TradeStatus, default: TradeStatus.LOCKED })
  status: TradeStatus;

  @Prop()
  lockTxHash?: string;

  @Prop()
  confirmTxHash?: string;

  @Prop({ min: 0, default: 0 })
  tokenUsed: number;

  @Prop({ min: 0, default: 0 })
  discountAmount: number;
}

export const OnChainEscrowSchema = SchemaFactory.createForClass(OnChainEscrow);
