import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { randomBytes } from 'crypto';

@Injectable()
export class RoomDbService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async createRoom(name: string, createdBy: string) {
    const accessCode = randomBytes(4).toString('hex'); // e.g. "a1b2c3d4"

    const room = new this.roomModel({ name, accessCode, createdBy });
    return room.save();
  }

  async findByAccessCode(accessCode: string) {
    const room = await this.roomModel.findOne({ accessCode });
    if (!room) {
      throw new NotFoundException(`Room with code ${accessCode} not found`);
    }
    return room;
  }

  async saveScene(accessCode: string, elements: unknown[]) {
    const room = await this.roomModel.findOneAndUpdate(
      { accessCode },
      { $set: { elements } },
      { new: true },
    );
    if (!room) {
      throw new NotFoundException(`Room with code ${accessCode} not found`);
    }
    return room;
  }
}