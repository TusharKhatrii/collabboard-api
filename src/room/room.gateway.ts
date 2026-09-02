import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomDbService } from './room-db.service';

interface JoinRoomPayload {
  roomId: string;
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RoomGateway.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly roomDbService: RoomDbService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const result = this.roomService.removeParticipant(client.id);
    if (result) {
      this.server.to(result.roomId).emit('presence-update', result.participants);
      this.server.to(result.roomId).emit('participant-left', { socketId: client.id });
      this.logger.log(`Removed from room: ${result.roomId}`);
      this.persistSceneIfEmpty(result.roomId, result.scene);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, username } = payload;

    client.join(roomId);
    const participants = this.roomService.addParticipant(roomId, client.id, username);

    this.logger.log(`${username} (${client.id}) joined room: ${roomId}`);

    // broadcast the FULL updated participant list to everyone in the room, including sender
    this.server.to(roomId).emit('presence-update', participants);

    return { status: 'joined', roomId, participants };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomId);
    const result = this.roomService.removeParticipant(client.id);

    if (result) {
      this.server.to(result.roomId).emit('presence-update', result.participants);
      this.server.to(result.roomId).emit('participant-left', { socketId: client.id });
      this.persistSceneIfEmpty(result.roomId, result.scene);
    }

    this.logger.log(`Client ${client.id} left room: ${roomId}`);
  }

  @SubscribeMessage('draw-update')
handleDrawUpdate(
  @MessageBody() payload: { roomId: string; elements: any },
  @ConnectedSocket() client: Socket,
) {
  // Keep the latest full scene in memory so it can be persisted to the DB if the
  // room becomes empty. The payload always carries the complete elements array.
  if (Array.isArray(payload?.elements)) {
    this.roomService.updateScene(payload.roomId, payload.elements);
  }

  // broadcast to everyone else in the room (not back to sender)
  client.to(payload.roomId).emit('draw-update', payload);
}

private persistSceneIfEmpty(roomId: string, scene: unknown[] | null) {
  if (!scene) return;
  // Best-effort: persist real-time edits so they survive the room going empty.
  this.roomDbService.saveScene(roomId, scene).catch((err) => {
    this.logger.error(`Failed to persist scene on room-empty (${roomId}): ${err?.message ?? err}`);
  });
}

@SubscribeMessage('cursor-move')
handleCursorMove(
  @MessageBody() payload: { roomId: string; socketId: string; username: string; x: number; y: number },
  @ConnectedSocket() client: Socket,
) {
  client.to(payload.roomId).emit('cursor-move', payload);
}
}