import { authAxiosService } from "./axios.service";
import type { CursorPageInfo } from "./products.service";

export interface FaqItem {
  id: string;
  pageId: string;
  question: string;
  intent: string;
  answer: string;
  keywords: string[] | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface FaqsListResult {
  data: FaqItem[];
  pageInfo: CursorPageInfo;
}

export interface CreateFaqPayload {
  pageId: string;
  question: string;
  intent: string;
  answer: string;
  keywords?: string[] | null;
  priority?: number;
  isActive?: boolean;
}

export type UpdateFaqPayload = Partial<
  Omit<CreateFaqPayload, "pageId">
>;

export type BulkUpdateFaqPayload = UpdateFaqPayload & { id: string };

async function listFaqs(
  pageId: string,
  params?: { limit?: number }
): Promise<FaqsListResult> {
  const { data } = await authAxiosService.get<FaqsListResult>("/faqs", {
    params: {
      pageId,
      limit: params?.limit ?? 100,
    },
  });
  return data;
}

async function getFaq(id: string): Promise<FaqItem> {
  const { data } = await authAxiosService.get<FaqItem>(`/faqs/${id}`);
  return data;
}

async function createFaq(payload: CreateFaqPayload): Promise<FaqItem> {
  const { data } = await authAxiosService.post<FaqItem>("/faqs", payload);
  return data;
}

async function createFaqs(payloads: CreateFaqPayload[]): Promise<FaqItem[]> {
  const { data } = await authAxiosService.post<FaqItem[]>("/faqs", payloads);
  return data;
}

async function updateFaq(
  id: string,
  payload: UpdateFaqPayload
): Promise<FaqItem> {
  const { data } = await authAxiosService.patch<FaqItem>(`/faqs/${id}`, payload);
  return data;
}

async function updateFaqs(
  payloads: BulkUpdateFaqPayload[]
): Promise<FaqItem[]> {
  const { data } = await authAxiosService.put<FaqItem[]>("/faqs", payloads);
  return data;
}

async function removeFaq(id: string): Promise<void> {
  await authAxiosService.delete(`/faqs/${id}`);
}

export const faqsService = {
  listFaqs,
  getFaq,
  createFaq,
  createFaqs,
  updateFaq,
  updateFaqs,
  removeFaq,
};
