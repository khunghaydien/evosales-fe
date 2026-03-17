import { authAxiosService } from "./axios.service";

export interface KnowledgeEmbeddingItem {
  id: string;
  pageId: string | null;
  chunk: string;
  embedding?: number[] | null;
}

export interface CreateChunksPayload {
  pageId?: string | null;
  content: string;
}

async function listKnowledgeEmbeddings(): Promise<KnowledgeEmbeddingItem[]> {
  const { data } = await authAxiosService.get<KnowledgeEmbeddingItem[]>(
    "/knowledge-embeddings"
  );
  return data;
}

async function createChunks(
  payload: CreateChunksPayload
): Promise<{ message?: string; items?: KnowledgeEmbeddingItem[] } | KnowledgeEmbeddingItem[]> {
  const { data } = await authAxiosService.post<
    { message?: string; items?: KnowledgeEmbeddingItem[] } | KnowledgeEmbeddingItem[]
  >(
    "/knowledge-embeddings/chunks",
    payload
  );
  return data;
}

export const knowledgeEmbeddingsService = {
  listKnowledgeEmbeddings,
  createChunks,
};
