import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pagesService } from "@/services/pages.service";

const FIVE_MINUTES = 5 * 60 * 1000;

export function usePagesList() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: pagesService.listPages,
    staleTime: FIVE_MINUTES,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePageDetail(pageId: string | null) {
  return useQuery({
    queryKey: ["pages", "detail", pageId],
    queryFn: () => pagesService.getPageDetail(pageId as string),
    enabled: !!pageId,
    staleTime: FIVE_MINUTES,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pagesService.createPage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof pagesService.updatePage>[1];
    }) => pagesService.updatePage(id, payload),
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["pages"] });
      await queryClient.invalidateQueries({
        queryKey: ["pages", "detail", vars.id],
      });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pagesService.removePage,
    onSuccess: async (_, deletedId) => {
      await queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.removeQueries({ queryKey: ["pages", "detail", deletedId] });
    },
  });
}
