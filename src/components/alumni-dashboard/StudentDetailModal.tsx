"use client";

import Link from "next/link";
import {
  X,
  Target,
  Code,
  Sparkles,
  Send,
  GraduationCap,
  Award,
  ExternalLink,
  Shield,
  FolderGit2,
  Lock,
  Globe,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { DiscoverStudent } from "@/types";

interface StudentDetailModalProps {
  student: DiscoverStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onOfferMentorship: (student: DiscoverStudent) => void;
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
  onOfferMentorship,
}: StudentDetailModalProps) {
  if (!isOpen || !student) return null;

  const privacy = student.privacy || {
    isProfilePublic: true,
    showGpa: true,
    showEmail: false,
    showResume: true,
    showAchievements: true,
  };

  const isGpaVisible = privacy.showGpa && (student.education?.isGpaPublic !== false) && student.gpa;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
        {/* Banner Header */}
        <div className="h-24 bg-linear-to-r from-[#0a66c2] via-[#004182] to-slate-900 relative p-4 flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
            <Globe size={13} />
            <span>Verified Student Profile</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/alumni-dashboard/students/${student.id}`}
              onClick={onClose}
              className="text-[11px] font-semibold text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
            >
              <span>Full Page</span>
              <ExternalLink size={11} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Profile Info Strip */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-10 mb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
              <Avatar name={student.name} size="lg" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs text-gray-700"
              >
                <Link href={`/alumni-dashboard/students/${student.id}`} onClick={onClose}>
                  <span>Full Profile &rarr;</span>
                </Link>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOfferMentorship(student);
                }}
                disabled={student.hasPendingRequest}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                <Send size={12} />
                <span>{student.hasPendingRequest ? "Invitation Pending" : "Invite to Mentorship"}</span>
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900">{student.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded-full border border-[#bfe3c9]">
                <CheckCircle2 size={10} /> Enrolled Student
              </span>
              {student.matchScore && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                  {student.matchScore}% Domain Match
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {student.headline || `${student.academicYear} · ${student.department}`}
            </p>

            <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <GraduationCap size={13} className="text-[#0a66c2]" />
                <strong>{student.university}</strong>
              </span>
              <span>·</span>
              <span>Class of {student.graduationYear}</span>
              {student.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin size={11} />
                    {student.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bio / About */}
          {student.bio && (
            <div className="mt-4 pt-3.5 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-1">About the Student</h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-2.5 rounded-md border border-gray-100">
                {student.bio}
              </p>
            </div>
          )}

          {/* Education Details */}
          <div className="mt-4 pt-3.5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-[#0a66c2]" />
              <span>Education</span>
            </h4>
            <div className="bg-white border border-gray-200 rounded-md p-3 text-xs space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">
                    {student.education?.degree || `B.S. in ${student.department}`}
                  </p>
                  <p className="text-gray-600">{student.university} · {student.department}</p>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  {student.academicYear} (Class of {student.graduationYear})
                </span>
              </div>

              {/* GPA Display with Privacy Check */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Cumulative GPA:</span>
                {isGpaVisible ? (
                  <span className="font-bold text-gray-900">{student.gpa}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-400 italic">
                    <Lock size={10} /> Hidden per student privacy settings
                  </span>
                )}
              </div>

              {/* Relevant Coursework */}
              {student.education?.coursework && student.education.coursework.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Relevant Coursework
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {student.education.coursework.map((course) => (
                      <span
                        key={course}
                        className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Career Goals & Preferred Industry */}
          <div className="mt-4 pt-3.5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <Target size={14} className="text-[#0a66c2]" />
              <span>Career Interests &amp; Professional Goals</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Desired Job Role
                </span>
                <p className="font-semibold text-gray-900 mt-0.5">{student.careerGoal}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Preferred Industry
                </span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {student.preferredIndustry || "Cloud Computing & SaaS"}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          {student.skills && student.skills.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Code size={14} className="text-[#0a66c2]" />
                <span>Technical Skills &amp; Stack</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill) => {
                  const skillName = typeof skill === "string" ? skill : skill.name;
                  const level = typeof skill === "object" ? skill.level : undefined;
                  return (
                    <span
                      key={skillName}
                      className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800 font-medium flex items-center gap-1"
                    >
                      <span>{skillName}</span>
                      {level && (
                        <span className="text-[10px] text-gray-400 capitalize">· {level}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          <div className="mt-4 pt-3.5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <FolderGit2 size={14} className="text-[#0a66c2]" />
              <span>Projects &amp; Portfolio</span>
            </h4>
            <div className="space-y-2">
              {student.detailedProjects && student.detailedProjects.length > 0 ? (
                student.detailedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-md border border-gray-200 bg-gray-50/40 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-gray-900">{p.title}</h5>
                      {p.role && (
                        <span className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.2 rounded">
                          {p.role}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.2 rounded text-gray-600 font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#0a66c2] hover:underline flex items-center gap-1"
                        >
                          <span>Repository</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                student.projects.map((projTitle, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md border border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-gray-900">{projTitle}</span>
                    <span className="text-[10px] text-gray-400">Portfolio Project</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements & Honors */}
          {student.achievements && student.achievements.length > 0 && privacy.showAchievements && (
            <div className="mt-4 pt-3.5 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Award size={14} className="text-amber-600" />
                <span>Honors &amp; Achievements</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {student.achievements.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mentorship Information */}
          <div className="mt-4 pt-3.5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#0a66c2]" />
              <span>Mentorship Information &amp; Preferences</span>
            </h4>
            <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3 text-xs space-y-2">
              {student.seekingMentorshipIn && student.seekingMentorshipIn.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0a66c2] block mb-1">
                    Topics Seeking Guidance In
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {student.seekingMentorshipIn.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 text-[11px] rounded bg-white text-[#0a66c2] border border-blue-200 font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {student.mentorshipCadence && (
                <div className="text-[11px] text-gray-700">
                  <span className="font-semibold text-gray-900">Preferred Cadence: </span>
                  {student.mentorshipCadence}
                </div>
              )}

              {student.mentorshipStatement && (
                <p className="text-[11px] text-gray-600 italic border-t border-blue-100 pt-1.5">
                  &ldquo;{student.mentorshipStatement}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Privacy & Permissions Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <Shield size={12} className="text-[#057642]" />
              <span>Displaying student-permitted directory records</span>
            </div>
            <Link
              href={`/alumni-dashboard/students/${student.id}`}
              onClick={onClose}
              className="font-semibold text-[#0a66c2] hover:underline"
            >
              Open Full Profile Page &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
