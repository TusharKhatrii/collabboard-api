import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  accessCode: string;

  @Prop({ required: true })
  createdBy: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);