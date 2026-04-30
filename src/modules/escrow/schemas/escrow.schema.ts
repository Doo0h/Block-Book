import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type EscrowDocument = HydratedDocument<Escrow>;

@Schema({ timestamps: true, versionKey: false })
export class Escrow {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Trade', required: true, unique: true })
  tradeId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  buyerWalletAddress: string;

  @Prop({ required: true })
  sellerWalletAddress: string;

  @Prop({ required: true })
  contractAddress: string;

  @Prop()
  lockTxHash?: string;

  @Prop()
  confirmTxHash?: string;

  @Prop()
  releaseTxHash?: string;
}

export const EscrowSchema = SchemaFactory.createForClass(Escrow);
