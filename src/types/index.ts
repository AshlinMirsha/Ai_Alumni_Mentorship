// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = "student" | "alumni";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  headline?: string;
  location?: string;
  createdAt: string;
}

// ─── Skills & Interests ──────────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Interest {
  id: string;
  name: string;
}

// ─── Alumni ──────────────────────────────────────────────────────────────────

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startYear: number;
  endYear?: number | null;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  techStack?: string[];
  role?: string;
}

export type MentorshipAvailability = "available" | "limited" | "unavailable";

export interface Alumni {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  headline: string;
  location: string;
  company: string;
  role: string;
  graduationYear: number;
  department: string;
  degree?: string;
  industry?: string;
  yearsOfExperience?: number;
  isVerified?: boolean;
  skills: Skill[];
  interests: Interest[];
  workExperience: WorkExperience[];
  education: Education[];
  bio: string;
  linkedinUrl?: string;
  mentorshipAvailability: MentorshipAvailability;
  mentorshipAreas: string[];
  mentorshipInterests?: string[];
  areasOfExpertise?: string[];
  projects?: Project[];
  responseRate: number; // percentage 0-100
  averageResponseTime: string; // e.g. "within 2 days"
  totalMentees: number;
  matchScore?: number; // computed match score 0-100
  matchExplanation?: string;
  lastActive?: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  headline: string;
  university: string;
  department: string;
  graduationYear: number;
  academicYear?: string;
  careerGoal?: string;
  projects?: string[];
  skills: Skill[];
  interests: Interest[];
  careerGoals: string[];
  bio: string;
  resumeUrl?: string;
  profileCompletionPercent: number;
}

// ─── Mentorship ──────────────────────────────────────────────────────────────

export type MentorshipStatus =
  | "pending"
  | "active"
  | "completed"
  | "declined";

export interface Mentorship {
  id: string;
  studentId: string;
  alumniId: string;
  alumni: Pick<Alumni, "id" | "name" | "avatar" | "role" | "company">;
  student?: {
    id: string;
    name: string;
    avatar?: string;
    careerGoal?: string;
    department?: string;
    academicYear?: string;
    interests?: string[];
    skills?: string[];
  };
  status: MentorshipStatus;
  startDate?: string;
  requestDate?: string;
  requestMessage?: string;
  nextSession?: string;
  sessionCount: number;
  notes?: string;
  focus: string; // e.g. "Product Management career transition"
  declinedReason?: string;
  direction?: "outgoing" | "incoming";
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: string;
  participantCompany: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | "mentorship_request"
  | "message"
  | "session_reminder"
  | "profile_view"
  | "match_suggestion";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actorAvatar?: string;
  actorName?: string;
}

// ─── Career ──────────────────────────────────────────────────────────────────

export interface SkillGap {
  skill: string;
  currentLevel: "none" | "beginner" | "intermediate";
  targetLevel: "intermediate" | "advanced" | "expert";
  priority: "high" | "medium" | "low";
  resources: string[];
}

export interface CareerRoadmapMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  category: "skill" | "experience" | "network" | "certification";
}

export interface CareerRoadmap {
  id: string;
  studentId: string;
  targetRole: string;
  targetCompany?: string;
  targetDate: string;
  currentProgress: number; // 0-100
  milestones: CareerRoadmapMilestone[];
  skillGaps: SkillGap[];
}

// ─── Resume ───────────────────────────────────────────────────────────────────

export type ResumeFeedbackCategory =
  | "impact"
  | "clarity"
  | "keywords"
  | "formatting"
  | "experience"
  | "summary";

export interface ResumeFeedbackItem {
  id: string;
  category: ResumeFeedbackCategory;
  severity: "critical" | "suggestion" | "positive";
  title: string;
  description: string;
  section?: string;
}

export interface ResumeReview {
  id: string;
  studentId: string;
  submittedAt: string;
  overallScore: number; // 0-100
  feedback: ResumeFeedbackItem[];
  atsScore: number; // 0-100
  improvementAreas: string[];
}

export interface ResumeProjectSuggestion {
  projectName: string;
  originalBullet: string;
  suggestedBullet: string;
  reason: string;
}

export interface ResumeAnalysisOptions {
  skillsAnalysis: boolean;
  projectDescriptionFeedback: boolean;
  structureReview: boolean;
  targetRoleAlignment: boolean;
}

export interface ResumeReviewResult {
  id: string;
  fileName: string;
  fileSize: string;
  targetRole: string;
  submittedAt: string;
  overallScore: number; // 0-100 Illustrative demo score
  atsScore: number;     // 0-100 Illustrative demo ATS score
  summary: string;
  skillsIdentified: {
    technical: string[];
    soft: string[];
    missingForRole: string[];
  };
  strengths: string[];
  areasToImprove: ResumeFeedbackItem[];
  projectSuggestions: ResumeProjectSuggestion[];
  missingOrUnclearInfo: string[];
  recommendedNextSteps: {
    step: number;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
  }[];
}

// ─── Career Assistant Types ──────────────────────────────────────────────────

export type AssistantMessageRole = "user" | "assistant" | "system";

export interface AssistantSuggestedAction {
  label: string;
  href?: string;
  prompt?: string;
  actionType?: "roadmap" | "resume" | "alumni" | "prompt";
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  timestamp: string;
  suggestions?: string[];
  suggestedActions?: AssistantSuggestedAction[];
}

export interface CareerAssistantRequest {
  prompt: string;
  studentContext?: {
    studentName?: string;
    targetRole?: string;
    currentSkills?: string[];
    academicYear?: string;
    activeRoadmapStage?: string;
  };
}

export interface CareerAssistantResponse {
  message: AssistantMessage;
  latencyMs: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalConnections: number;
  activeMentorships: number;
  unreadMessages: number;
  profileViews: number;
}

// ─── Dashboard Extension Types ───────────────────────────────────────────────

export type RoadmapStageStatus = "not_started" | "in_progress" | "completed";

export interface RoadmapStageProject {
  title: string;
  description: string;
  techStack?: string[];
  deliverables?: string;
}

export interface RoadmapStage {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: RoadmapStageStatus;
  estimatedWeeks?: string;
  keySkills?: string[];
  suggestedActivities?: string[];
  project?: RoadmapStageProject;
}

export interface DemoActivity {
  id: string;
  type: "profile" | "match" | "roadmap" | "mentorship";
  title: string;
  description: string;
  timestamp: string;
  tag?: string;
}

export interface RecommendedAlumni extends Alumni {
  experienceYears: string;
  matchExplanation: string;
  matchScore: number;
}

export interface MentorshipActivityData {
  pendingRequests: Mentorship[];
  acceptedMentorships: Mentorship[];
  declinedRequests?: Mentorship[];
  recentConversations: Conversation[];
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserSettings {
  account: {
    email: string;
    role: UserRole;
    accountCreatedAt: string;
  };
  profile: {
    name: string;
    department: string;
    academicYear: string;
    graduationYear: number;
    bio: string;
    headline: string;
  };
  careerPreferences: {
    targetRole: string;
    preferredIndustries: string[];
    preferredSkills: string[];
    mentorshipInterests: string[];
  };
  notificationPreferences: {
    mentorshipRequests: boolean;
    messages: boolean;
    careerReminders: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: "public" | "university_only" | "private";
    mentorshipAvailability: "open" | "busy" | "closed";
    showEmail: boolean;
    showLinkedIn: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    compactMode: boolean;
  };
}

// ─── Auth Session ─────────────────────────────────────────────────────────────

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  email: string;
  name: string;
  avatar?: string;
  headline?: string;
  company?: string;
  alumniId?: string;
  department?: string;
}

// ─── Opportunities & Referrals ────────────────────────────────────────────────

export type OpportunityType = "internship" | "full_time" | "referral" | "shadowing" | "research";

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: OpportunityType;
  postedByAlumniId: string;
  postedByAlumniName: string;
  postedByAlumniRole: string;
  postedDate: string;
  deadline?: string;
  description: string;
  requirements: string[];
  skills: string[];
  applyUrl?: string;
  contactEmail?: string;
  applicantsCount: number;
}

// ─── Community Posts & Discussions ───────────────────────────────────────────

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorType: UserRole;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorType: UserRole;
  authorAvatar?: string;
  category: "career_advice" | "technical" | "interview_prep" | "networking" | "general";
  timestamp: string;
  likes: number;
  tags: string[];
  comments: CommunityComment[];
}

// ─── Discover Student Model (Alumni View) ─────────────────────────────────────

export interface StudentProjectDetail {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  role?: string;
}

export interface StudentEducation {
  degree: string;
  university: string;
  department: string;
  graduationYear: number;
  academicYear: string;
  gpa?: string;
  isGpaPublic?: boolean;
  coursework?: string[];
}

export interface StudentPrivacy {
  isProfilePublic: boolean;
  showGpa: boolean;
  showEmail: boolean;
  showResume: boolean;
  showAchievements: boolean;
}

export interface DiscoverStudent {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  headline: string;
  university: string;
  department: string;
  academicYear: string;
  graduationYear: number;
  careerGoal: string;
  skills: Skill[];
  interests: Interest[];
  preferredIndustry?: string;
  preferredIndustries?: string[];
  bio: string;
  gpa?: string;
  seekingMentorshipIn: string[];
  projects: string[];
  detailedProjects?: StudentProjectDetail[];
  education?: StudentEducation;
  achievements?: string[];
  mentorshipCadence?: string;
  mentorshipStatement?: string;
  privacy?: StudentPrivacy;
  location?: string;
  matchScore?: number;
  isMentee?: boolean;
  hasPendingRequest?: boolean;
}

// ─── Mentorship Sessions & University Events ──────────────────────────────────

export interface MentorshipSession {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentDepartment: string;
  studentAcademicYear: string;
  topic: string;
  date: string;
  time: string;
  status: "confirmed" | "scheduled" | "completed" | "rescheduled";
  meetUrl?: string;
  agenda?: string;
  notes?: string;
}

export interface UniversityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "Career Fair" | "Tech Talk" | "Hackathon" | "Networking" | "Alumni Panel";
  rsvpCount: number;
  description: string;
  isRegistered?: boolean;
}

export interface MentorshipTip {
  id: string;
  title: string;
  tip: string;
  category: string;
}




