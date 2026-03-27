import { authAxiosService } from "./axios.service";

export type PageAiConfig = {
  [key: string]: unknown;
} | null;

export type PageTemplates = {
  [key: string]: unknown;
} | null;

export interface PageItem {
  id: string;
  userId: string;
  pageId: string;
  systemPrompt: string | null;
  aiConfig: PageAiConfig;
  templates: PageTemplates;
  orderShipConfig: Record<string, unknown> | null;
  orderCollectionConfig: Record<string, unknown> | null;
  ragConfig: Record<string, unknown> | null;
  orderConfig: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePagePayload {
  pageId: string;
  systemPrompt?: PageItem["systemPrompt"];
  aiConfig?: PageItem["aiConfig"];
  templates?: PageItem["templates"];
  orderShipConfig?: PageItem["orderShipConfig"];
  orderCollectionConfig?: PageItem["orderCollectionConfig"];
  ragConfig?: PageItem["ragConfig"];
  orderConfig?: PageItem["orderConfig"];
}

export interface UpdatePagePayload {
  systemPrompt?: PageItem["systemPrompt"];
  aiConfig?: PageItem["aiConfig"];
  templates?: PageItem["templates"];
  orderShipConfig?: PageItem["orderShipConfig"];
  orderCollectionConfig?: PageItem["orderCollectionConfig"];
  ragConfig?: PageItem["ragConfig"];
  orderConfig?: PageItem["orderConfig"];
}

export type MutationResponse<T> = T & {
  message?: string;
};

async function listPages(): Promise<PageItem[]> {
  const { data } = await authAxiosService.get<PageItem[]>("/pages");
  return data;
}

async function getPageDetail(id: string): Promise<PageItem> {
  const { data } = await authAxiosService.get<PageItem>(`/pages/${id}`);
  return data;
}

async function createPage(
  payload: CreatePagePayload
): Promise<MutationResponse<PageItem>> {
  const { data } = await authAxiosService.post<MutationResponse<PageItem>>(
    "/pages",
    payload
  );
  return data;
}

async function updatePage(
  id: string,
  payload: UpdatePagePayload
): Promise<MutationResponse<PageItem>> {
  const { data } = await authAxiosService.patch<MutationResponse<PageItem>>(
    `/pages/${id}`,
    payload
  );
  return data;
}

async function removePage(
  id: string
): Promise<{
  message?: string;
}> {
  const { data } = await authAxiosService.delete<{ message?: string }>(
    `/pages/${id}`
  );
  return data;
}

export const pagesService = {
  listPages,
  getPageDetail,
  createPage,
  updatePage,
  removePage,
};
