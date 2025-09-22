// src/loyalties/schemas/loyalty.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum LoyaltyStatus {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

@Schema({ timestamps: true })
export class Loyalty {
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId: Types.ObjectId;   // ✅ must be ObjectId, not string




  @Prop({ default: 0 })
  points: number;

  @Prop({ type: String, enum: Object.values(LoyaltyStatus), default: LoyaltyStatus.SILVER })
  status: LoyaltyStatus;

  @Prop({ type: [{ delta: Number, reason: String, at: Date }], default: [] })
  history: { delta: number; reason: string; at: Date }[];
}

export type LoyaltyDocument = HydratedDocument<Loyalty>;
export const LoyaltySchema = SchemaFactory.createForClass(Loyalty);
