"use client";

import type {
  Student,
  RoadmapStage,
  MentorshipActivityData,
  Mentorship,
  Conversation,
  Message,
  Notification,
  UserSettings,
} from "@/types";
import {
  currentStudent,
  initialRoadmapStages,
  initialMentorshipActivity,
  notificationsData,
  initialUserSettings,
} from "@/lib/mock-data";

const STUDENT_STORAGE_KEY = "alumnipath_demo_student_profile_v1";
const ROADMAP_STORAGE_KEY = "alumnipath_demo_roadmap_stages_v1";
const MENTORSHIP_STORAGE_KEY = "alumnipath_demo_mentorship_activity_v1";
const NOTIFICATIONS_STORAGE_KEY = "alumnipath_demo_notifications_v1";
const SETTINGS_STORAGE_KEY = "alumnipath_demo_settings_v1";

const listeners = new Set<() => void>();

export function subscribeToDashboardStorage(listener: () => void): () => void {
  listeners.add(listener);
  const handleStorageEvent = () => listener();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

export function notifyDashboardChange(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

// ─── Student Profile Storage ──────────────────────────────────────────────────

let cachedStudentRaw: string | null = null;
let cachedStudentObj: Student = currentStudent;

export function loadStudentProfile(): Student {
  if (typeof window === "undefined") return currentStudent;
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return currentStudent;
    if (raw === cachedStudentRaw) return cachedStudentObj;
    cachedStudentRaw = raw;
    cachedStudentObj = { ...currentStudent, ...JSON.parse(raw) };
    return cachedStudentObj;
  } catch {
    return currentStudent;
  }
}

export function saveStudentProfile(student: Student): void {
  if (typeof window === "undefined") return;
  try {
    const safeData: Partial<Student> = {
      id: student.id,
      name: student.name,
      department: student.department,
      academicYear: student.academicYear,
      graduationYear: student.graduationYear,
      careerGoal: student.careerGoal,
      careerGoals: student.careerGoals,
      skills: student.skills,
      interests: student.interests,
      projects: student.projects,
      bio: student.bio,
      headline: student.headline,
      university: student.university,
      avatar: student.avatar,
    };
    const serialized = JSON.stringify(safeData);
    localStorage.setItem(STUDENT_STORAGE_KEY, serialized);
    cachedStudentRaw = serialized;
    cachedStudentObj = { ...currentStudent, ...safeData };
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist student profile to localStorage", err);
  }
}

export function resetStudentProfile(): Student {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STUDENT_STORAGE_KEY);
      cachedStudentRaw = null;
      cachedStudentObj = currentStudent;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return currentStudent;
}

// ─── Career Roadmap Stages Storage ───────────────────────────────────────────

let cachedRoadmapRaw: string | null = null;
let cachedRoadmapObj: RoadmapStage[] = initialRoadmapStages;

export function loadRoadmapStages(): RoadmapStage[] {
  if (typeof window === "undefined") return initialRoadmapStages;
  try {
    const raw = localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (!raw) return initialRoadmapStages;
    if (raw === cachedRoadmapRaw) return cachedRoadmapObj;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedRoadmapRaw = raw;
      cachedRoadmapObj = parsed;
      return cachedRoadmapObj;
    }
    return initialRoadmapStages;
  } catch {
    return initialRoadmapStages;
  }
}

export function saveRoadmapStages(stages: RoadmapStage[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(stages);
    localStorage.setItem(ROADMAP_STORAGE_KEY, serialized);
    cachedRoadmapRaw = serialized;
    cachedRoadmapObj = stages;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist roadmap stages to localStorage", err);
  }
}

export function resetRoadmapStages(): RoadmapStage[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ROADMAP_STORAGE_KEY);
      cachedRoadmapRaw = null;
      cachedRoadmapObj = initialRoadmapStages;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return initialRoadmapStages;
}

// ─── Mentorship Activity Storage ──────────────────────────────────────────────

let cachedMentorshipRaw: string | null = null;
let cachedMentorshipObj: MentorshipActivityData = initialMentorshipActivity;

export function loadMentorshipActivity(): MentorshipActivityData {
  if (typeof window === "undefined") return initialMentorshipActivity;
  try {
    const raw = localStorage.getItem(MENTORSHIP_STORAGE_KEY);
    if (!raw) return initialMentorshipActivity;
    if (raw === cachedMentorshipRaw) return cachedMentorshipObj;
    const parsed = JSON.parse(raw);
    cachedMentorshipRaw = raw;
    cachedMentorshipObj = {
      pendingRequests: parsed.pendingRequests ?? initialMentorshipActivity.pendingRequests,
      acceptedMentorships: parsed.acceptedMentorships ?? initialMentorshipActivity.acceptedMentorships,
      declinedRequests: parsed.declinedRequests ?? initialMentorshipActivity.declinedRequests ?? [],
      recentConversations: parsed.recentConversations ?? initialMentorshipActivity.recentConversations,
    };
    return cachedMentorshipObj;
  } catch {
    return initialMentorshipActivity;
  }
}

export function saveMentorshipActivity(data: MentorshipActivityData): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(MENTORSHIP_STORAGE_KEY, serialized);
    cachedMentorshipRaw = serialized;
    cachedMentorshipObj = data;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist mentorship activity to localStorage", err);
  }
}

export function resetMentorshipActivity(): MentorshipActivityData {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(MENTORSHIP_STORAGE_KEY);
      cachedMentorshipRaw = null;
      cachedMentorshipObj = initialMentorshipActivity;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return initialMentorshipActivity;
}

// ─── Mentorship Workflow Actions ──────────────────────────────────────────────

export function acceptMentorshipRequest(requestId: string): { success: boolean; conversationId?: string } {
  const current = loadMentorshipActivity();
  const reqIndex = current.pendingRequests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) return { success: false };

  const targetReq = current.pendingRequests[reqIndex];
  const updatedPending = current.pendingRequests.filter((r) => r.id !== requestId);

  const acceptedItem: Mentorship = {
    ...targetReq,
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    nextSession: new Date(Date.now() + 7 * 86400000).toISOString(),
    sessionCount: 1,
  };

  // Determine conversation participant info
  const isIncoming = targetReq.direction === "incoming";
  const participantId = isIncoming && targetReq.student ? targetReq.student.id : targetReq.alumni.id;
  const participantName = isIncoming && targetReq.student ? targetReq.student.name : targetReq.alumni.name;
  const participantRole = isIncoming && targetReq.student ? targetReq.student.careerGoal || "Student" : targetReq.alumni.role;
  const participantCompany = isIncoming ? "University of Technology" : targetReq.alumni.company;

  // Check or create conversation
  let convId = "";
  const existingConv = current.recentConversations.find((c) => c.participantId === participantId);
  let updatedConversations = [...current.recentConversations];

  if (existingConv) {
    convId = existingConv.id;
  } else {
    convId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: convId,
      participantId,
      participantName,
      participantRole,
      participantCompany,
      lastMessage: "Mentorship request accepted. Let's schedule our initial session!",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          conversationId: convId,
          senderId: "system",
          senderName: "AlumniPath System",
          content: `Mentorship connection established for: ${targetReq.focus}. You can now exchange direct career messages.`,
          timestamp: new Date().toISOString(),
          read: true,
        },
      ],
    };
    updatedConversations = [newConv, ...updatedConversations];
  }

  const updatedActivity: MentorshipActivityData = {
    ...current,
    pendingRequests: updatedPending,
    acceptedMentorships: [acceptedItem, ...current.acceptedMentorships],
    recentConversations: updatedConversations,
  };

  saveMentorshipActivity(updatedActivity);

  // Add notification
  addNotification({
    id: `notif-${Date.now()}`,
    type: "mentorship_request",
    title: `Mentorship accepted: ${participantName}`,
    description: `You are now connected with ${participantName}. You can start messaging right away.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/messages?conversationId=${convId}`,
    actorName: participantName,
  });

  return { success: true, conversationId: convId };
}

export function declineMentorshipRequest(requestId: string, reason?: string): boolean {
  const current = loadMentorshipActivity();
  const req = current.pendingRequests.find((r) => r.id === requestId);
  if (!req) return false;

  const updatedPending = current.pendingRequests.filter((r) => r.id !== requestId);
  const declinedItem: Mentorship = {
    ...req,
    status: "declined",
    declinedReason: reason || "Currently unavailable for mentorship engagement.",
  };

  const existingDeclined = current.declinedRequests || [];
  const updatedActivity: MentorshipActivityData = {
    ...current,
    pendingRequests: updatedPending,
    declinedRequests: [declinedItem, ...existingDeclined],
  };

  saveMentorshipActivity(updatedActivity);
  return true;
}

export function cancelMentorshipRequest(requestId: string): boolean {
  const current = loadMentorshipActivity();
  const updatedPending = current.pendingRequests.filter((r) => r.id !== requestId);
  if (updatedPending.length === current.pendingRequests.length) return false;

  const updatedActivity: MentorshipActivityData = {
    ...current,
    pendingRequests: updatedPending,
  };
  saveMentorshipActivity(updatedActivity);
  return true;
}

// ─── Messaging Actions ────────────────────────────────────────────────────────

export function loadConversations(): Conversation[] {
  return loadMentorshipActivity().recentConversations;
}

export function sendConversationMessage(conversationId: string, content: string): Message | null {
  if (!content.trim()) return null;
  const current = loadMentorshipActivity();
  const convIndex = current.recentConversations.findIndex((c) => c.id === conversationId);
  if (convIndex === -1) return null;

  const student = loadStudentProfile();
  const targetConv = current.recentConversations[convIndex];
  const nowIso = new Date().toISOString();

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: student.id,
    senderName: student.name,
    content: content.trim(),
    timestamp: nowIso,
    read: true,
  };

  const updatedConv: Conversation = {
    ...targetConv,
    lastMessage: content.trim(),
    lastMessageAt: nowIso,
    messages: [...targetConv.messages, newMessage],
  };

  const updatedConversations = [...current.recentConversations];
  updatedConversations[convIndex] = updatedConv;

  saveMentorshipActivity({
    ...current,
    recentConversations: updatedConversations,
  });

  return newMessage;
}

export function markConversationAsRead(conversationId: string): void {
  const current = loadMentorshipActivity();
  const convIndex = current.recentConversations.findIndex((c) => c.id === conversationId);
  if (convIndex === -1) return;

  const targetConv = current.recentConversations[convIndex];
  if (targetConv.unreadCount === 0) return;

  const updatedMessages = targetConv.messages.map((m) => ({ ...m, read: true }));
  const updatedConv: Conversation = {
    ...targetConv,
    unreadCount: 0,
    messages: updatedMessages,
  };

  const updatedConversations = [...current.recentConversations];
  updatedConversations[convIndex] = updatedConv;

  saveMentorshipActivity({
    ...current,
    recentConversations: updatedConversations,
  });
}

export function getOrCreateConversationForAlumni(alumni: {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  company: string;
}): Conversation {
  const current = loadMentorshipActivity();
  const existing = current.recentConversations.find((c) => c.participantId === alumni.id);
  if (existing) return existing;

  const newId = `conv-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const newConv: Conversation = {
    id: newId,
    participantId: alumni.id,
    participantName: alumni.name,
    participantAvatar: alumni.avatar,
    participantRole: alumni.role,
    participantCompany: alumni.company,
    lastMessage: "Conversation initiated.",
    lastMessageAt: nowIso,
    unreadCount: 0,
    messages: [
      {
        id: `msg-init-${Date.now()}`,
        conversationId: newId,
        senderId: "system",
        senderName: "AlumniPath System",
        content: `Direct messaging channel opened with ${alumni.name} (${alumni.role} at ${alumni.company}).`,
        timestamp: nowIso,
        read: true,
      },
    ],
  };

  saveMentorshipActivity({
    ...current,
    recentConversations: [newConv, ...current.recentConversations],
  });

  return newConv;
}

// ─── Notifications Storage ────────────────────────────────────────────────────

let cachedNotificationsRaw: string | null = null;
let cachedNotificationsObj: Notification[] = notificationsData;

export function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return notificationsData;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return notificationsData;
    if (raw === cachedNotificationsRaw) return cachedNotificationsObj;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedNotificationsRaw = raw;
      cachedNotificationsObj = parsed;
      return cachedNotificationsObj;
    }
    return notificationsData;
  } catch {
    return notificationsData;
  }
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(notifications);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, serialized);
    cachedNotificationsRaw = serialized;
    cachedNotificationsObj = notifications;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist notifications", err);
  }
}

export function addNotification(notification: Notification): void {
  const current = loadNotifications();
  saveNotifications([notification, ...current]);
}

export function markNotificationAsRead(id: string): void {
  const current = loadNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = loadNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function resetNotifications(): Notification[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      cachedNotificationsRaw = null;
      cachedNotificationsObj = notificationsData;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return notificationsData;
}

// ─── User Settings Storage ────────────────────────────────────────────────────

let cachedSettingsRaw: string | null = null;
let cachedSettingsObj: UserSettings = initialUserSettings;

export function loadUserSettings(): UserSettings {
  if (typeof window === "undefined") return initialUserSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return initialUserSettings;
    if (raw === cachedSettingsRaw) return cachedSettingsObj;
    const parsed = JSON.parse(raw);
    cachedSettingsRaw = raw;
    cachedSettingsObj = {
      account: { ...initialUserSettings.account, ...parsed.account },
      profile: { ...initialUserSettings.profile, ...parsed.profile },
      careerPreferences: { ...initialUserSettings.careerPreferences, ...parsed.careerPreferences },
      notificationPreferences: { ...initialUserSettings.notificationPreferences, ...parsed.notificationPreferences },
      privacy: { ...initialUserSettings.privacy, ...parsed.privacy },
      appearance: { ...initialUserSettings.appearance, ...parsed.appearance },
    };
    return cachedSettingsObj;
  } catch {
    return initialUserSettings;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
    cachedSettingsRaw = serialized;
    cachedSettingsObj = settings;

    // Also synchronize profile changes with student profile storage
    const currentStudent = loadStudentProfile();
    saveStudentProfile({
      ...currentStudent,
      name: settings.profile.name || currentStudent.name,
      department: settings.profile.department || currentStudent.department,
      academicYear: settings.profile.academicYear || currentStudent.academicYear,
      graduationYear: settings.profile.graduationYear || currentStudent.graduationYear,
      bio: settings.profile.bio || currentStudent.bio,
      headline: settings.profile.headline || currentStudent.headline,
      careerGoal: settings.careerPreferences.targetRole || currentStudent.careerGoal,
    });

    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist user settings", err);
  }
}

export function resetUserSettings(): UserSettings {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      cachedSettingsRaw = null;
      cachedSettingsObj = initialUserSettings;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return initialUserSettings;
}

