import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeEmbeddingsService } from "@/services/knowledgeEmbeddings.service";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useKnowledgeEmbeddings(pageId: string | null) {
  return useQuery({
    queryKey: ["knowledge-embeddings", "all"],
    queryFn: knowledgeEmbeddingsService.listKnowledgeEmbeddings,
    enabled: !!pageId,
    staleTime: FIVE_MINUTES,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (all) => all.filter((item) => item.pageId === pageId),
  });
}

export function useCreateChunks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: knowledgeEmbeddingsService.createChunks,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["knowledge-embeddings", "all"],
      });
    },
  });
}
