import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  faqsService,
  type CreateFaqPayload,
  type UpdateFaqPayload,
} from "@/services/faqs.service";

const FIVE_MINUTES = 5 * 60 * 1000;

function faqsQueryKey(pageId: string | null) {
  return ["faqs", pageId] as const;
}

export function useFaqsByPage(pageId: string | null) {
  return useQuery({
    queryKey: faqsQueryKey(pageId),
    queryFn: () => faqsService.listFaqs(pageId as string),
    enabled: !!pageId,
    staleTime: FIVE_MINUTES,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => res.data,
  });
}

export function useFaqDetail(id: string | null) {
  return useQuery({
    queryKey: ["faqs", "detail", id],
    queryFn: () => faqsService.getFaq(id as string),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

export function useCreateFaq(pageUuid: string | null) {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<
      ReturnType<typeof faqsService.createFaq> |
      ReturnType<typeof faqsService.createFaqs>
    >,
    Error,
    | Omit<CreateFaqPayload, "pageId">
    | Array<Omit<CreateFaqPayload, "pageId">>
  >({
    mutationFn: (
      payload:
        | Omit<CreateFaqPayload, "pageId">
        | Array<Omit<CreateFaqPayload, "pageId">>
    ) => {
      if (!pageUuid) throw new Error("Missing page");
      if (Array.isArray(payload)) {
        return faqsService.createFaqs(
          payload.map((item) => ({ ...item, pageId: pageUuid }))
        );
      }
      return faqsService.createFaq({ ...payload, pageId: pageUuid });
    },
    onSuccess: async () => {
      if (pageUuid) {
        await queryClient.invalidateQueries({ queryKey: faqsQueryKey(pageUuid) });
      }
    },
  });
}

export function useUpdateFaq(pageUuid: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFaqPayload;
    }) => faqsService.updateFaq(id, payload),
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({
        queryKey: ["faqs", "detail", vars.id],
      });
      if (pageUuid) {
        await queryClient.invalidateQueries({ queryKey: faqsQueryKey(pageUuid) });
      }
    },
  });
}

export function useDeleteFaq(pageUuid: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faqsService.removeFaq(id),
    onSuccess: async () => {
      if (pageUuid) {
        await queryClient.invalidateQueries({ queryKey: faqsQueryKey(pageUuid) });
      }
    },
  });
}
