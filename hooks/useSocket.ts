"use client";

import { useEffect, useRef, useState } from "react";
import { TokenStorage } from "@/libs/ultils/tokenStorage";
import { getSocket, disconnect } from "@/services/socket.service";
import type { Socket } from "socket.io-client";

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token = TokenStorage.getAccessToken();
    if (!token) {
      disconnect();
      setSocket(null);
      tokenRef.current = null;
      return;
    }
    if (tokenRef.current === token && socket?.connected) {
      return;
    }
    tokenRef.current = token;
    const s = getSocket(token);
    if (s) {
      s.on("connect", () => setSocket(s));
      s.on("disconnect", () => setSocket(null));
      // Set socket ngay để useMessages đăng ký listener sớm, không đợi "connect"
      setSocket(s);
    } else {
      setSocket(null);
    }
    return () => {
      // Không disconnect khi unmount để giữ kết nối khi chuyển component
    };
  }, []);

  return socket;
}
