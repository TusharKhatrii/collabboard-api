import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RoomDbService } from './room-db.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('api/rooms')
export class RoomController {
  constructor(private readonly roomDbService: RoomDbService) {}

  @Post()
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.roomDbService.createRoom(dto.name, dto.createdBy);
  }

  @Get(':accessCode')
  async getRoom(@Param('accessCode') accessCode: string) {
    return this.roomDbService.findByAccessCode(accessCode);
  }
}