import { Injectable } from '@nestjs/common';

export interface Participant {
  socketId: string;
  username: string;
}

@Injectable()
export class RoomService {
  // roomId -> Map of socketId -> Participant
  private rooms = new Map<string, Map<string, Participant>>();

  // socketId -> roomId (so we can find what room a disconnecting socket was in)
  private socketToRoom = new Map<string, string>();

  addParticipant(roomId: string, socketId: string, username: string): Participant[] {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    this.rooms.get(roomId)!.set(socketId, { socketId, username });
    this.socketToRoom.set(socketId, roomId);

    return this.getParticipants(roomId);
  }

  removeParticipant(socketId: string): { roomId: string; participants: Participant[] } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.rooms.delete(roomId); // clean up empty rooms
      }
    }

    this.socketToRoom.delete(socketId);

    return { roomId, participants: this.getParticipants(roomId) };
  }

  getParticipants(roomId: string): Participant[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.values()) : [];
  }
}