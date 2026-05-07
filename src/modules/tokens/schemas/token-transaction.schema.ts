import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { ActivityType } from '../../../common/enums/activity-type.enum';
import { TokenTransactionType } from '../../../common/enums/token-transaction-type.enum';

export type TokenTransactionDocument = HydratedDocument<TokenTransaction>;

@Schema({ timestamps: true, versionKey: false })
export class TokenTransaction {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: TokenTransactionType, required: true })
  type: TokenTransactionType;

  @Prop({ enum: ActivityType })
  activityType?: ActivityType;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ required: true })
  description: string;
}

export const TokenTransactionSchema = SchemaFactory.createForClass(TokenTransaction);
