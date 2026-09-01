import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  accessCode: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  elements: unknown[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);