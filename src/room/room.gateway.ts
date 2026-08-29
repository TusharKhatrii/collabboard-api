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

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(RoomGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(
        @MessageBody() roomId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(roomId);
        this.logger.log(`Client ${client.id} joined room: ${roomId}`);

        // tell everyone else in the room someone joined
        client.to(roomId).emit('participant-joined', { socketId: client.id });

        return { status: 'joined', roomId };
    }

    @SubscribeMessage('leave-room')
    handleLeaveRoom(
        @MessageBody() roomId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(roomId);
        this.logger.log(`Client ${client.id} left room: ${roomId}`);
        client.to(roomId).emit('participant-left', { socketId: client.id });
    }
}