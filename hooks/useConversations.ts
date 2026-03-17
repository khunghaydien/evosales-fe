"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";

export function useConversations(title?: string) {
  return useInfiniteQuery({
    queryKey: ["conversations", { title: title ?? "" }],
    queryFn: ({ pageParam }) =>
      conversationService.listConversations({
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: 20,
        title: title && title.trim().length > 0 ? title.trim() : undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 1000,
  });
}
