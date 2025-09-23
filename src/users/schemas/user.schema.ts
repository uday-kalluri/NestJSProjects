// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop()
  password?: string;

  @Prop({ enum: ['user','admin'], default: 'user' })
  role: string;

  @Prop({ type: String, index: true, sparse: true })
  firebaseUid?: string;

  @Prop({ type: String, index: true, sparse: true })
  phone?: string;

  @Prop({ default: false })
  isVerified?: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

// create index programmatically if desired:
UserSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
