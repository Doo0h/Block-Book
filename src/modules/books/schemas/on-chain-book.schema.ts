import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OnChainBookDocument = HydratedDocument<OnChainBook>;

@Schema({ timestamps: true, versionKey: false })
export class OnChainBook {
  @Prop({ required: true, unique: true, min: 1 })
  blockchainBookId: number;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ required: true, min: 1, default: 15000 })
  price: number;

  @Prop({ required: true, trim: true })
  status: string;

  @Prop()
  blockchainTxHash?: string;

  @Prop()
  contractAddress?: string;

  @Prop()
  ownerAddress?: string;
}

export const OnChainBookSchema = SchemaFactory.createForClass(OnChainBook);
