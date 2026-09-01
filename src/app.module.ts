import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomGateway } from './room/room.gateway';
import { RoomService } from './room/room.service';
import { RoomDbService } from './room/room-db.service';
import { Room, RoomSchema } from './room/schemas/room.schema';
import { RoomController } from './room/room.controller';
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
  ],
  controllers: [AppController, RoomController],
  providers: [AppService, RoomGateway, RoomService, RoomDbService],
})
export class AppModule {}