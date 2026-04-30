import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, unique: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ required: true, min: 1 })
  grade: number;

  @Prop({ default: 0, min: 0 })
  tokenBalance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
