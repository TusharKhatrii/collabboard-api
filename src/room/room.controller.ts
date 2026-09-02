import { Controller, Post, Get, Put, Param, Body } from '@nestjs/common';
import { RoomDbService } from './room-db.service';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly roomDbService: RoomDbService,
    private readonly roomService: RoomService,
  ) {}

  @Post()
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.roomDbService.createRoom(dto.name, dto.createdBy);
  }

  @Get(':accessCode')
  async getRoom(@Param('accessCode') accessCode: string) {
    return this.roomDbService.findByAccessCode(accessCode);
  }

  @Put(':accessCode/scene')
  async updateScene(
    @Param('accessCode') accessCode: string,
    @Body() body: { elements: unknown[] },
  ) {
    const scene = body.elements ?? [];
    // Keep the in-memory scene cache in sync so a manual save is never
    // overwritten later by a stale cached scene when the room empties.
    this.roomService.updateScene(accessCode, scene);
    return this.roomDbService.saveScene(accessCode, scene);
  }
}