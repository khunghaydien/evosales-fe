import { useQuery } from "@tanstack/react-query";
import { conversationsService } from "@/services/conversations.service";

const ONE_MINUTE = 60_000;

function conversationsQueryKey(pageId: string | null) {
  return ["conversations", pageId] as const;
}

export function useConversationsByPage(pageId: string | null) {
  return useQuery({
    queryKey: conversationsQueryKey(pageId),
    queryFn: () => conversationsService.listConversations(pageId as string),
    enabled: !!pageId,
    staleTime: 0,
    refetchInterval: ONE_MINUTE,
    refetchOnWindowFocus: true,
    select: (res) => res.data,
  });
}
