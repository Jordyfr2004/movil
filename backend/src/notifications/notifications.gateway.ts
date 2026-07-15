import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';

import {
  User,
  UserRole,
  UserStatus,
} from '../users/entities/user.entity';
import { SessionConnectionsService } from '../auth/session-connections.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly sessionConnectionsService:
      SessionConnectionsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization
          ?.toString()
          .replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload =
        await this.jwtService.verifyAsync(token);

      if (!payload.sub) {
        client.disconnect();
        return;
      }

      const user = await this.userRepo.findOne({
        where: {
          id: payload.sub,
        },
      });

      if (
        !user ||
        !user.is_active ||
        user.status !== UserStatus.ACTIVE
      ) {
        client.disconnect();
        return;
      }

      // Solo permite access tokens de la sesión vigente
      if (
        payload.token_type !== 'access' ||
        payload.session_version !==
          user.session_version
      ) {
        client.disconnect();
        return;
      }

      client.data.user = {
        user_id: user.id,
        email: payload.email,
        role: user.role,
      };

      // Registra el socket para poder cerrarlo desde logout
      this.sessionConnectionsService.addConnection(
        user.id,
        client,
      );

      client.join(`user:${user.id}`);

      if (user.role === UserRole.STUDENT) {
        client.join('students');
      }

      if (user.role === UserRole.MANAGER) {
        client.join('managers');
      }
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId =
      client.data.user?.user_id;

    if (userId) {
      this.sessionConnectionsService.removeConnection(
        userId,
        client,
      );
    }
  }

  notifyMenuAvailable(payload: {
    restaurant_id: string;
    message: string;
  }) {
    this.server
      .to('students')
      .emit('menu_available', payload);
  }

  notifyDishHidden(payload: {
    dish_id: string;
    restaurant_id: string;
  }) {
    this.server
      .to('students')
      .emit('dish_hidden', payload);
  }

  notifyDishAvailable(payload: {
    dish_id: string;
    restaurant_id: string;
  }) {
    this.server
      .to('students')
      .emit('dish_available', payload);
  }

  notifyDishCreated(payload: {
    dish: any;
  }) {
    this.server
      .to('students')
      .emit('dish_created', payload);
  }

  notifyDishUpdated(payload: {
    dish: any;
  }) {
    this.server
      .to('students')
      .emit('dish_updated', payload);
  }

  notifyDishDeleted(payload: {
    dish_id: string;
    restaurant_id: string;
  }) {
    this.server
      .to('students')
      .emit('dish_deleted', payload);
  }

  notifyReservationDelivered(
    userId: string,
    payload: {
      notification_id: string;
      reservation_id: string;
      title: string;
      message: string;
      status: string;
      delivery_status: string;
      delivered_at: Date;
      is_read: boolean;
      created_at: Date;
    },
  ) {
    this.server
      .to(`user:${userId}`)
      .emit('reservation_delivered', payload);
  }
}