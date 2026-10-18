"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Target,
  Code,
  FolderGit2,
  Award,
  Sparkles,
  Send,
  MessageSquare,
  Lock,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadStudentsList,
  loadMentorshipActivity,
} from "@/lib/dashboard-storage";
import { studentsData, initialMentorshipActivity } from "@/lib/mock-data";
import { OfferMentorshipModal } from "@/components/alumni-dashboard/OfferMentorshipModal";

interface StudentProfileClientProps {
  studentId: string;
}

export function StudentProfileClient({ studentId }: StudentProfileClientProps) {
  const students = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentsList,
    () => studentsData
  );

  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs max-w-xl mx-auto my-12">
        <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-base font-bold text-gray-900">Student Profile Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          The requested student record does not exist or may have been removed from the directory.
        </p>
        <Button variant="primary" size="sm" asChild className="mt-4 text-xs bg-[#0a66c2]">
          <Link href="/alumni-dashboard/students" className="flex items-center gap-1.5">
            <ArrowLeft size={13} />
            <span>Back to Student Directory</span>
          </Link>
        </Button>
      </div>
    );
  }

  // Check relationship status
  const isMentee =
    student.isMentee ||
    mentorshipActivity.acceptedMentorships.some(
      (m) => m.studentId === student.id || m.student?.id === student.id
    );

  const hasPendingInvitation =
    student.hasPendingRequest ||
    mentorshipActivity.pendingRequests.some(
      (r) =>
        (r.studentId === student.id || r.student?.id === student.id) &&
        r.status === "pending"
    );

  const privacy = student.privacy || {
    isProfilePublic: true,
    showGpa: true,
    showEmail: false,
    showResume: true,
    showAchievements: true,
  };

  const isGpaVisible =
    privacy.showGpa &&
    student.education?.isGpaPublic !== false &&
    student.gpa;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link
          href="/alumni-dashboard/students"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a66c2] hover:underline"
        >
          <ArrowLeft size={13} />
          <span>Back to Discover Students Directory</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        {/* Cover Ribbon */}
        <div className="h-28 bg-linear-to-r from-[#0a66c2] via-[#004182] to-slate-900 relative p-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-1.5 text-xs text-white/90 bg-white/10 px-2.5 py-1 rounded backdrop-blur-xs">
            <Globe size={13} />
            <span>Enrolled Student Profile · Verified University Directory</span>
          </div>

          {student.matchScore && (
            <span className="text-xs font-bold text-white bg-white/20 border border-white/30 px-2.5 py-1 rounded">
              {student.matchScore}% Domain Affinity Match
            </span>
          )}
        </div>

        {/* Profile Info Strip */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-12 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="h-24 w-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
              <Avatar name={student.name} size="lg" className="w-full h-full text-xl" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Link
                  href={`/messages?participantId=${student.id}`}
                  className="flex items-center gap-1.5"
                >
                  <MessageSquare size={13} className="text-[#0a66c2]" />
                  <span>Send Message</span>
                </Link>
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={hasPendingInvitation || isMentee}
                onClick={() => setIsOfferModalOpen(true)}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>
                  {isMentee
                    ? "Active Mentee"
                    : hasPendingInvitation
                    ? "Invitation Pending"
                    : "Invite to Mentorship"}
                </span>
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded-full border border-[#bfe3c9]">
                <ShieldCheck size={11} /> Verified Student
              </span>
              {hasPendingInvitation && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0a66c2] bg-[#ebf3fb] px-2 py-0.5 rounded-full border border-[#b2d5f8]">
                  <Clock size={11} /> Invitation Awaiting Review
                </span>
              )}
            </div>

            <p className="text-xs text-gray-700 font-medium mt-1">
              {student.headline}
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-gray-800">
                <GraduationCap size={14} className="text-[#0a66c2]" />
                {student.university}
              </span>
              <span>·</span>
              <span>{student.department}</span>
              <span>·</span>
              <span className="font-medium text-gray-700">
                {student.academicYear} (Class of {student.graduationYear})
              </span>
              {student.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin size={12} />
                    {student.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2/3 Content + 1/3 Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section 1: About the Student */}
          {student.bio && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                About the Student
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/60 p-3.5 rounded-md border border-gray-100">
                {student.bio}
              </p>
            </div>
          )}

          {/* Section 2: Education Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <GraduationCap size={16} className="text-[#0a66c2]" />
              <h2 className="text-sm font-bold text-gray-900">Education Background</h2>
            </div>

            <div className="mt-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">
                    {student.education?.degree || `Bachelor of Science in ${student.department}`}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {student.university} · {student.department}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 shrink-0">
                  Expected Graduation: {student.graduationYear}
                </span>
              </div>

              {/* GPA Check & Privacy */}
              <div className="p-2.5 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-600">Cumulative Academic Standing:</span>
                {isGpaVisible ? (
                  <span className="font-bold text-gray-900">GPA: {student.gpa}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-gray-400 italic text-[11px]">
                    <Lock size={12} /> GPA hidden per student privacy preferences
                  </span>
                )}
              </div>

              {/* Coursework */}
              {student.education?.coursework && student.education.coursework.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Highlighted Technical Coursework
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {student.education.coursework.map((course) => (
                      <span
                        key={course}
                        className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Technical Skills & Stack */}
          {student.skills && student.skills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Code size={16} className="text-[#0a66c2]" />
                <h2 className="text-sm font-bold text-gray-900">Technical Skills &amp; Stack</h2>
              </div>

              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {student.skills.map((skill) => {
                  const skillName = typeof skill === "string" ? skill : skill.name;
                  const level = typeof skill === "object" ? skill.level : undefined;

                  return (
                    <div
                      key={skillName}
                      className="p-2.5 rounded-md border border-gray-200 bg-gray-50/50 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-gray-900">{skillName}</span>
                      {level && (
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            level === "expert"
                              ? "bg-purple-50 text-purple-700"
                              : level === "advanced"
                              ? "bg-emerald-50 text-[#057642]"
                              : "bg-blue-50 text-[#0a66c2]"
                          }`}
                        >
                          {level}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Featured Projects & Portfolio */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FolderGit2 size={16} className="text-[#0a66c2]" />
                <h2 className="text-sm font-bold text-gray-900">Portfolio &amp; Featured Projects</h2>
              </div>
              <span className="text-xs text-gray-400">
                {(student.detailedProjects || student.projects).length} showcased projects
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {student.detailedProjects && student.detailedProjects.length > 0 ? (
                student.detailedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-gray-900">{proj.title}</h3>
                        {proj.role && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded font-medium">
                            {proj.role}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                          >
                            <span>Code</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {proj.demoUrl && (
                          <a
                            href={proj.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>Live Demo</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded text-gray-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                student.projects.map((projTitle, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50/40 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-gray-900">{projTitle}</span>
                    <span className="text-[11px] text-gray-400">Portfolio Project</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Achievements & Honors */}
          {student.achievements && student.achievements.length > 0 && privacy.showAchievements && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Award size={16} className="text-amber-600" />
                <h2 className="text-sm font-bold text-gray-900">Academic &amp; Extracurricular Honors</h2>
              </div>
              <ul className="mt-3.5 space-y-2 text-xs text-gray-800">
                {student.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2 rounded bg-amber-50/40 border border-amber-100">
                    <span className="h-4 w-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-snug">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 6: Mentorship Preferences & Goals */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Sparkles size={16} className="text-[#0a66c2]" />
              <h2 className="text-sm font-bold text-gray-900">Mentorship Requirements &amp; Goals</h2>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              {student.seekingMentorshipIn && student.seekingMentorshipIn.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Topics Seeking Guidance In
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {student.seekingMentorshipIn.map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-[#0a66c2] border border-blue-200 font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {student.mentorshipCadence && (
                <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-900">Preferred Meeting Cadence: </span>
                  <span className="text-gray-700">{student.mentorshipCadence}</span>
                </div>
              )}

              {student.mentorshipStatement && (
                <div className="p-3 rounded-md bg-blue-50/40 border border-blue-100">
                  <span className="font-bold text-gray-900 block mb-1">Mentee Commitment:</span>
                  <p className="text-gray-700 italic leading-relaxed">
                    &ldquo;{student.mentorshipStatement}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Mentorship Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Mentorship Connection
            </h3>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Current Status:</span>
                {isMentee ? (
                  <span className="font-bold text-[#057642]">Active Mentee</span>
                ) : hasPendingInvitation ? (
                  <span className="font-bold text-[#0a66c2]">Invitation Pending</span>
                ) : (
                  <span className="font-semibold text-gray-700">Open to Mentorship</span>
                )}
              </div>
            </div>

            <div className="mt-3.5 space-y-2">
              <Button
                variant="primary"
                size="sm"
                disabled={hasPendingInvitation || isMentee}
                onClick={() => setIsOfferModalOpen(true)}
                className="w-full bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center justify-center gap-1.5 py-2 h-auto"
              >
                <Send size={13} />
                <span>
                  {isMentee
                    ? "Mentee on Roster"
                    : hasPendingInvitation
                    ? "Invitation Pending"
                    : "Invite to Mentorship"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full text-xs text-gray-700 py-2 h-auto"
              >
                <Link
                  href={`/messages?participantId=${student.id}`}
                  className="flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  <span>Direct Message</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Career Preferences */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-gray-100">
              <Target size={14} className="text-[#0a66c2]" />
              <h3 className="text-xs font-bold text-gray-900">Career Aspirations</h3>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Desired Job Role
                </span>
                <p className="font-semibold text-gray-900 mt-0.5">{student.careerGoal}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Preferred Industries
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(student.preferredIndustries || [student.preferredIndustry || "Cloud & SaaS"]).map(
                    (ind) => (
                      <span
                        key={ind}
                        className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {ind}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Domain Match
                </span>
                <p className="text-gray-600 mt-0.5">
                  Matches your background in systems architecture, Go, and backend infrastructure.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Trust Notice */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs text-xs text-gray-600">
            <div className="flex items-center gap-1.5 text-gray-900 font-bold mb-2">
              <ShieldCheck size={14} className="text-[#057642]" />
              <span>Directory Privacy Standard</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              This profile strictly displays information permitted by the student under their account privacy settings. Private contact channels and grades are kept confidential until mutual mentorship is confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Offer Mentorship Modal */}
      <OfferMentorshipModal
        student={student}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={(name) =>
          showToast(`Mentorship invitation dispatched to ${name}! Track it under Mentorship Requests.`)
        }
      />
    </div>
  );
}
