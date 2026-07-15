import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SessionConnectionsService {
  private readonly connections =
    new Map<string, Set<Socket>>();

  addConnection(
    userId: string,
    client: Socket,
  ) {
    const userConnections =
      this.connections.get(userId) ?? new Set<Socket>();

    userConnections.add(client);
    this.connections.set(userId, userConnections);
  }

  removeConnection(
    userId: string,
    client: Socket,
  ) {
    const userConnections =
      this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    userConnections.delete(client);

    if (userConnections.size === 0) {
      this.connections.delete(userId);
    }
  }

  disconnectUser(userId: string) {
    const userConnections =
      this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    for (const client of userConnections) {
      client.disconnect(true);
    }

    this.connections.delete(userId);
  }
}