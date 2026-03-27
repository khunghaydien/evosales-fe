import { authAxiosService } from "./axios.service";
import type { CursorPageInfo } from "./products.service";

export type ConversationStatus =
  | "never_messaged"
  | "order_info_collected"
  | "shipping_info_collected"
  | "sold";

export interface ConversationItem {
  id: string;
  pageId: string;
  externalConversationId: string;
  status: ConversationStatus;
  orderInfo: Record<string, unknown> | null;
  shippingInfo: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsListResult {
  data: ConversationItem[];
  pageInfo: CursorPageInfo;
}

async function listConversations(
  pageId: string,
  params?: { limit?: number }
): Promise<ConversationsListResult> {
  const { data } = await authAxiosService.get<ConversationsListResult>(
    "/conversations",
    {
      params: {
        pageId,
        limit: params?.limit ?? 100,
      },
    }
  );
  return data;
}

export const conversationsService = {
  listConversations,
};
