import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { TradeStatus } from 'src/common/enums/trade-status.enum';

export type TradeDocument = HydratedDocument<Trade>;

class TradeTimelineEntry {
  @Prop({ required: true })
  status: TradeStatus;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class Trade {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  buyerId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  sellerId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  offeredPrice: number;

  @Prop({ enum: TradeStatus, default: TradeStatus.PENDING })
  status: TradeStatus;

  @Prop()
  pickupLocation?: string;

  @Prop()
  blockchainTxHash?: string;

  @Prop({ type: [TradeTimelineEntry], default: [] })
  timeline: TradeTimelineEntry[];
}

export const TradeSchema = SchemaFactory.createForClass(Trade);
