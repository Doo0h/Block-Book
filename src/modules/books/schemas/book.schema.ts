import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { BookCondition } from '../../../common/enums/book-condition.enum';
import { BookStatus } from '../../../common/enums/book-status.enum';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true, versionKey: false })
export class Book {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ required: true, trim: true })
  isbn: string;

  @Prop({ required: true, trim: true })
  major: string;

  @Prop({ required: true, min: 1 })
  price: number;

  @Prop({ required: true, enum: BookCondition })
  condition: BookCondition;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  sellerId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  description?: string;

  @Prop({ enum: BookStatus, default: BookStatus.AVAILABLE })
  status: BookStatus;

  @Prop()
  blockchainBookId?: string;

  @Prop()
  blockchainTxHash?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
