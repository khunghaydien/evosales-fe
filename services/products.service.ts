import { authAxiosService } from "./axios.service";

export interface ProductItem {
  id: string;
  pageId: string;
  code: string;
  name: string;
  images: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CursorPageInfo {
  hasNextPage: boolean;
  endCursor: { createdAt: string; id: string } | null;
}

export interface ProductsListResult {
  data: ProductItem[];
  pageInfo: CursorPageInfo;
}

export interface CreateProductPayload {
  pageId: string;
  code: string;
  name: string;
  images: string[];
  content: string;
}

export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, "pageId">
>;

export type BulkUpdateProductPayload = UpdateProductPayload & { id: string };

async function listProducts(
  pageId: string,
  params?: { limit?: number }
): Promise<ProductsListResult> {
  const { data } = await authAxiosService.get<ProductsListResult>(
    "/products",
    {
      params: {
        pageId,
        limit: params?.limit ?? 100,
      },
    }
  );
  return data;
}

async function getProduct(id: string): Promise<ProductItem> {
  const { data } = await authAxiosService.get<ProductItem>(`/products/${id}`);
  return data;
}

async function createProduct(
  payload: CreateProductPayload
): Promise<ProductItem> {
  const { data } = await authAxiosService.post<ProductItem>(
    "/products",
    payload
  );
  return data;
}

async function createProducts(
  payloads: CreateProductPayload[]
): Promise<ProductItem[]> {
  const { data } = await authAxiosService.post<ProductItem[]>(
    "/products/bulk",
    { items: payloads }
  );
  return data;
}

async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<ProductItem> {
  const { data } = await authAxiosService.patch<ProductItem>(
    `/products/${id}`,
    payload
  );
  return data;
}

async function updateProducts(
  payloads: BulkUpdateProductPayload[]
): Promise<ProductItem[]> {
  const { data } = await authAxiosService.put<ProductItem[]>(
    "/products/bulk",
    payloads
  );
  return data;
}

async function removeProduct(id: string): Promise<void> {
  await authAxiosService.delete(`/products/${id}`);
}

export const productsService = {
  listProducts,
  getProduct,
  createProduct,
  createProducts,
  updateProduct,
  updateProducts,
  removeProduct,
};
