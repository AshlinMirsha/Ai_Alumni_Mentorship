import type { Conversation, Message } from "@/types";
import {
  loadConversations,
  sendConversationMessage,
  markConversationAsRead,
  getOrCreateConversationForAlumni,
} from "@/lib/dashboard-storage";

export interface IMessagingService {
  getConversations(): Promise<Conversation[]>;
  sendMessage(conversationId: string, content: string): Promise<Message | null>;
  markAsRead(conversationId: string): Promise<void>;
  startConversationWithAlumni(alumni: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    company: string;
  }): Promise<Conversation>;
}

export class MockMessagingService implements IMessagingService {
  async getConversations(): Promise<Conversation[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return loadConversations();
  }

  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return sendConversationMessage(conversationId, content);
  }

  async markAsRead(conversationId: string): Promise<void> {
    markConversationAsRead(conversationId);
  }

  async startConversationWithAlumni(alumni: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    company: string;
  }): Promise<Conversation> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getOrCreateConversationForAlumni(alumni);
  }
}

export const messagingService = new MockMessagingService();
