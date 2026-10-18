"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Users,
  Inbox,
  UserCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  Check,
  X,
  Target,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadAlumniProfile,
  loadMentorshipActivity,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  loadStudentsList,
  loadOpportunities,
  loadCommunityPosts,
} from "@/lib/dashboard-storage";
import {
  defaultAlumniUser,
  initialMentorshipActivity,
  studentsData,
  initialOpportunities,
  initialCommunityPosts,
} from "@/lib/mock-data";
import { OfferMentorshipModal } from "@/components/alumni-dashboard/OfferMentorshipModal";
import { PostOpportunityModal } from "@/components/alumni-dashboard/PostOpportunityModal";
import { NewDiscussionModal } from "@/components/alumni-dashboard/NewDiscussionModal";
import type { DiscoverStudent } from "@/types";

export default function AlumniDashboardPage() {
  const alumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const students = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentsList,
    () => studentsData
  );

  const opportunities = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadOpportunities,
    () => initialOpportunities
  );

  const communityPosts = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadCommunityPosts,
    () => initialCommunityPosts
  );

  // Modal States
  const [selectedStudentForOffer, setSelectedStudentForOffer] = useState<DiscoverStudent | null>(null);
  const [isPostOpportunityOpen, setIsPostOpportunityOpen] = useState(false);
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const pendingRequests = mentorshipActivity.pendingRequests;
  const activeMentees = mentorshipActivity.acceptedMentorships || [];
  const myOpportunities = opportunities.filter((o) => o.postedByAlumniId === alumni.id || o.postedByAlumniName === alumni.name);

  const handleAccept = (requestId: string, studentName: string) => {
    acceptMentorshipRequest(requestId);
    showToast(`Accepted mentorship request from ${studentName}. Mentee added to your roster.`);
  };

  const handleDecline = (requestId: string, studentName: string) => {
    declineMentorshipRequest(requestId);
    showToast(`Declined mentorship request from ${studentName}.`);
  };

  // Recommended students that don't have pending requests yet
  const recommendedStudents = students.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <Avatar name={alumni.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  Welcome back, {alumni.name.split(" ")[0]}!
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded-full border border-[#bfe3c9]">
                  <ShieldCheck size={11} /> Verified Mentor
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {alumni.headline || `${alumni.role} at ${alumni.company}`}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Alumni Class of {alumni.graduationYear} · {alumni.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPostOpportunityOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <Briefcase size={13} className="text-[#0a66c2]" />
              <span>Post Opportunity</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              asChild
              className="bg-[#0a66c2] hover:bg-[#004182] text-xs"
            >
              <Link href="/alumni-dashboard/students" className="flex items-center gap-1.5">
                <Users size={13} />
                <span>Discover Students</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Pending Requests</span>
            <div className="h-7 w-7 rounded-full bg-blue-50 text-[#0a66c2] flex items-center justify-center">
              <Inbox size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{pendingRequests.length}</span>
            <span className="text-[11px] text-gray-500">students waiting</span>
          </div>
          <Link
            href="/alumni-dashboard/requests"
            className="mt-2 text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
          >
            <span>Review requests</span>
            <ChevronRight size={11} />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Mentees</span>
            <div className="h-7 w-7 rounded-full bg-emerald-50 text-[#057642] flex items-center justify-center">
              <UserCheck size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{activeMentees.length}</span>
            <span className="text-[11px] text-gray-500">of 5 slots filled</span>
          </div>
          <Link
            href="/alumni-dashboard/mentees"
            className="mt-2 text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
          >
            <span>Manage mentees</span>
            <ChevronRight size={11} />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Opportunities</span>
            <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Briefcase size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{myOpportunities.length}</span>
            <span className="text-[11px] text-gray-500">active postings</span>
          </div>
          <Link
            href="/alumni-dashboard/opportunities"
            className="mt-2 text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
          >
            <span>View applicants</span>
            <ChevronRight size={11} />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Mentorship Hours</span>
            <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">18 hrs</span>
            <span className="text-[11px] text-emerald-600 font-medium">Top 5% alumni</span>
          </div>
          <span className="mt-2 text-[11px] text-gray-400 block">
            Impact: 14 sessions logged
          </span>
        </div>
      </div>

      {/* Main Grid: 2/3 Content + 1/3 Sidebar Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Incoming Mentorship Requests */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">Incoming Mentorship Requests</h2>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf3fb] text-[#0a66c2]">
                    {pendingRequests.length} pending
                  </span>
                )}
              </div>
              <Link
                href="/alumni-dashboard/requests"
                className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="h-10 w-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-2">
                    <Inbox size={20} />
                  </div>
                  <p className="text-xs font-medium text-gray-900">No pending mentorship requests</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    You have reviewed all incoming student requests. You can proactively discover students to mentor.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mt-3 text-xs"
                  >
                    <Link href="/alumni-dashboard/students">Discover Students &rarr;</Link>
                  </Button>
                </div>
              ) : (
                pendingRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar name={req.student?.name || "Student"} size="md" />
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {req.student?.name || "Student"}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate">
                            {req.student?.academicYear || "Undergraduate"} · {req.student?.department || "Engineering"}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#0a66c2]">
                            <Target size={11} className="shrink-0" />
                            <span className="font-medium truncate">Goal: {req.student?.careerGoal || "Software Engineer"}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-400 shrink-0">
                        {req.requestDate}
                      </span>
                    </div>

                    {req.requestMessage && (
                      <p className="mt-2 text-xs text-gray-700 bg-gray-50 rounded-md p-2.5 border border-gray-100 italic leading-relaxed">
                        &ldquo;{req.requestMessage}&rdquo;
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(req.id, req.student?.name || "Student")}
                        className="text-xs text-gray-600 hover:text-red-600"
                      >
                        <X size={12} className="mr-1" />
                        <span>Decline</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(req.id, req.student?.name || "Student")}
                        className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                      >
                        <Check size={12} className="mr-1" />
                        <span>Accept Mentorship</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Mentees Progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Your Active Mentees</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Guidance cohorts and milestone tracking
                </p>
              </div>
              <Link
                href="/alumni-dashboard/mentees"
                className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <span>Full cohort details</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {activeMentees.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/40 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.student?.name || "Student"} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{m.student?.name || "Student"}</h4>
                        <p className="text-[11px] text-gray-500">{m.focus}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded border border-[#bfe3c9]">
                      {m.sessionCount} sessions logged
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">
                      Started: <strong className="text-gray-700">{m.startDate}</strong>
                    </span>
                    <Link
                      href={`/messages?participantId=${m.student?.id || m.studentId}`}
                      className="font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <span>Message Mentee</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Feed Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Campus &amp; Community Discussions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recent questions posted by students seeking mentor insights
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewDiscussionOpen(true)}
                className="text-xs flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Start Discussion</span>
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {communityPosts.slice(0, 2).map((post) => (
                <div key={post.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0a66c2]">
                      {post.category.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-gray-400">·</span>
                    <span className="text-[11px] text-gray-500">Posted by {post.authorName}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mt-1 leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">
                      {post.comments.length} student replies · {post.likes} helpful votes
                    </span>
                    <Link
                      href="/alumni-dashboard/community"
                      className="font-semibold text-[#0a66c2] hover:underline"
                    >
                      Join discussion &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-5">
          {/* Mentorship Availability & Slots */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 mb-2">Mentorship Availability</h3>
            <div className="p-3 rounded-lg bg-[#eef8f1] border border-[#bfe3c9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#057642] animate-pulse" />
                <span className="text-xs font-semibold text-[#057642]">Open to New Mentees</span>
              </div>
              <span className="text-[11px] font-bold text-[#057642]">Active</span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Roster Capacity</span>
                <span className="font-bold text-gray-900">{activeMentees.length} of 5 Mentees</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#0a66c2] rounded-full transition-all duration-300"
                  style={{ width: `${(activeMentees.length / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                1 open mentorship slot remaining this semester.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Link
                href="/alumni-dashboard/profile"
                className="text-xs text-[#0a66c2] font-semibold hover:underline block text-center"
              >
                Edit Mentorship Preferences &rarr;
              </Link>
            </div>
          </div>

          {/* Recommended Students to Mentor */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900">Recommended Students</h3>
              <Link
                href="/alumni-dashboard/students"
                className="text-[11px] font-semibold text-[#0a66c2] hover:underline"
              >
                All
              </Link>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {recommendedStudents.map((st) => (
                <div key={st.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2.5">
                    <Avatar name={st.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{st.name}</h4>
                        {st.matchScore && (
                          <span className="text-[10px] font-bold text-[#0a66c2] bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                            {st.matchScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {st.academicYear} · {st.department}
                      </p>
                      <p className="text-[11px] text-gray-700 truncate mt-0.5">
                        Goal: <span className="font-medium">{st.careerGoal}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex gap-1 overflow-hidden">
                      {st.skills.slice(0, 2).map((sk) => {
                        const skName = typeof sk === "string" ? sk : sk.name;
                        return (
                          <span key={skName} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 truncate">
                            {skName}
                          </span>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudentForOffer(st)}
                      disabled={st.hasPendingRequest}
                      className="text-[11px] py-1 px-2.5 h-auto text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
                    >
                      {st.hasPendingRequest ? "Pending" : "Offer Mentorship"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                href="/alumni-dashboard/students"
                className="text-xs text-[#0a66c2] font-semibold hover:underline block text-center"
              >
                Browse All Student Profiles &rarr;
              </Link>
            </div>
          </div>

          {/* Your Opportunities */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900">Your Opportunities</h3>
              <button
                type="button"
                onClick={() => setIsPostOpportunityOpen(true)}
                className="text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <Plus size={11} />
                <span>Post</span>
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {myOpportunities.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">
                  You haven&apos;t posted any active opportunities yet.
                </p>
              ) : (
                myOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-2.5 rounded-md border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {opp.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#0a66c2] bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{opp.company} · {opp.location}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#057642] font-semibold">
                        {opp.applicantsCount} applicants
                      </span>
                      <Link
                        href="/alumni-dashboard/opportunities"
                        className="text-[#0a66c2] hover:underline font-medium"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Mentorship Modal */}
      <OfferMentorshipModal
        student={selectedStudentForOffer}
        isOpen={Boolean(selectedStudentForOffer)}
        onClose={() => setSelectedStudentForOffer(null)}
        onSuccess={(name) =>
          showToast(`Mentorship offer sent to ${name}! Track it under Mentorship Requests.`)
        }
      />

      {/* Post Opportunity Modal */}
      <PostOpportunityModal
        isOpen={isPostOpportunityOpen}
        onClose={() => setIsPostOpportunityOpen(false)}
        onSuccess={(title) =>
          showToast(`Successfully published opportunity: "${title}".`)
        }
      />

      {/* New Discussion Modal */}
      <NewDiscussionModal
        isOpen={isNewDiscussionOpen}
        onClose={() => setIsNewDiscussionOpen(false)}
        onSuccess={(title) =>
          showToast(`Published community discussion: "${title}".`)
        }
      />
    </div>
  );
}
