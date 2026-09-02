import { Injectable } from '@nestjs/common';

export interface Participant {
  socketId: string;
  username: string;
}

@Injectable()
export class RoomService {
  // roomId -> Map of socketId -> Participant
  private rooms = new Map<string, Map<string, Participant>>();

  // roomId -> latest full scene elements relayed via draw-update, so the server can
  // persist real-time edits to the DB when the last participant leaves the room.
  private roomScenes = new Map<string, unknown[]>();

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

  removeParticipant(socketId: string): { roomId: string; participants: Participant[]; scene: unknown[] | null } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    let emptied = false;
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        emptied = true;
        this.rooms.delete(roomId); // clean up empty rooms
      }
    }

    this.socketToRoom.delete(socketId);

    // If this was the last participant, hand back the latest scene so the gateway
    // can persist real-time edits before the room's in-memory state is gone.
    const scene = emptied ? (this.roomScenes.get(roomId) ?? null) : null;
    if (emptied) {
      this.roomScenes.delete(roomId);
    }

    return { roomId, participants: this.getParticipants(roomId), scene };
  }

  updateScene(roomId: string, elements: unknown[]) {
    this.roomScenes.set(roomId, elements);
  }

  getParticipants(roomId: string): Participant[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.values()) : [];
  }
}