import { io, Socket } from "socket.io-client";
import type { MessageItem } from "./conversation.service";

const WS_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3030/api").replace(
        /\/api\/?$/,
        ""
      )
    : "http://localhost:3030";

let socket: Socket | null = null;

export type NewMessagePayload = MessageItem;

export function getSocket(token: string | null): Socket | null {
  if (typeof window === "undefined") return null;
  if (!token) {
    disconnect();
    return null;
  }
  if (socket?.connected) {
    return socket;
  }
  disconnect();
  socket = io(WS_BASE, {
    auth: { token },
    path: "/socket.io",
  });
  return socket;
}

export function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Gửi message qua socket. Payload: { conversationId, content } */
export function sendMessage(
  s: Socket,
  conversationId: string,
  content: string
): void {
  s.emit("send_message", { conversationId, content });
}

/** Join room conversation để nhận new_message realtime (cần khi mở conversation hoặc conversation mới tạo sau lúc connect). */
export function joinConversation(
  s: Socket,
  conversationId: string
): void {
  s.emit("join_conversation", { conversationId });
}
