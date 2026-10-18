import type { Mentorship, MentorshipActivityData } from "@/types";
import {
  loadMentorshipActivity,
  saveMentorshipActivity,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  cancelMentorshipRequest,
} from "@/lib/dashboard-storage";

export interface IMentorshipService {
  getMentorshipActivity(): Promise<MentorshipActivityData>;
  acceptRequest(requestId: string): Promise<{ success: boolean; conversationId?: string }>;
  declineRequest(requestId: string, reason?: string): Promise<{ success: boolean }>;
  cancelRequest(requestId: string): Promise<{ success: boolean }>;
  submitRequest(request: Mentorship): Promise<{ success: boolean }>;
}

export class MockMentorshipService implements IMentorshipService {
  async getMentorshipActivity(): Promise<MentorshipActivityData> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return loadMentorshipActivity();
  }

  async acceptRequest(requestId: string): Promise<{ success: boolean; conversationId?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return acceptMentorshipRequest(requestId);
  }

  async declineRequest(requestId: string, reason?: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const success = declineMentorshipRequest(requestId, reason);
    return { success };
  }

  async cancelRequest(requestId: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const success = cancelMentorshipRequest(requestId);
    return { success };
  }

  async submitRequest(request: Mentorship): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const current = loadMentorshipActivity();
    saveMentorshipActivity({
      ...current,
      pendingRequests: [request, ...current.pendingRequests],
    });
    return { success: true };
  }
}

export const mentorshipService = new MockMentorshipService();
