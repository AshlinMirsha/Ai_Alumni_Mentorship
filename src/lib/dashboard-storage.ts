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
  alumniData,
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
const ALUMNI_DIRECTORY_KEY = "alumnipath_demo_alumni_directory_v1";
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

let broadcastSyncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastSyncChannel = new BroadcastChannel("alumnipath_live_storage_channel");
    broadcastSyncChannel.onmessage = () => {
      invalidateAllCaches();
      listeners.forEach((listener) => {
        try {
          listener();
        } catch {
          // ignore
        }
      });
      window.dispatchEvent(new CustomEvent("alumnipath-storage-change"));
    };
  } catch {
    // ignore
  }
}

let isStorageListenerAttached = false;
function onWindowStorage(event: StorageEvent) {
  if (
    event.key &&
    (event.key.startsWith("alumnipath_") ||
      event.key === STUDENT_STORAGE_KEY ||
      event.key === AUTH_SESSION_KEY)
  ) {
    invalidateAllCaches();
    listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // ignore
      }
    });
  }
}

export function subscribeToDashboardStorage(listener: () => void): () => void {
  listeners.add(listener);
  const handleStorageEvent = () => {
    invalidateAllCaches();
    listener();
  };
  if (typeof window !== "undefined") {
    if (!isStorageListenerAttached) {
      window.addEventListener("storage", onWindowStorage);
      isStorageListenerAttached = true;
    }
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("alumnipath-storage-change", handleStorageEvent);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("alumnipath-storage-change", handleStorageEvent);
    }
  };
}


export function notifyDashboardChange(): void {
  invalidateAllCaches();
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("alumnipath-storage-change"));
    if (broadcastSyncChannel) {
      try {
        broadcastSyncChannel.postMessage({ timestamp: Date.now() });
      } catch {
        // ignore
      }
    }
  }
}

// ─── Student Profile Storage ──────────────────────────────────────────────────

export function createFreshStudentProfile(params: {
  name?: string;
  email?: string;
  university?: string;
  department?: string;
  academicYear?: string;
}): Student {
  const name = params.name?.trim() || "Student";
  const department = params.department?.trim() || "Undeclared Major";
  const university = params.university?.trim() || "Collegiate Institution";
  const academicYear = params.academicYear?.trim() || "Freshman (1st Year)";

  return {
    id: `student-${Date.now()}`,
    userId: `user-${Date.now()}`,
    name,
    avatar: undefined,
    headline: `${academicYear} · ${department} at ${university}`,
    university,
    department,
    graduationYear: new Date().getFullYear() + 4,
    academicYear,
    careerGoal: "",
    careerGoals: [],
    skills: [],
    interests: [],
    projects: [],
    bio: "",
    resumeUrl: undefined,
    profileCompletionPercent: 20,
  };
}

function getStudentStorageKey(): string {
  if (typeof window === "undefined") return STUDENT_STORAGE_KEY;
  try {
    const rawAuth = localStorage.getItem(AUTH_SESSION_KEY);
    if (rawAuth) {
      const auth = JSON.parse(rawAuth);
      if (auth && auth.email && auth.role !== "alumni") {
        return `alumnipath_student_profile_${auth.email.trim().toLowerCase()}`;
      }
    }
  } catch {
    // fallback
  }
  return STUDENT_STORAGE_KEY;
}


let cachedBaseAuthRaw: string | null = null;
let cachedBaseStudent: Student = currentStudent;

export function getBaseStudentForSession(): Student {
  if (typeof window === "undefined") return currentStudent;
  try {
    const rawAuth = localStorage.getItem(AUTH_SESSION_KEY);
    if (!rawAuth) {
      cachedBaseAuthRaw = null;
      cachedBaseStudent = currentStudent;
      return currentStudent;
    }
    if (rawAuth === cachedBaseAuthRaw && cachedBaseStudent) {
      return cachedBaseStudent;
    }
    const auth = JSON.parse(rawAuth);
    if (auth && auth.email && auth.role !== "alumni") {
      const emailLower = auth.email.trim().toLowerCase();
      const base: Student = {
        id: `usr-${emailLower}`,
        userId: `usr-${emailLower}`,
        name: auth.name || "",
        email: emailLower,
        avatar: auth.avatar,
        avatarUrl: auth.avatar,
        headline: auth.headline || (auth.department ? `${auth.department} Student` : "Enrolled Student"),
        university: "Karunya University",
        department: auth.department || "",
        graduationYear: 2027,
        academicYear: "",
        careerGoal: "",
        projects: [],
        skills: [],
        interests: [],
        careerGoals: [],
        bio: "",
        profileCompletionPercent: 0,
        currentActivities: [],
        githubUrl: "",
        linkedinUrl: "",
        portfolioUrl: "",
        leetcodeUrl: "",
        otherLinks: [],
        detailedProjects: [],
        targetCompanies: [],
        achievements: [],
      };
      cachedBaseAuthRaw = rawAuth;
      cachedBaseStudent = base;
      return base;
    }
  } catch {
    // fallback
  }
  return currentStudent;
}

let cachedStudentKey: string | null = null;
let cachedStudentRaw: string | null = null;
let cachedStudentObj: Student = currentStudent;

let cachedSessionsRaw: string | null = null;
let cachedSessionsObj: MentorshipSession[] = initialUpcomingSessions;

let cachedEventsRaw: string | null = null;
let cachedEventsObj: UniversityEvent[] = universityEventsData;

export function loadStudentProfile(): Student {
  const base = getBaseStudentForSession();
  if (typeof window === "undefined") return base;
  try {
    const key = getStudentStorageKey();
    const raw = localStorage.getItem(key);

    if (key === cachedStudentKey && raw === cachedStudentRaw && cachedStudentObj) {
      return cachedStudentObj;
    }

    cachedStudentKey = key;
    if (!raw) {
      cachedStudentObj = base;
      return base;
    }

    const parsed = JSON.parse(raw);
    const result: Student = { ...base, ...parsed };
    cachedStudentObj = result;
    return result;
  } catch {
    return base;
  }
}

export function saveStudentProfile(student: Student): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStudentStorageKey();
    const base = getBaseStudentForSession();
    const safeData: Partial<Student> = {
      id: student.id || base.id,
      userId: student.userId || base.userId,
      name: student.name,
      email: student.email || base.email,
      department: student.department,
      degree: student.degree,
      academicYear: student.academicYear,
      graduationYear: student.graduationYear,
      careerGoal: student.careerGoal,
      careerGoals: student.careerGoals,
      preferredLocation: student.preferredLocation,
      internshipInterest: student.internshipInterest,
      skills: student.skills,
      interests: student.interests,
      projects: student.projects,
      bio: student.bio,
      headline: student.headline,
      university: student.university,
      avatar: student.avatar,
      avatarUrl: student.avatarUrl || student.avatar,
      currentActivities: student.currentActivities,
      githubUrl: student.githubUrl,
      linkedinUrl: student.linkedinUrl,
      portfolioUrl: student.portfolioUrl,
      leetcodeUrl: student.leetcodeUrl,
      otherLinks: student.otherLinks,
      detailedProjects: student.detailedProjects,
      targetCompanies: student.targetCompanies,
      achievements: student.achievements,
      education: student.education,
    };
    const serialized = JSON.stringify(safeData);
    if (key === cachedStudentKey && serialized === cachedStudentRaw) {
      return;
    }
    localStorage.setItem(key, serialized);
    cachedStudentKey = key;
    cachedStudentRaw = serialized;
    cachedStudentObj = { ...base, ...safeData };

    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist student profile to localStorage", err);
  }
}

export function resetStudentProfile(): Student {
  const base = getBaseStudentForSession();
  if (typeof window !== "undefined") {
    try {
      const key = getStudentStorageKey();
      localStorage.removeItem(key);
      cachedStudentKey = key;
      cachedStudentRaw = null;
      cachedStudentObj = base;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return base;
}

export function invalidateAllCaches(): void {
  cachedStudentRaw = null;
  cachedStudentObj = currentStudent;
  cachedRoadmapRaw = null;
  cachedRoadmapObj = initialRoadmapStages;
  cachedMentorshipRaw = null;
  cachedMentorshipObj = initialMentorshipActivity;
  cachedNotificationsRaw = null;
  cachedNotificationsObj = notificationsData;
  cachedAuthSessionRaw = null;
  cachedAuthSessionObj = defaultStudentSession;
  cachedSettingsRaw = null;
  cachedSettingsObj = initialUserSettings;
  cachedAlumniProfileRaw = null;
  cachedAlumniProfileObj = defaultAlumniUser;
  cachedOpportunitiesRaw = null;
  cachedOpportunitiesObj = initialOpportunities;
  cachedCommunityRaw = null;
  cachedCommunityObj = initialCommunityPosts;
  cachedStudentsRaw = null;
  cachedStudentsObj = studentsData;
  cachedSessionsRaw = null;
  cachedSessionsObj = initialUpcomingSessions;
  cachedEventsRaw = null;
  cachedEventsObj = universityEventsData;
  cachedAlumniDirectoryRaw = null;
  cachedAlumniDirectoryObj = alumniData;
}

export function clearUserSessionData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    localStorage.removeItem(ALUMNI_PROFILE_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(ROADMAP_STORAGE_KEY);
    localStorage.removeItem(MENTORSHIP_STORAGE_KEY);
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    invalidateAllCaches();
    notifyDashboardChange();
  } catch (e) {
    console.warn("Error clearing session data", e);
  }
}

// ─── Career Roadmap Stages Storage ───────────────────────────────────────────

let cachedRoadmapRaw: string | null = null;
let cachedRoadmapObj: RoadmapStage[] = initialRoadmapStages;

export function loadRoadmapStages(): RoadmapStage[] {
  if (typeof window === "undefined") return initialRoadmapStages;
  try {
    const raw = localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (!raw) {
      const studentRaw = localStorage.getItem(STUDENT_STORAGE_KEY);
      if (studentRaw) {
        try {
          const student = JSON.parse(studentRaw);
          // If the student has a custom role or no role chosen, default to empty stages []
          const curatedRoles = [
            "Full-Stack Software Engineer",
            "Backend Developer",
            "AI Engineer",
            "Frontend Platform Engineer",
            "Cloud Solutions Architect",
            "Software Engineer Intern",
          ];
          if (!student.careerGoal || !curatedRoles.includes(student.careerGoal)) {
            return [];
          }
        } catch {
          // ignore
        }
      }
      return initialRoadmapStages;
    }
    if (raw === cachedRoadmapRaw) return cachedRoadmapObj;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedRoadmapRaw = raw;
      cachedRoadmapObj = parsed;
      return cachedRoadmapObj;
    }
    return [];
  } catch {
    return [];
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
      cachedRoadmapObj = [];
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return [];
}

export function createFreshRoadmapStages(): RoadmapStage[] {
  return [];
}

export function createFreshMentorshipActivity(): MentorshipActivityData {
  return {
    pendingRequests: [],
    acceptedMentorships: [],
    declinedRequests: [],
    completedMentorships: [],
    recentConversations: [],
  };
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
      pendingRequests: parsed.pendingRequests ?? [],
      acceptedMentorships: parsed.acceptedMentorships ?? [],
      declinedRequests: parsed.declinedRequests ?? [],
      completedMentorships: parsed.completedMentorships ?? [],
      recentConversations: parsed.recentConversations ?? [],
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
}): { success: boolean; session?: MentorshipSession; error?: string } {
  if (!data.topic.trim() || !data.date || !data.time) {
    return { success: false, error: "Please provide a session topic, date, and time." };
  }

  const conflictCheck = checkSessionConflict(data.date, data.time);
  if (conflictCheck.hasConflict && conflictCheck.conflictingSession) {
    return {
      success: false,
      error: `Scheduling conflict: You already have a session scheduled with ${conflictCheck.conflictingSession.studentName} on ${data.date} at ${data.time}.`,
    };
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
    status: data.meetUrl?.trim() ? "confirmed" : "scheduled",
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
        nextSession: `${data.date} at ${data.time}`,
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

export function checkSessionConflict(
  date: string,
  time: string,
  excludeSessionId?: string
): { hasConflict: boolean; conflictingSession?: MentorshipSession } {
  const sessions = loadUpcomingSessions();
  const conflict = sessions.find(
    (s) =>
      s.id !== excludeSessionId &&
      s.status !== "cancelled" &&
      s.status !== "completed" &&
      s.date.trim().toLowerCase() === date.trim().toLowerCase() &&
      s.time.trim().toLowerCase() === time.trim().toLowerCase()
  );
  return {
    hasConflict: !!conflict,
    conflictingSession: conflict,
  };
}

export function rescheduleMentorshipSession(
  sessionId: string,
  data: {
    date: string;
    time: string;
    topic?: string;
    meetUrl?: string;
    agenda?: string;
    reason?: string;
  }
): { success: boolean; session?: MentorshipSession; error?: string } {
  const sessions = loadUpcomingSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return { success: false, error: "Session not found." };
  }

  const conflictCheck = checkSessionConflict(data.date, data.time, sessionId);
  if (conflictCheck.hasConflict && conflictCheck.conflictingSession) {
    return {
      success: false,
      error: `Scheduling conflict: You already have a session scheduled with ${conflictCheck.conflictingSession.studentName} on ${data.date} at ${data.time}.`,
    };
  }

  const oldSession = sessions[index];
  const updatedSession: MentorshipSession = {
    ...oldSession,
    previousDate: oldSession.date,
    previousTime: oldSession.time,
    date: data.date,
    time: data.time,
    topic: data.topic?.trim() || oldSession.topic,
    meetUrl: data.meetUrl !== undefined ? (data.meetUrl.trim() || undefined) : oldSession.meetUrl,
    agenda: data.agenda !== undefined ? (data.agenda.trim() || undefined) : oldSession.agenda,
    status: "rescheduled",
  };

  const updatedSessions = [...sessions];
  updatedSessions[index] = updatedSession;
  saveUpcomingSessions(updatedSessions);

  // Update mentorship nextSession in acceptedMentorships
  const currentActivity = loadMentorshipActivity();
  const updatedAccepted = currentActivity.acceptedMentorships.map((m) => {
    if (m.studentId === oldSession.studentId || m.student?.id === oldSession.studentId) {
      return {
        ...m,
        nextSession: `${data.date} at ${data.time}`,
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
    type: "session_rescheduled",
    title: `Session rescheduled with ${oldSession.studentName}`,
    description: `Moved to ${data.date} at ${data.time} (was ${oldSession.date} at ${oldSession.time})`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/mentees",
    actorName: oldSession.studentName,
  });

  return { success: true, session: updatedSession };
}

export function cancelMentorshipSession(
  sessionId: string,
  reason?: string
): { success: boolean; session?: MentorshipSession; error?: string } {
  const sessions = loadUpcomingSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return { success: false, error: "Session not found." };
  }

  const oldSession = sessions[index];
  const updatedSession: MentorshipSession = {
    ...oldSession,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason?.trim() || "Cancelled by mentor",
  };

  const updatedSessions = [...sessions];
  updatedSessions[index] = updatedSession;
  saveUpcomingSessions(updatedSessions);

  // Clear nextSession in acceptedMentorships
  const currentActivity = loadMentorshipActivity();
  const updatedAccepted = currentActivity.acceptedMentorships.map((m) => {
    if (m.studentId === oldSession.studentId || m.student?.id === oldSession.studentId) {
      return {
        ...m,
        nextSession: undefined,
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
    type: "session_cancelled",
    title: `Session cancelled with ${oldSession.studentName}`,
    description: `Session "${oldSession.topic}" on ${oldSession.date} was cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/mentees",
    actorName: oldSession.studentName,
  });

  return { success: true, session: updatedSession };
}

export function completeMentorshipSession(
  sessionId: string,
  notes?: string
): { success: boolean; session?: MentorshipSession; error?: string } {
  const sessions = loadUpcomingSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return { success: false, error: "Session not found." };
  }

  const oldSession = sessions[index];
  const updatedSession: MentorshipSession = {
    ...oldSession,
    status: "completed",
    completedAt: new Date().toISOString(),
    notes: notes?.trim() || oldSession.notes,
  };

  const updatedSessions = [...sessions];
  updatedSessions[index] = updatedSession;
  saveUpcomingSessions(updatedSessions);

  // Increment session count in acceptedMentorships
  const currentActivity = loadMentorshipActivity();
  const updatedAccepted = currentActivity.acceptedMentorships.map((m) => {
    if (m.studentId === oldSession.studentId || m.student?.id === oldSession.studentId) {
      return {
        ...m,
        sessionCount: (m.sessionCount || 0) + 1,
        nextSession: undefined,
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
    title: `Session completed with ${oldSession.studentName}`,
    description: `Completed "${oldSession.topic}". Mentorship history updated.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: "/alumni-dashboard/mentees",
    actorName: oldSession.studentName,
  });

  return { success: true, session: updatedSession };
}

export function getSessionById(sessionId: string): MentorshipSession | undefined {
  return loadUpcomingSessions().find((s) => s.id === sessionId);
}



// ─── Messaging Actions ────────────────────────────────────────────────────────

export function loadConversations(): Conversation[] {
  return loadMentorshipActivity().recentConversations;
}

export function resolveConversationForViewer(
  conv: Conversation,
  isAlumni: boolean,
  currentUserId: string
): Conversation {
  if (isAlumni) {
    // If viewing as alumni:
    // The other party is the student
    const studentMessage = conv.messages.find(
      (m) => m.senderId !== currentUserId && m.senderId !== "system"
    );
    const studentName =
      conv.studentName ||
      studentMessage?.senderName ||
      (conv.participantId && conv.participantId.startsWith("s-")
        ? conv.participantName
        : "Student Mentee");
    const studentId =
      conv.studentId ||
      (conv.participantId && conv.participantId.startsWith("s-")
        ? conv.participantId
        : studentMessage?.senderId || "student-active");
    const studentRole =
      conv.studentRole ||
      (conv.participantId && conv.participantId.startsWith("s-")
        ? conv.participantRole
        : "Student Mentee");
    const studentCompany =
      conv.studentCompany ||
      (conv.participantId && conv.participantId.startsWith("s-")
        ? conv.participantCompany
        : "Collegiate Mentee");

    return {
      ...conv,
      participantId: studentId,
      participantName: studentName,
      participantRole: studentRole,
      participantCompany: studentCompany,
      participantAvatar: conv.studentAvatar || studentMessage?.senderAvatar,
    };
  }

  // If viewing as student:
  // The other party is the alumni
  const alumniMessage = conv.messages.find(
    (m) =>
      m.senderId !== currentUserId &&
      m.senderId !== "system" &&
      !m.senderId.startsWith("s-")
  );
  const alumniName =
    conv.alumniName ||
    (conv.participantId && !conv.participantId.startsWith("s-")
      ? conv.participantName
      : alumniMessage?.senderName || "Alumni Mentor");
  const alumniId =
    conv.alumniId ||
    (conv.participantId && !conv.participantId.startsWith("s-")
      ? conv.participantId
      : alumniMessage?.senderId || "rec-001");
  const alumniRole =
    conv.alumniRole ||
    (conv.participantId && !conv.participantId.startsWith("s-")
      ? conv.participantRole
      : "Verified Mentor");
  const alumniCompany =
    conv.alumniCompany ||
    (conv.participantId && !conv.participantId.startsWith("s-")
      ? conv.participantCompany
      : "Industry Leader");

  return {
    ...conv,
    participantId: alumniId,
    participantName: alumniName,
    participantRole: alumniRole,
    participantCompany: alumniCompany,
    participantAvatar: conv.alumniAvatar,
  };
}

export function sendConversationMessage(conversationId: string, content: string): Message | null {
  if (!content.trim()) return null;
  const current = loadMentorshipActivity();
  const convIndex = current.recentConversations.findIndex((c) => c.id === conversationId);
  if (convIndex === -1) return null;

  const auth = loadAuthSession();
  const isAlumni = auth.role === "alumni";
  const alumni = loadAlumniProfile();
  const student = loadStudentProfile();

  const senderId = isAlumni ? alumni.id : student.id;
  const senderName = isAlumni ? (auth.name || alumni.name) : (auth.name || student.name);
  const targetConv = current.recentConversations[convIndex];
  const nowIso = new Date().toISOString();

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    senderName,
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

  if (isAlumni) {
    if (!updatedConv.alumniId) {
      updatedConv.alumniId = alumni.id;
      updatedConv.alumniName = alumni.name;
      updatedConv.alumniRole = alumni.role;
      updatedConv.alumniCompany = alumni.company;
    }
  } else {
    if (!updatedConv.studentId) {
      updatedConv.studentId = student.id;
      updatedConv.studentName = student.name;
      updatedConv.studentRole = student.department || "Student";
      updatedConv.studentCompany = student.academicYear || "Collegiate Mentee";
    }
  }

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
  const student = loadStudentProfile();
  const existing = current.recentConversations.find(
    (c) => c.alumniId === alumni.id || c.participantId === alumni.id
  );
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
    alumniId: alumni.id,
    alumniName: alumni.name,
    alumniAvatar: alumni.avatar,
    alumniRole: alumni.role,
    alumniCompany: alumni.company,
    studentId: student.id,
    studentName: student.name,
    studentRole: student.department || "Student",
    studentCompany: student.academicYear || "Collegiate Mentee",
    lastMessage: "Conversation initiated.",
    lastMessageAt: nowIso,
    unreadCount: 0,
    messages: [
      {
        id: `msg-init-${Date.now()}`,
        conversationId: newId,
        senderId: "system",
        senderName: "AlumniPath System",
        content: `Direct messaging channel opened between ${student.name} and ${alumni.name} (${alumni.role} at ${alumni.company}).`,
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

    // Synchronize appearance theme
    if (settings.appearance?.theme) {
      applyTheme(settings.appearance.theme);
    }

    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist user settings", err);
  }
}

export function resetUserSettings(): UserSettings {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(THEME_STORAGE_KEY);
      cachedSettingsRaw = null;
      cachedSettingsObj = initialUserSettings;
      applyTheme("light");
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return initialUserSettings;
}

// ─── Theme Management ─────────────────────────────────────────────────────────

export const THEME_STORAGE_KEY = "alumnipath_theme";
export type ThemeMode = "light" | "dark" | "system";

export function loadCurrentTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const directTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (directTheme && (directTheme === "light" || directTheme === "dark" || directTheme === "system")) {
      return directTheme;
    }
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.appearance?.theme) {
        return parsed.appearance.theme;
      }
    }
  } catch {
    // fallback
  }
  return "light";
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    let isDark = false;
    if (theme === "dark") {
      isDark = true;
    } else if (theme === "system") {
      isDark = Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      isDark = false;
    }

    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    window.dispatchEvent(
      new CustomEvent("alumnipath-theme-change", {
        detail: { theme, isDark },
      })
    );
  } catch (err) {
    console.error("Failed to apply theme", err);
  }
}

if (typeof window !== "undefined") {
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const systemThemeListener = (e: MediaQueryListEvent) => {
      const current = localStorage.getItem(THEME_STORAGE_KEY);
      if (current === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", systemThemeListener);
    } else if ((mq as any).addListener) {
      (mq as any).addListener(systemThemeListener);
    }
  } catch {
    // ignore
  }
}

// ─── Auth Session Storage & Role Management ───────────────────────────────────

export const defaultStudentSession: AuthSession = {
  isAuthenticated: false,
  role: "student",
  email: "",
  name: "Student",
  avatar: undefined,
  headline: "Collegiate Student · AlumniPath Network",
  department: "Computer Science",
};

export const defaultAlumniSession: AuthSession = {
  isAuthenticated: false,
  role: "alumni",
  email: "",
  name: "Alumni Mentor",
  avatar: undefined,
  headline: "Verified Alumni Mentor",
  company: "Industry Professional",
  alumniId: "alumni-user",
  department: "Engineering",
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

export function getSessionRole(): UserRole {
  return loadAuthSession().role;
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

export function getAlumniStorageKey(): string {
  if (typeof window === "undefined") return ALUMNI_PROFILE_KEY;
  try {
    const rawAuth = localStorage.getItem(AUTH_SESSION_KEY);
    if (rawAuth) {
      const auth = JSON.parse(rawAuth);
      if (auth && auth.email && auth.role === "alumni") {
        return `alumnipath_alumni_profile_${auth.email.trim().toLowerCase()}`;
      }
    }
  } catch {
    // fallback
  }
  return ALUMNI_PROFILE_KEY;
}

let cachedBaseAlumniAuthRaw: string | null = null;
let cachedBaseAlumni: Alumni = defaultAlumniUser;

export function getBaseAlumniForSession(): Alumni {
  if (typeof window === "undefined") return defaultAlumniUser;
  try {
    const rawAuth = localStorage.getItem(AUTH_SESSION_KEY);
    if (!rawAuth) {
      cachedBaseAlumniAuthRaw = null;
      cachedBaseAlumni = defaultAlumniUser;
      return defaultAlumniUser;
    }
    if (rawAuth === cachedBaseAlumniAuthRaw && cachedBaseAlumni) {
      return cachedBaseAlumni;
    }
    const auth = JSON.parse(rawAuth);
    if (auth && auth.email && auth.role === "alumni") {
      const emailLower = auth.email.trim().toLowerCase();
      const base: Alumni = {
        id: auth.id || `usr-${emailLower}`,
        userId: auth.id || `usr-${emailLower}`,
        name: auth.name || "",
        email: emailLower,
        avatar: auth.avatar || "",
        avatarUrl: auth.avatar || "",
        headline: auth.headline || (auth.currentRole ? `${auth.currentRole} at ${auth.company || "Industry"}` : "Alumni Mentor"),
        location: auth.location || "",
        city: auth.location || "",
        company: auth.company || "",
        role: auth.currentRole || "",
        graduationYear: auth.graduationYear || new Date().getFullYear(),
        department: auth.department || "",
        degree: auth.degree || "",
        industry: auth.industry || "",
        yearsOfExperience: auth.yearsOfExperience || 0,
        isVerified: true,
        skills: [],
        interests: [],
        workExperience: [],
        education: [],
        bio: auth.bio || "",
        linkedinUrl: auth.linkedinUrl || "",
        githubUrl: auth.githubUrl || "",
        portfolioUrl: auth.portfolioUrl || "",
        specializations: [],
        currentEmployment: {
          status: auth.company ? "Employed" : "Seeking opportunities",
          company: auth.company || "",
          role: auth.currentRole || "",
          employmentType: "Full-time",
          startDate: "",
          location: auth.location || "",
          workArrangement: "Hybrid",
          responsibilities: "",
        },
        detailedSkills: [],
        detailedWorkExperience: [],
        internships: [],
        careerJourney: [],
        mentorshipDetails: {
          available: true,
          topics: [],
          skills: [],
          domains: [],
          preferredFormats: ["1-on-1 Mentorship Sessions", "Resume Reviews"],
          maxMentees: 5,
        },
        mentorshipAvailability: "available",
        mentorshipAreas: [],
        responseRate: 100,
        averageResponseTime: "within 24 hours",
        totalMentees: 0,
        maxMentees: 5,
        university: auth.institution || "Karunya University",
      };
      cachedBaseAlumniAuthRaw = rawAuth;
      cachedBaseAlumni = base;
      return base;
    }
  } catch {
    // fallback
  }
  return defaultAlumniUser;
}

let cachedAlumniKey: string | null = null;
let cachedAlumniProfileRaw: string | null = null;
let cachedAlumniProfileObj: Alumni = defaultAlumniUser;

export function loadAlumniProfile(): Alumni {
  const base = getBaseAlumniForSession();
  if (typeof window === "undefined") return base;
  try {
    const key = getAlumniStorageKey();
    const raw = localStorage.getItem(key);

    if (key === cachedAlumniKey && raw === cachedAlumniProfileRaw && cachedAlumniProfileObj) {
      return cachedAlumniProfileObj;
    }

    cachedAlumniKey = key;
    cachedAlumniProfileRaw = raw;

    if (!raw) {
      cachedAlumniProfileObj = base;
      return base;
    }

    const parsed = JSON.parse(raw);
    const result: Alumni = { ...base, ...parsed };
    cachedAlumniProfileObj = result;
    return result;
  } catch {
    return base;
  }
}

export function saveAlumniProfile(profile: Alumni): void {
  if (typeof window === "undefined") return;
  try {
    const key = getAlumniStorageKey();
    const base = getBaseAlumniForSession();
    const safeData: Alumni = {
      ...base,
      ...profile,
      id: profile.id || base.id,
      userId: profile.userId || base.userId,
      name: profile.name,
      email: profile.email || base.email,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      city: profile.city || profile.location,
      company: profile.company,
      role: profile.role,
      graduationYear: profile.graduationYear,
      department: profile.department,
      degree: profile.degree,
      avatar: profile.avatar || profile.avatarUrl,
      avatarUrl: profile.avatarUrl || profile.avatar,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      portfolioUrl: profile.portfolioUrl,
      specializations: profile.specializations || [],
      currentEmployment: profile.currentEmployment || base.currentEmployment,
      detailedSkills: profile.detailedSkills || [],
      skills: profile.skills || [],
      detailedWorkExperience: profile.detailedWorkExperience || [],
      workExperience: profile.workExperience || [],
      internships: profile.internships || [],
      careerJourney: profile.careerJourney || [],
      mentorshipDetails: profile.mentorshipDetails || base.mentorshipDetails,
      mentorshipAvailability: profile.mentorshipAvailability || "available",
      mentorshipAreas: profile.mentorshipAreas || [],
      university: profile.university || profile.institution || base.university,
      institution: profile.institution || profile.university || (base as any).institution,
      detailedEducation: profile.detailedEducation || [],
      certifications: profile.certifications || [],
      otherProfessionalLinks: profile.otherProfessionalLinks || [],
      specializationDetails: profile.specializationDetails || base.specializationDetails,
    };
    const serialized = JSON.stringify(safeData);
    if (key === cachedAlumniKey && serialized === cachedAlumniProfileRaw) {
      return;
    }
    localStorage.setItem(key, serialized);
    cachedAlumniKey = key;
    cachedAlumniProfileObj = safeData as Alumni;
    registerOrUpdateAlumniInDirectory(profile);
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist alumni profile", err);
  }
}

export function resetAlumniProfile(): Alumni {
  const base = getBaseAlumniForSession();
  if (typeof window !== "undefined") {
    try {
      const key = getAlumniStorageKey();
      localStorage.removeItem(key);
      cachedAlumniKey = key;
      cachedAlumniProfileRaw = null;
      cachedAlumniProfileObj = base;
      notifyDashboardChange();
    } catch {
      // ignore
    }
  }
  return base;
}

// ─── Dynamic Alumni Directory Storage ─────────────────────────────────────────

let cachedAlumniDirectoryRaw: string | null = null;
let cachedAlumniDirectoryObj: Alumni[] = alumniData;

export function loadAllAlumni(): Alumni[] {
  if (typeof window === "undefined") return alumniData;
  try {
    const raw = localStorage.getItem(ALUMNI_DIRECTORY_KEY);
    if (!raw) {
      // Seed default alumni into directory if none exists
      return alumniData;
    }
    if (raw === cachedAlumniDirectoryRaw) return cachedAlumniDirectoryObj;
    cachedAlumniDirectoryRaw = raw;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedAlumniDirectoryObj = parsed;
      return cachedAlumniDirectoryObj;
    }
    return alumniData;
  } catch {
    return alumniData;
  }
}

export function saveAlumniDirectory(directory: Alumni[]): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(directory);
    localStorage.setItem(ALUMNI_DIRECTORY_KEY, serialized);
    cachedAlumniDirectoryRaw = serialized;
    cachedAlumniDirectoryObj = directory;
    notifyDashboardChange();
  } catch (err) {
    console.error("Failed to persist alumni directory", err);
  }
}

export function registerOrUpdateAlumniInDirectory(alumni: Alumni): void {
  if (typeof window === "undefined") return;
  try {
    const currentList = loadAllAlumni();
    const index = currentList.findIndex(
      (a) => a.id === alumni.id || (a.name && alumni.name && a.name.toLowerCase() === alumni.name.toLowerCase())
    );

    let updatedList: Alumni[];
    if (index >= 0) {
      updatedList = [...currentList];
      updatedList[index] = { ...updatedList[index], ...alumni };
    } else {
      updatedList = [alumni, ...currentList];
    }

    saveAlumniDirectory(updatedList);
  } catch (err) {
    console.error("Failed to update alumni in directory", err);
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
