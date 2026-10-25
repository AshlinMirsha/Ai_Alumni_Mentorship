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

// ─── Extended Alumni Profile Types ──────────────────────────────────────────

export type EmploymentStatusOption =
  | "Employed"
  | "Seeking opportunities"
  | "Studying further"
  | "Working independently"
  | "Career break"
  | string;

export interface AlumniCurrentEmployment {
  isCurrentlyEmployed?: boolean;
  status: EmploymentStatusOption;
  company?: string;
  role?: string;
  employmentType?: string;
  startMonthYear?: string;
  startDate?: string;
  location?: string;
  workMode?: "On-site" | "Hybrid" | "Remote" | string;
  workArrangement?: string;
  jobDescription?: string;
  responsibilities?: string;
}

export interface AlumniDetailedSkill {
  id: string;
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert" | string;
  yearsOfExperience?: number | string;
  description?: string;
}

export interface AlumniWorkExperienceRecord {
  id: string;
  company: string;
  role: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  responsibilities?: string;
  skills?: string[];
}

export type InternshipStatus = "Completed" | "Ongoing" | "Not Completed";

export interface AlumniInternshipRecord {
  id: string;
  company: string;
  role: string;
  domain: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  type?: string; // "On-site" | "Remote" | "Hybrid"
  skillsLearned?: string[];
  description?: string;
  proofUrl?: string;
  status: InternshipStatus;
}

export interface AlumniCareerMilestone {
  id: string;
  title: string;
  category: string; // Promotion, Project, Certification, Award, Hackathon, Milestone, Publication, Open-source, Leadership
  description?: string;
  date?: string;
  evidenceUrl?: string;
}

export interface AlumniCertification {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface AlumniEducationRecord {
  id: string;
  degree: string;
  institution: string;
  field?: string;
  graduationYear?: number;
  additionalQualifications?: string;
}

export interface AlumniSpecializationDetails {
  primarySpecialization?: string;
  additionalSpecializations?: string[];
  technicalDomains?: string[];
  professionalExpertise?: string[];
  industryExperience?: string;
  mentoringAreas?: string[];
  primaryDomain?: string;
  subfields?: string[];
  yearsInSpecialization?: number | string;
  advisingTopics?: string[];
}

export interface ProfessionalLinkItem {
  id: string;
  title?: string;
  label?: string;
  url: string;
  type?: "github" | "linkedin" | "portfolio" | "website" | "other" | string;
}

export interface AlumniMentorshipDetails {
  available: boolean;
  topics?: string[];
  skills?: string[];
  domains?: string[];
  technicalDomains?: string[];
  targetJobRoles?: string[];
  careerTopics?: string[];
  preferredFormats?: string[];
  maxMentees?: number;
  notes?: string;
}

export interface Alumni {
  id: string;
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  headline: string;
  location: string;
  city?: string;
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
  githubUrl?: string;
  portfolioUrl?: string;
  specializations?: string[];
  specializationDetails?: AlumniSpecializationDetails;
  currentEmployment?: AlumniCurrentEmployment;
  detailedSkills?: AlumniDetailedSkill[];
  detailedWorkExperience?: AlumniWorkExperienceRecord[];
  internships?: AlumniInternshipRecord[];
  careerJourney?: AlumniCareerMilestone[];
  mentorshipDetails?: AlumniMentorshipDetails;
  detailedEducation?: AlumniEducationRecord[];
  certifications?: AlumniCertification[];
  otherProfessionalLinks?: ProfessionalLinkItem[];
  mentorshipAvailability: MentorshipAvailability;
  mentorshipAreas: string[];
  mentorshipInterests?: string[];
  areasOfExpertise?: string[];
  projects?: Project[];
  responseRate: number; // percentage 0-100
  averageResponseTime: string; // e.g. "within 2 days"
  totalMentees: number;
  maxMentees?: number;
  university?: string;
  institution?: string;
  visibilityPreference?: "public" | "university_only" | "private";
  matchScore?: number; // computed match score 0-100
  matchExplanation?: string;
  lastActive?: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  headline: string;
  university: string;
  department: string;
  graduationYear: number;
  academicYear?: string;
  degree?: string;
  careerGoal?: string;
  preferredLocation?: string;
  internshipInterest?: string;
  projects?: string[];
  skills: Skill[];
  interests: Interest[];
  careerGoals: string[];
  bio: string;
  resumeUrl?: string;
  profileCompletionPercent: number;
  // Extended Student Profile Features
  currentActivities?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  leetcodeUrl?: string;
  otherLinks?: Array<{ title: string; url: string }>;
  detailedProjects?: StudentProjectDetail[];
  targetCompanies?: string[];
  achievements?: string[];
  education?: StudentEducation;
}

// ─── Mentorship ──────────────────────────────────────────────────────────────

export type MentorshipStatus =
  | "pending"
  | "active"
  | "completed"
  | "declined";

export interface MentorshipMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface MentorshipResource {
  id: string;
  title: string;
  url: string;
  addedDate: string;
}

export interface MentorshipNote {
  id: string;
  content: string;
  createdAt: string;
}

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
  milestones?: MentorshipMilestone[];
  resources?: MentorshipResource[];
  privateNotes?: MentorshipNote[];
  progressPercent?: number;
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
  | "mentorship_accepted"
  | "mentorship_declined"
  | "message"
  | "session_reminder"
  | "session_rescheduled"
  | "session_cancelled"
  | "opportunity_update"
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
  completedMentorships?: Mentorship[];
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
  id?: string;
  userId?: string;
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

export type OpportunityType =
  | "internship"
  | "full_time"
  | "referral"
  | "workshop"
  | "hackathon"
  | "event"
  | "shadowing"
  | "research";

export type WorkArrangement = "remote" | "hybrid" | "on_site";
export type OpportunityStatus = "active" | "closed";

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: OpportunityType;
  workArrangement?: WorkArrangement;
  status?: OpportunityStatus;
  postedByAlumniId: string;
  postedByAlumniName: string;
  postedByAlumniRole: string;
  postedDate: string;
  deadline?: string;
  description: string;
  requirements: string[];
  skills: string[];
  applyUrl?: string;
  contactInstructions?: string;
  contactEmail?: string;
  eligibility?: string;
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

export type CommunityCategory =
  | "career_advice"
  | "technical"
  | "achievement"
  | "event"
  | "opportunity"
  | "interview_prep"
  | "networking"
  | "general";

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorType: UserRole;
  authorAvatar?: string;
  category: CommunityCategory;
  timestamp: string;
  likes: number;
  likedByMe?: boolean;
  tags: string[];
  comments: CommunityComment[];
  opportunityRefId?: string;
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
  status?: string;
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
  status: "confirmed" | "scheduled" | "completed" | "rescheduled" | "cancelled";
  meetUrl?: string;
  agenda?: string;
  notes?: string;
  previousDate?: string;
  previousTime?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
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

// ─── AI Mentorship Assistant ──────────────────────────────────────────────────

export interface SessionPreparationResult {
  objectives: string[];
  discussionPrompts: string[];
  technicalExercises: string[];
  suggestedTakeaway: string;
  draftAgenda: string;
}

export interface CareerGuidanceResult {
  targetRole: string;
  keyCompetencies: string[];
  discussionTopics: { title: string; description: string }[];
  recommendedProjects: { title: string; description: string; techStack: string[] }[];
  strategicAdvice: string[];
}

export interface LearningRoadmapPhase {
  title: string;
  weeks: string;
  description: string;
  milestones: { title: string; targetWeeks: string }[];
}

export interface LearningRoadmapResult {
  menteeName: string;
  targetRole: string;
  overview: string;
  phases: LearningRoadmapPhase[];
}

export interface StudentMatchRecommendation {
  studentId: string;
  studentName: string;
  department: string;
  academicYear: string;
  matchScore: number;
  matchReasons: string[];
  suggestedTopics: string[];
  careerGoal: string;
}

export interface StudentMatchingResult {
  recommendations: StudentMatchRecommendation[];
  summary: string;
}

export interface SessionSummaryResult {
  executiveSummary: string;
  keyHighlights: string[];
  studentActionItems: string[];
  mentorActionItems?: string[];
  recommendedNextTopic: string;
  formattedNotes: string;
}
