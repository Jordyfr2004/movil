import {OnGatewayConnection,WebSocketGateway,WebSocketServer,} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.toString().replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = {
        user_id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      if (payload.role === 'STUDENT') {
        client.join('students');
      }

      if (payload.role === 'MANAGER') {
        client.join('managers');
      }
    } catch {
      client.disconnect();
    }
  }

  notifyMenuAvailable(payload: {
    restaurant_id: string;
    message: string;
  }) {
    this.server.to('students').emit('menu_available', payload);
  }

  notifyDishHidden(payload: {
    dish_id: string;
    restaurant_id: string;
  }) {
    this.server.to('students').emit('dish_hidden', payload);
  }

  notifyDishAvailable(payload: {
    dish_id: string;
    restaurant_id: string;
  }) {
    this.server.to('students').emit('dish_available', payload);
  }
}
