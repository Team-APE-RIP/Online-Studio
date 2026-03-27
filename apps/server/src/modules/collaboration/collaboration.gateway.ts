import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import {
  parseBearerToken,
  verifyAuthToken,
  type AuthTokenPayload,
} from "../../common/auth-token.util";
import { CollaborationService } from "./collaboration.service";

interface CollaborationSocket extends Socket {
  data: Socket["data"] & {
    authUser?: AuthTokenPayload;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:14010",
    credentials: true,
  },
  namespace: "/collaboration",
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly collaborationService: CollaborationService) {}

  handleConnection(client: CollaborationSocket) {
    try {
      const authorization =
        typeof client.handshake.auth?.token === "string"
          ? `Bearer ${client.handshake.auth.token}`
          : typeof client.handshake.headers.authorization === "string"
            ? client.handshake.headers.authorization
            : null;

      const token = parseBearerToken(authorization);
      const authUser = verifyAuthToken(token);
      client.data.authUser = authUser;
    } catch {
      client.emit("collaboration:error", {
        message: "Authentication failed",
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: CollaborationSocket) {
    const removedResources =
      this.collaborationService.removeSocketFromAllResources(client.id);

    for (const item of removedResources) {
      this.server
        .to(this.buildRoomName(item.resourceId))
        .emit("presence:update", item.presence);
    }
  }

  @SubscribeMessage("resource:join")
  async handleJoin(
    client: CollaborationSocket,
    payload: {
      resourceId?: string;
    },
  ) {
    const authUser = client.data.authUser;

    if (!authUser || !payload.resourceId) {
      client.emit("collaboration:error", {
        message: "Invalid join payload",
      });
      return;
    }

    const snapshot = await this.collaborationService.getResourceSnapshot(
      payload.resourceId,
      authUser,
    );

    client.join(this.buildRoomName(payload.resourceId));

    const presence = this.collaborationService.addPresence(
      payload.resourceId,
      client.id,
      authUser,
    );

    client.emit("resource:snapshot", snapshot);
    this.server
      .to(this.buildRoomName(payload.resourceId))
      .emit("presence:update", presence);
  }

  @SubscribeMessage("resource:leave")
  async handleLeave(
    client: CollaborationSocket,
    payload: {
      resourceId?: string;
    },
  ) {
    if (!payload.resourceId) {
      return;
    }

    client.leave(this.buildRoomName(payload.resourceId));

    const presence = this.collaborationService.removePresence(
      payload.resourceId,
      client.id,
    );

    this.server
      .to(this.buildRoomName(payload.resourceId))
      .emit("presence:update", presence);
  }

  @SubscribeMessage("resource:update")
  async handleResourceUpdate(
    client: CollaborationSocket,
    payload: {
      resourceId?: string;
      content?: Record<string, unknown>;
      baseRevision?: string;
    },
  ) {
    const authUser = client.data.authUser;

    if (!authUser || !payload.resourceId || !payload.content) {
      client.emit("collaboration:error", {
        message: "Invalid update payload",
      });
      return;
    }

    try {
      const updated = await this.collaborationService.updateResourceContent({
        resourceId: payload.resourceId,
        authUser,
        content: payload.content,
        baseRevision: payload.baseRevision,
      });

      this.server
        .to(this.buildRoomName(payload.resourceId))
        .emit("resource:updated", updated);
    } catch (error) {
      client.emit("resource:conflict", {
        message:
          error instanceof Error ? error.message : "Failed to update resource",
        resourceId: payload.resourceId,
      });

      const snapshot = await this.collaborationService.getResourceSnapshot(
        payload.resourceId,
        authUser,
      );

      client.emit("resource:snapshot", snapshot);
    }
  }

  private buildRoomName(resourceId: string) {
    return `resource:${resourceId}`;
  }
}