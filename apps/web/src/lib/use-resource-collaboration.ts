"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  createCollaborationSocket,
  type CollaborationPresenceUser,
  type CollaborationSnapshot,
  type CollaborationUpdatedPayload,
} from "@/src/lib/collaboration";

export type CollaborationConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseResourceCollaborationOptions<TContent extends object> {
  resourceId: string | null;
  onSnapshot: (snapshot: CollaborationSnapshot, content: TContent) => void;
  onUpdated: (payload: CollaborationUpdatedPayload, content: TContent) => void;
  fallbackContent: TContent;
}

export function useResourceCollaboration<TContent extends object>(
  options: UseResourceCollaborationOptions<TContent>,
) {
  const { resourceId, onSnapshot, onUpdated, fallbackContent } = options;

  const [presenceUsers, setPresenceUsers] = useState<CollaborationPresenceUser[]>(
    [],
  );
  const [connectionStatus, setConnectionStatus] =
    useState<CollaborationConnectionStatus>("idle");
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = createCollaborationSocket();
    socketRef.current = socket;

    if (!socket) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");

    const handleConnect = () => {
      setConnectionStatus("connected");
      setLastEventMessage("实时协同已连接");
    };

    const handleDisconnect = () => {
      setConnectionStatus("disconnected");
      setLastEventMessage("实时协同已断开，当前将回退到 HTTP 保存");
    };

    const handleConnectError = () => {
      setConnectionStatus("error");
      setLastEventMessage("实时协同连接失败，当前将回退到 HTTP 保存");
    };

    const handleSnapshot = (snapshot: CollaborationSnapshot) => {
      if (snapshot.id !== resourceId) {
        return;
      }

      const content = (snapshot.content ?? fallbackContent) as TContent;
      onSnapshot(snapshot, content);
      setLastEventMessage("已同步最新协同快照");
    };

    const handlePresence = (presence: CollaborationPresenceUser[]) => {
      setPresenceUsers(presence);
    };

    const handleUpdated = (payload: CollaborationUpdatedPayload) => {
      if (payload.id !== resourceId) {
        return;
      }

      const content = (payload.content ?? fallbackContent) as TContent;
      onUpdated(payload, content);
      setLastEventMessage(`已同步 ${payload.updatedBy.username} 的修改`);
    };

    const handleConflict = (payload: { message?: string }) => {
      setLastEventMessage(payload.message || "协同冲突，已回滚到服务器最新版本");
    };

    const handleError = (payload: { message?: string }) => {
      setConnectionStatus("error");
      setLastEventMessage(payload.message || "实时协同连接发生错误");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("resource:snapshot", handleSnapshot);
    socket.on("presence:update", handlePresence);
    socket.on("resource:updated", handleUpdated);
    socket.on("resource:conflict", handleConflict);
    socket.on("collaboration:error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("resource:snapshot", handleSnapshot);
      socket.off("presence:update", handlePresence);
      socket.off("resource:updated", handleUpdated);
      socket.off("resource:conflict", handleConflict);
      socket.off("collaboration:error", handleError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fallbackContent, onSnapshot, onUpdated, resourceId]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !resourceId) {
      return;
    }

    socket.emit("resource:join", {
      resourceId,
    });

    return () => {
      socket.emit("resource:leave", {
        resourceId,
      });
    };
  }, [resourceId]);

  function emitResourceUpdate(payload: {
    resourceId: string;
    content: object;
    baseRevision?: string;
  }) {
    const socket = socketRef.current;

    if (!socket?.connected) {
      return false;
    }

    socket.emit("resource:update", payload);
    return true;
  }

  return {
    socket: socketRef.current,
    presenceUsers,
    connectionStatus,
    lastEventMessage,
    setLastEventMessage,
    emitResourceUpdate,
  };
}