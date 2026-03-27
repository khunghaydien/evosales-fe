import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsService,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/services/products.service";

const FIVE_MINUTES = 5 * 60 * 1000;

function productsQueryKey(pageId: string | null) {
  return ["products", pageId] as const;
}

export function useProductsByPage(pageId: string | null) {
  return useQuery({
    queryKey: productsQueryKey(pageId),
    queryFn: () => productsService.listProducts(pageId as string),
    enabled: !!pageId,
    staleTime: FIVE_MINUTES,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => res.data,
  });
}

export function useProductDetail(id: string | null) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => productsService.getProduct(id as string),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

export function useCreateProduct(pageUuid: string | null) {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<
      ReturnType<typeof productsService.createProduct> |
      ReturnType<typeof productsService.createProducts>
    >,
    Error,
    | Omit<CreateProductPayload, "pageId">
    | Array<Omit<CreateProductPayload, "pageId">>
  >({
    mutationFn: (
      payload:
        | Omit<CreateProductPayload, "pageId">
        | Array<Omit<CreateProductPayload, "pageId">>
    ) => {
      if (!pageUuid) throw new Error("Missing page");
      if (Array.isArray(payload)) {
        return productsService.createProducts(
          payload.map((item) => ({ ...item, pageId: pageUuid }))
        );
      }
      return productsService.createProduct({ ...payload, pageId: pageUuid });
    },
    onSuccess: async () => {
      if (pageUuid) {
        await queryClient.invalidateQueries({
          queryKey: productsQueryKey(pageUuid),
        });
      }
    },
  });
}

export function useUpdateProduct(pageUuid: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => productsService.updateProduct(id, payload),
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({
        queryKey: ["products", "detail", vars.id],
      });
      if (pageUuid) {
        await queryClient.invalidateQueries({
          queryKey: productsQueryKey(pageUuid),
        });
      }
    },
  });
}

export function useDeleteProduct(pageUuid: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.removeProduct(id),
    onSuccess: async () => {
      if (pageUuid) {
        await queryClient.invalidateQueries({
          queryKey: productsQueryKey(pageUuid),
        });
      }
    },
  });
}
