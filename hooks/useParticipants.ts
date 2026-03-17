"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";

export function useParticipants(conversationId: string | null) {
  return useQuery({
    queryKey: ["participants", conversationId],
    queryFn: () => conversationService.getParticipants(conversationId!),
    enabled: !!conversationId,
    staleTime: 60 * 1000,
  });
}
