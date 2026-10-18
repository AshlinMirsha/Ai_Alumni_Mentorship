"use client";

import type {
  Student,
  Alumni,
  RoadmapStage,
  MentorshipActivityData,
  Mentorship,
  Conversation,
  Message,
  Notification,
  UserSettings,
  AuthSession,
  Opportunity,
  CommunityPost,
  CommunityComment,
  DiscoverStudent,
  UserRole,
  MentorshipSession,
  UniversityEvent,
} from "@/types";
import {
  currentStudent,
  defaultAlumniUser,
  initialRoadmapStages,
  initialMentorshipActivity,
  notificationsData,
  initialUserSettings,
  studentsData,
  initialOpportunities,
  initialCommunityPosts,
  initialUpcomingSessions,
  universityEventsData,
} from "@/lib/mock-data";

const STUDENT_STORAGE_KEY = "alumnipath_demo_student_profile_v1";
const ALUMNI_PROFILE_KEY = "alumnipath_demo_alumni_profile_v1";
const AUTH_SESSION_KEY = "alumnipath_demo_auth_session_v1";
const ROADMAP_STORAGE_KEY = "alumnipath_demo_roadmap_stages_v1";
const MENTORSHIP_STORAGE_KEY = "alumnipath_demo_mentorship_activity_v1";
const NOTIFICATIONS_STORAGE_KEY = "alumnipath_demo_notifications_v1";
const SETTINGS_STORAGE_KEY = "alumnipath_demo_settings_v1";
const OPPORTUNITIES_STORAGE_KEY = "alumnipath_demo_opportunities_v1";
const COMMUNITY_POSTS_KEY = "alumnipath_demo_community_posts_v1";
const STUDENTS_STORAGE_KEY = "alumnipath_demo_students_list_v1";
const UPCOMING_SESSIONS_STORAGE_KEY = "alumnipath_demo_upcoming_sessions_v1";
const UNIVERSITY_EVENTS_STORAGE_KEY = "alumnipath_demo_university_events_v1";

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
      completedMentorships: parsed.completedMentorships ?? initialMentorshipActivity.completedMentorships ?? [],
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

export function endMentorship(mentorshipId: string, completionNotes?: string): boolean {
  const current = loadMentorshipActivity();
  const mentee = current.acceptedMentorships.find((m) => m.id === mentorshipId);
  if (!mentee) return false;

  const updatedAccepted = current.acceptedMentorships.filter((m) => m.id !== mentorshipId);

  const existingNotes = mentee.privateNotes || [];
  const updatedNotes = completionNotes?.trim()
    ? [
        ...existingNotes,
        {
          id: `pn-end-${Date.now()}`,
          content: `Mentorship concluded. Completion summary: ${completionNotes.trim()}`,
          createdAt: new Date().toISOString(),
        },
      ]
    : existingNotes;

  const completedItem: Mentorship = {
    ...mentee,
    status: "completed",
    privateNotes: updatedNotes,
    progressPercent: 100,
  };

  const existingCompleted = current.completedMentorships || [];
  const updatedActivity: MentorshipActivityData = {
    ...current,
    acceptedMentorships: updatedAccepted,
    completedMentorships: [completedItem, ...existingCompleted],
  };

  saveMentorshipActivity(updatedActivity);

  // Update student status in students list if present
  const studentId = mentee.studentId || mentee.student?.id;
  if (studentId) {
    const students = loadStudentsList();
    const updatedStudents = students.map((s) =>
      s.id === studentId ? { ...s, isMentee: false, hasPendingRequest: false } : s
    );
    saveStudentsList(updatedStudents);
  }

  const studentName = mentee.student?.name || "Student";
  addNotification({
    id: `notif-${Date.now()}`,
    type: "mentorship_request",
    title: `Mentorship concluded with ${studentName}`,
    description: `Track successfully completed and archived. You can review notes in Completed Mentees history.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/mentees",
    actorName: studentName,
  });

  return true;
}

export function toggleMentorshipMilestone(mentorshipId: string, milestoneId: string): boolean {
  const current = loadMentorshipActivity();
  let found = false;

  const updateList = (list: Mentorship[]): Mentorship[] => {
    return list.map((m) => {
      if (m.id !== mentorshipId) return m;
      found = true;
      const currentMilestones = m.milestones || [];
      const updatedMilestones = currentMilestones.map((ms) =>
        ms.id === milestoneId ? { ...ms, completed: !ms.completed } : ms
      );
      const completedCount = updatedMilestones.filter((ms) => ms.completed).length;
      const totalCount = updatedMilestones.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      return {
        ...m,
        milestones: updatedMilestones,
        progressPercent,
      };
    });
  };

  const updatedAccepted = updateList(current.acceptedMentorships);
  const updatedCompleted = updateList(current.completedMentorships || []);

  if (!found) return false;

  saveMentorshipActivity({
    ...current,
    acceptedMentorships: updatedAccepted,
    completedMentorships: updatedCompleted,
  });
  return true;
}

export function addMentorshipMilestone(mentorshipId: string, title: string, dueDate?: string): boolean {
  if (!title.trim()) return false;
  const current = loadMentorshipActivity();
  let found = false;

  const updateList = (list: Mentorship[]): Mentorship[] => {
    return list.map((m) => {
      if (m.id !== mentorshipId) return m;
      found = true;
      const newMilestone = {
        id: `ms-${Date.now()}`,
        title: title.trim(),
        completed: false,
        dueDate: dueDate || undefined,
      };
      const updatedMilestones = [...(m.milestones || []), newMilestone];
      const completedCount = updatedMilestones.filter((ms) => ms.completed).length;
      const totalCount = updatedMilestones.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      return {
        ...m,
        milestones: updatedMilestones,
        progressPercent,
      };
    });
  };

  const updatedAccepted = updateList(current.acceptedMentorships);
  const updatedCompleted = updateList(current.completedMentorships || []);

  if (!found) return false;

  saveMentorshipActivity({
    ...current,
    acceptedMentorships: updatedAccepted,
    completedMentorships: updatedCompleted,
  });
  return true;
}

export function addMentorshipPrivateNote(mentorshipId: string, content: string): boolean {
  if (!content.trim()) return false;
  const current = loadMentorshipActivity();
  let found = false;

  const updateList = (list: Mentorship[]): Mentorship[] => {
    return list.map((m) => {
      if (m.id !== mentorshipId) return m;
      found = true;
      const newNote = {
        id: `pn-${Date.now()}`,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...m,
        privateNotes: [newNote, ...(m.privateNotes || [])],
      };
    });
  };

  const updatedAccepted = updateList(current.acceptedMentorships);
  const updatedCompleted = updateList(current.completedMentorships || []);

  if (!found) return false;

  saveMentorshipActivity({
    ...current,
    acceptedMentorships: updatedAccepted,
    completedMentorships: updatedCompleted,
  });
  return true;
}

export function addMentorshipResource(mentorshipId: string, title: string, url: string): boolean {
  if (!title.trim() || !url.trim()) return false;
  const current = loadMentorshipActivity();
  let found = false;

  const updateList = (list: Mentorship[]): Mentorship[] => {
    return list.map((m) => {
      if (m.id !== mentorshipId) return m;
      found = true;
      const newResource = {
        id: `res-${Date.now()}`,
        title: title.trim(),
        url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
        addedDate: new Date().toISOString().split("T")[0],
      };
      return {
        ...m,
        resources: [newResource, ...(m.resources || [])],
      };
    });
  };

  const updatedAccepted = updateList(current.acceptedMentorships);
  const updatedCompleted = updateList(current.completedMentorships || []);

  if (!found) return false;

  saveMentorshipActivity({
    ...current,
    acceptedMentorships: updatedAccepted,
    completedMentorships: updatedCompleted,
  });
  return true;
}

export function scheduleMentorshipSession(data: {
  studentId: string;
  studentName: string;
  studentDepartment?: string;
  studentAcademicYear?: string;
  topic: string;
  date: string;
  time: string;
  meetUrl?: string;
  agenda?: string;
}): { success: boolean; session?: MentorshipSession } {
  if (!data.topic.trim() || !data.date || !data.time) {
    return { success: false };
  }

  const newSession: MentorshipSession = {
    id: `sess-${Date.now()}`,
    studentId: data.studentId,
    studentName: data.studentName,
    studentDepartment: data.studentDepartment || "Computer Science",
    studentAcademicYear: data.studentAcademicYear || "Undergraduate",
    topic: data.topic.trim(),
    date: data.date,
    time: data.time,
    status: "scheduled",
    meetUrl: data.meetUrl?.trim() || undefined,
    agenda: data.agenda?.trim() || undefined,
  };

  const currentSessions = loadUpcomingSessions();
  saveUpcomingSessions([newSession, ...currentSessions]);

  // Update mentorship nextSession in acceptedMentorships
  const currentActivity = loadMentorshipActivity();
  const updatedAccepted = currentActivity.acceptedMentorships.map((m) => {
    if (m.studentId === data.studentId || m.student?.id === data.studentId) {
      return {
        ...m,
        nextSession: `${data.date}T${data.time}:00Z`,
      };
    }
    return m;
  });

  saveMentorshipActivity({
    ...currentActivity,
    acceptedMentorships: updatedAccepted,
  });

  addNotification({
    id: `notif-${Date.now()}`,
    type: "session_reminder",
    title: `Mentorship session scheduled with ${data.studentName}`,
    description: `${data.topic} · ${data.date} at ${data.time}`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/mentees",
    actorName: data.studentName,
  });

  return { success: true, session: newSession };
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

// ─── Auth Session Storage & Role Management ───────────────────────────────────

export const defaultStudentSession: AuthSession = {
  isAuthenticated: true,
  role: "student",
  email: "ashlin.student@university.edu",
  name: "Ashlin",
  avatar: undefined,
  headline: "Second-year CS Student · Aspiring Full-Stack Software Engineer",
  department: "Computer Science",
};

export const defaultAlumniSession: AuthSession = {
  isAuthenticated: true,
  role: "alumni",
  email: "marcus.vance@datadog.com",
  name: "Marcus Vance",
  avatar: undefined,
  headline: "Senior Backend Engineer at Datadog · Ex-Google",
  company: "Datadog",
  alumniId: "rec-001",
  department: "Computer Science",
};

let cachedAuthSessionRaw: string | null = null;
let cachedAuthSessionObj: AuthSession = defaultStudentSession;

export function loadAuthSession(): AuthSession {
  if (typeof window === "undefined") return defaultStudentSession;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return defaultStudentSession;
    if (raw === cachedAuthSessionRaw) return cachedAuthSessionObj;
    cachedAuthSessionRaw = raw;
    cachedAuthSessionObj = JSON.parse(raw);
    return cachedAuthSessionObj;
  } catch {
    return defaultStudentSession;
  }
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(session);
    localStorage.setItem(AUTH_SESSION_KEY, serialized);
    cachedAuthSessionRaw = serialized;
    cachedAuthSessionObj = session;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist auth session", err);
  }
}

export function setSessionRole(role: UserRole): AuthSession {
  const updated: AuthSession =
    role === "alumni"
      ? { ...defaultAlumniSession, isAuthenticated: true }
      : { ...defaultStudentSession, isAuthenticated: true };
  saveAuthSession(updated);
  return updated;
}

export function logoutAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
    cachedAuthSessionRaw = null;
    cachedAuthSessionObj = { ...defaultStudentSession, isAuthenticated: false };
    notifyDashboardChange();
  } catch {
    // ignore
  }
}

// ─── Alumni Profile Storage (Logged In Alumnus) ──────────────────────────────

let cachedAlumniProfileRaw: string | null = null;
let cachedAlumniProfileObj: Alumni = defaultAlumniUser;

export function loadAlumniProfile(): Alumni {
  if (typeof window === "undefined") return defaultAlumniUser;
  try {
    const raw = localStorage.getItem(ALUMNI_PROFILE_KEY);
    if (!raw) return defaultAlumniUser;
    if (raw === cachedAlumniProfileRaw) return cachedAlumniProfileObj;
    cachedAlumniProfileRaw = raw;
    cachedAlumniProfileObj = { ...defaultAlumniUser, ...JSON.parse(raw) };
    return cachedAlumniProfileObj;
  } catch {
    return defaultAlumniUser;
  }
}

export function saveAlumniProfile(profile: Alumni): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(profile);
    localStorage.setItem(ALUMNI_PROFILE_KEY, serialized);
    cachedAlumniProfileRaw = serialized;
    cachedAlumniProfileObj = profile;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist alumni profile", err);
  }
}

// ─── Opportunities & Referrals Storage ────────────────────────────────────────

let cachedOpportunitiesRaw: string | null = null;
let cachedOpportunitiesObj: Opportunity[] = initialOpportunities;

export function loadOpportunities(): Opportunity[] {
  if (typeof window === "undefined") return initialOpportunities;
  try {
    const raw = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
    if (!raw) return initialOpportunities;
    if (raw === cachedOpportunitiesRaw) return cachedOpportunitiesObj;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedOpportunitiesRaw = raw;
      cachedOpportunitiesObj = parsed;
      return cachedOpportunitiesObj;
    }
    return initialOpportunities;
  } catch {
    return initialOpportunities;
  }
}

export function saveOpportunities(opportunities: Opportunity[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(opportunities);
    localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, serialized);
    cachedOpportunitiesRaw = serialized;
    cachedOpportunitiesObj = opportunities;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist opportunities", err);
  }
}

export function addOpportunity(newOpp: Opportunity): void {
  const current = loadOpportunities();
  saveOpportunities([newOpp, ...current]);
  addNotification({
    id: `notif-${Date.now()}`,
    type: "match_suggestion",
    title: `New opportunity posted: ${newOpp.title}`,
    description: `${newOpp.company} — ${newOpp.location}. Active for student applications.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/opportunities",
    actorName: newOpp.postedByAlumniName,
  });
}

export function getOpportunityById(oppId: string): Opportunity | undefined {
  const current = loadOpportunities();
  return current.find((o) => o.id === oppId);
}

export function updateOpportunity(oppId: string, updates: Partial<Opportunity>): boolean {
  const current = loadOpportunities();
  const index = current.findIndex((o) => o.id === oppId);
  if (index === -1) return false;

  const updatedOpp = {
    ...current[index],
    ...updates,
  };

  const updatedList = [...current];
  updatedList[index] = updatedOpp;
  saveOpportunities(updatedList);
  return true;
}

export function deleteOpportunity(oppId: string): boolean {
  const current = loadOpportunities();
  const updated = current.filter((o) => o.id !== oppId);
  if (updated.length === current.length) return false;

  saveOpportunities(updated);
  return true;
}

export function toggleOpportunityStatus(oppId: string): boolean {
  const current = loadOpportunities();
  const index = current.findIndex((o) => o.id === oppId);
  if (index === -1) return false;

  const currentStatus = current[index].status || "active";
  const newStatus = currentStatus === "active" ? "closed" : "active";

  const updatedOpp: Opportunity = {
    ...current[index],
    status: newStatus,
  };

  const updatedList = [...current];
  updatedList[index] = updatedOpp;
  saveOpportunities(updatedList);
  return true;
}

// ─── Community Posts Storage ──────────────────────────────────────────────────

let cachedCommunityRaw: string | null = null;
let cachedCommunityObj: CommunityPost[] = initialCommunityPosts;

export function loadCommunityPosts(): CommunityPost[] {
  if (typeof window === "undefined") return initialCommunityPosts;
  try {
    const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
    if (!raw) return initialCommunityPosts;
    if (raw === cachedCommunityRaw) return cachedCommunityObj;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedCommunityRaw = raw;
      cachedCommunityObj = parsed;
      return cachedCommunityObj;
    }
    return initialCommunityPosts;
  } catch {
    return initialCommunityPosts;
  }
}

export function saveCommunityPosts(posts: CommunityPost[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(posts);
    localStorage.setItem(COMMUNITY_POSTS_KEY, serialized);
    cachedCommunityRaw = serialized;
    cachedCommunityObj = posts;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist community posts", err);
  }
}

export function addCommunityPost(post: CommunityPost): void {
  const current = loadCommunityPosts();
  saveCommunityPosts([post, ...current]);
}

export function deleteCommunityPost(postId: string): boolean {
  const current = loadCommunityPosts();
  const updated = current.filter((p) => p.id !== postId);
  if (updated.length === current.length) return false;

  saveCommunityPosts(updated);
  return true;
}

export function addCommunityComment(postId: string, comment: CommunityComment): void {
  const current = loadCommunityPosts();
  const updated = current.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        comments: [...p.comments, comment],
      };
    }
    return p;
  });
  saveCommunityPosts(updated);
}

export function likeCommunityPost(postId: string): void {
  const current = loadCommunityPosts();
  const updated = current.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        likes: p.likes + 1,
      };
    }
    return p;
  });
  saveCommunityPosts(updated);
}

export function toggleLikeCommunityPost(postId: string): boolean {
  const current = loadCommunityPosts();
  const updated = current.map((p) => {
    if (p.id === postId) {
      const currentlyLiked = Boolean(p.likedByMe);
      return {
        ...p,
        likedByMe: !currentlyLiked,
        likes: currentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      };
    }
    return p;
  });
  saveCommunityPosts(updated);
  return true;
}


// ─── Students List (Alumni Discovery View) ────────────────────────────────────

let cachedStudentsRaw: string | null = null;
let cachedStudentsObj: DiscoverStudent[] = studentsData;

export function loadStudentsList(): DiscoverStudent[] {
  if (typeof window === "undefined") return studentsData;
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return studentsData;
    if (raw === cachedStudentsRaw) return cachedStudentsObj;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedStudentsRaw = raw;
      cachedStudentsObj = parsed;
      return cachedStudentsObj;
    }
    return studentsData;
  } catch {
    return studentsData;
  }
}

export function saveStudentsList(students: DiscoverStudent[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(students);
    localStorage.setItem(STUDENTS_STORAGE_KEY, serialized);
    cachedStudentsRaw = serialized;
    cachedStudentsObj = students;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist students list", err);
  }
}

export function offerMentorshipToStudent(
  studentId: string,
  focus?: string,
  message?: string,
  expertise?: string
): { success: boolean; requestId?: string; reason?: string } {
  const students = loadStudentsList();
  const student = students.find((s) => s.id === studentId);
  if (!student) return { success: false, reason: "Student profile not found." };

  const mentorshipActivity = loadMentorshipActivity();

  // Prevent duplicate pending invitations
  const alreadyPending =
    student.hasPendingRequest ||
    mentorshipActivity.pendingRequests.some(
      (r) => (r.studentId === studentId || r.student?.id === studentId) && r.status === "pending"
    );

  if (alreadyPending) {
    return {
      success: false,
      reason: "A mentorship invitation is already pending for this student.",
    };
  }

  const alumni = loadAlumniProfile();
  const newRequestId = `req-alumni-${Date.now()}`;
  const customMessage =
    message?.trim() ||
    `Hi ${student.name}! I reviewed your profile and projects at ${student.university} and would be glad to mentor you on ${focus || student.careerGoal}.`;

  const newRequest: Mentorship = {
    id: newRequestId,
    studentId: student.id,
    alumniId: alumni.id,
    alumni: {
      id: alumni.id,
      name: alumni.name,
      avatar: alumni.avatar,
      role: alumni.role,
      company: alumni.company,
    },
    student: {
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      careerGoal: student.careerGoal,
      department: student.department,
      academicYear: student.academicYear,
      interests: student.interests?.map((i) => i.name) || [],
      skills: student.skills?.map((s) => s.name) || [],
    },
    status: "pending",
    sessionCount: 0,
    focus: focus || `Mentorship on ${student.careerGoal}`,
    notes: expertise ? `Mentor relevant expertise: ${expertise}` : undefined,
    requestDate: new Date().toISOString().split("T")[0],
    startDate: new Date().toISOString().split("T")[0],
    requestMessage: customMessage,
    direction: "outgoing",
  };

  saveMentorshipActivity({
    ...mentorshipActivity,
    pendingRequests: [newRequest, ...mentorshipActivity.pendingRequests],
  });

  const updatedStudents = students.map((s) =>
    s.id === studentId ? { ...s, hasPendingRequest: true } : s
  );
  saveStudentsList(updatedStudents);

  addNotification({
    id: `notif-${Date.now()}`,
    type: "mentorship_request",
    title: `Mentorship invitation sent to ${student.name}`,
    description: `Focus: ${focus || student.careerGoal}. Waiting for student response.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/requests",
    actorName: student.name,
  });

  return { success: true, requestId: newRequestId };
}

export function getStudentById(studentId: string): DiscoverStudent | undefined {
  const students = loadStudentsList();
  return students.find((s) => s.id === studentId);
}


// ─── Upcoming Sessions Storage ────────────────────────────────────────────────

let cachedSessionsRaw: string | null = null;
let cachedSessionsObj: MentorshipSession[] = initialUpcomingSessions;

export function loadUpcomingSessions(): MentorshipSession[] {
  if (typeof window === "undefined") return initialUpcomingSessions;
  try {
    const raw = localStorage.getItem(UPCOMING_SESSIONS_STORAGE_KEY);
    if (!raw) return initialUpcomingSessions;
    if (raw === cachedSessionsRaw) return cachedSessionsObj;
    cachedSessionsRaw = raw;
    cachedSessionsObj = JSON.parse(raw);
    return cachedSessionsObj;
  } catch {
    return initialUpcomingSessions;
  }
}

export function saveUpcomingSessions(sessions: MentorshipSession[]): void {
  if (typeof window === "undefined") return;
  try {
    cachedSessionsRaw = JSON.stringify(sessions);
    cachedSessionsObj = sessions;
    localStorage.setItem(UPCOMING_SESSIONS_STORAGE_KEY, cachedSessionsRaw);
    notifyDashboardChange();
  } catch {
    // ignore
  }
}

// ─── University Events Storage ────────────────────────────────────────────────

let cachedEventsRaw: string | null = null;
let cachedEventsObj: UniversityEvent[] = universityEventsData;

export function loadUniversityEvents(): UniversityEvent[] {
  if (typeof window === "undefined") return universityEventsData;
  try {
    const raw = localStorage.getItem(UNIVERSITY_EVENTS_STORAGE_KEY);
    if (!raw) return universityEventsData;
    if (raw === cachedEventsRaw) return cachedEventsObj;
    cachedEventsRaw = raw;
    cachedEventsObj = JSON.parse(raw);
    return cachedEventsObj;
  } catch {
    return universityEventsData;
  }
}

export function toggleEventRsvp(eventId: string): void {
  if (typeof window === "undefined") return;
  try {
    const events = loadUniversityEvents();
    const updated = events.map((ev) => {
      if (ev.id !== eventId) return ev;
      const willRegister = !ev.isRegistered;
      return {
        ...ev,
        isRegistered: willRegister,
        rsvpCount: willRegister ? ev.rsvpCount + 1 : Math.max(0, ev.rsvpCount - 1),
      };
    });
    cachedEventsRaw = JSON.stringify(updated);
    cachedEventsObj = updated;
    localStorage.setItem(UNIVERSITY_EVENTS_STORAGE_KEY, cachedEventsRaw);
    notifyDashboardChange();
  } catch {
    // ignore
  }
}
