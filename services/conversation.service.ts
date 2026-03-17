import { authAxiosService } from "./axios.service";

export interface Conversation {
  id: string;
  type: "PRIVATE" | "GROUP";
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    userName: string;
    publicKey: string;
  } | null;
}

export interface ListConversationsResult {
  items: Conversation[];
  nextCursor: string | null;
}

export interface ListMessagesResult {
  items: MessageItem[];
  nextCursor: string | null;
}

export interface Participant {
  id: string;
  userName: string;
  publicKey: string;
}

class ConversationService {
  async listConversations(params?: {
    cursor?: string;
    limit?: number;
    title?: string;
  }): Promise<ListConversationsResult> {
    const { data } = await authAxiosService.get<ListConversationsResult>(
      "/conversations",
      { params }
    );
    return data;
  }

  async listMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<ListMessagesResult> {
    const { data } = await authAxiosService.get<{
      items: MessageItem[];
      nextCursor: string | null;
    }>(`/conversations/${conversationId}/messages`, { params });
    return { items: data.items, nextCursor: data.nextCursor };
  }

  /** Tạo hội thoại 1-1: participantIds = [userId của người còn lại] */
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const { data } = await authAxiosService.post<Conversation>(
      "/conversations",
      { participantIds }
    );
    return data;
  }

  async getParticipants(conversationId: string): Promise<Participant[]> {
    const { data } = await authAxiosService.get<Participant[]>(
      `/conversations/${conversationId}/participants`
    );
    return data;
  }

  /** Gửi tin nhắn qua REST API. Backend lưu DB và emit new_message qua socket. */
  async sendMessage(conversationId: string, content: string): Promise<MessageItem> {
    const { data } = await authAxiosService.post<MessageItem>(
      `/conversations/${conversationId}/messages`,
      { content }
    );
    return data;
  }
}

export const conversationService = new ConversationService();
