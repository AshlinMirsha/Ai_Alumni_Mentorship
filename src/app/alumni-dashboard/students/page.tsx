"use client";

import { useState, useMemo, useSyncExternalStore, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Target,
  Send,
  Eye,
  CheckCircle2,
  X,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Briefcase,
  ShieldCheck,
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
import { StudentDetailModal } from "@/components/alumni-dashboard/StudentDetailModal";
import type { DiscoverStudent } from "@/types";

const DEPARTMENTS = [
  "Computer Science",
  "Computer Science & Data Science",
  "Electrical Engineering & Computer Science",
  "Human-Centered Design & Engineering",
  "Computer Engineering",
  "Computer Science & Business Honors",
];

const ACADEMIC_YEARS = [
  { label: "Sophomore (2nd Year)", value: "sophomore" },
  { label: "Junior (3rd Year)", value: "junior" },
  { label: "Senior (4th Year)", value: "senior" },
  { label: "Graduate / Master's", value: "graduate" },
];

const CAREER_INTERESTS = [
  "Full-Stack Software Engineer",
  "Backend & Systems Engineer",
  "Product Manager",
  "Machine Learning Engineer",
  "UX Engineer / Frontend Developer",
  "DevOps & Cloud Platform Engineer",
  "Security Engineer",
  "Technical Program Manager",
];

const TECHNICAL_SKILLS = [
  "Python",
  "Go",
  "React",
  "TypeScript",
  "JavaScript",
  "SQL",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "Linux",
  "AWS",
  "PyTorch",
  "Figma",
  "Terraform",
];

const PREFERRED_INDUSTRIES = [
  "Cloud Computing & SaaS",
  "Cloud Infrastructure & Developer Tools",
  "FinTech & Payments",
  "Artificial Intelligence & LLMs",
  "Consumer Tech & Design Systems",
  "DevOps & Cloud Platform",
  "Cybersecurity & Defense",
  "Enterprise Software / SaaS",
];

function DiscoverStudentsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

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

  // Search & Filter State
  const [search, setSearch] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCareer, setSelectedCareer] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"match" | "name" | "year" | "skills">("match");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals & Feedback
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<DiscoverStudent | null>(null);
  const [selectedStudentForOffer, setSelectedStudentForOffer] = useState<DiscoverStudent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Comprehensive Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((st) => {
        // 1. Text Search across: Name, Technical Skills, Department, Career Interests, Desired Job Role
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const matchesName = st.name.toLowerCase().includes(q);
          const matchesGoal = (st.careerGoal || "").toLowerCase().includes(q);
          const matchesDept = (st.department || "").toLowerCase().includes(q);
          const matchesHeadline = (st.headline || "").toLowerCase().includes(q);
          const matchesUniversity = (st.university || "").toLowerCase().includes(q);
          const matchesSkills = st.skills.some((s) => {
            const skillName = typeof s === "string" ? s : s.name;
            return skillName.toLowerCase().includes(q);
          });
          const matchesInterests = st.interests.some((it) =>
            it.name.toLowerCase().includes(q)
          );
          const matchesMentorshipTopics = st.seekingMentorshipIn?.some((t) =>
            t.toLowerCase().includes(q)
          );
          const matchesIndustry =
            (st.preferredIndustry || "").toLowerCase().includes(q) ||
            (st.preferredIndustries || []).some((ind) => ind.toLowerCase().includes(q));

          if (
            !matchesName &&
            !matchesGoal &&
            !matchesDept &&
            !matchesHeadline &&
            !matchesUniversity &&
            !matchesSkills &&
            !matchesInterests &&
            !matchesMentorshipTopics &&
            !matchesIndustry
          ) {
            return false;
          }
        }

        // 2. Department Filter
        if (selectedDept !== "all") {
          if (!st.department.toLowerCase().includes(selectedDept.toLowerCase())) {
            return false;
          }
        }

        // 3. Academic Year Filter
        if (selectedYear !== "all") {
          if (!st.academicYear.toLowerCase().includes(selectedYear.toLowerCase())) {
            return false;
          }
        }

        // 4. Career Interest / Desired Job Role Filter
        if (selectedCareer !== "all") {
          const stGoal = (st.careerGoal || "").toLowerCase();
          const selected = selectedCareer.toLowerCase();
          if (!stGoal.includes(selected)) {
            return false;
          }
        }

        // 5. Technical Skill Filter
        if (selectedSkill !== "all") {
          const hasSkill = st.skills.some((s) => {
            const skillName = typeof s === "string" ? s : s.name;
            return skillName.toLowerCase() === selectedSkill.toLowerCase();
          });
          if (!hasSkill) return false;
        }

        // 6. Preferred Industry Filter
        if (selectedIndustry !== "all") {
          const matchesPrimary = (st.preferredIndustry || "")
            .toLowerCase()
            .includes(selectedIndustry.toLowerCase());
          const matchesArray = (st.preferredIndustries || []).some((ind) =>
            ind.toLowerCase().includes(selectedIndustry.toLowerCase())
          );
          if (!matchesPrimary && !matchesArray) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "year") {
          return a.academicYear.localeCompare(b.academicYear);
        }
        if (sortBy === "skills") {
          return b.skills.length - a.skills.length;
        }
        return 0;
      });
  }, [
    students,
    search,
    selectedDept,
    selectedYear,
    selectedCareer,
    selectedSkill,
    selectedIndustry,
    sortBy,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedDept !== "all" ||
    selectedYear !== "all" ||
    selectedCareer !== "all" ||
    selectedSkill !== "all" ||
    selectedIndustry !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("all");
    setSelectedYear("all");
    setSelectedCareer("all");
    setSelectedSkill("all");
    setSelectedIndustry("all");
    setSortBy("match");
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Users size={20} className="text-[#0a66c2]" />
                <span>Discover Students</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded-full border border-[#bfe3c9]">
                <ShieldCheck size={11} /> Verified University Directory
              </span>
              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Demo Directory Mode
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Find motivated undergraduate and graduate students seeking professional mentorship in software engineering, systems architecture, product management, and machine learning.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-md p-0.5 bg-gray-50">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-[#0a66c2] shadow-2xs font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table List View"
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-[#0a66c2] shadow-2xs font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List size={14} />
              </button>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              Showing <strong className="text-gray-900">{filteredStudents.length}</strong> of {students.length} students
            </div>
          </div>
        </div>

        {/* ─── 1. SEARCH FIELD ──────────────────────────────────────────────── */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, technical skills (e.g. Go, Python), department, career interests, or desired role..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── 2. FILTERS (Department, Year, Career, Skills, Industry) ─────── */}
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Filter 1: Department */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Academic Year */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Academic Years</option>
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr.value} value={yr.value}>
                  {yr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Career Interest */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Career Goal
            </label>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Career Goals</option>
              {CAREER_INTERESTS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Technical Skills */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Technical Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Technical Skills</option>
              {TECHNICAL_SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 5: Preferred Industry */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Industry Focus
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Industries</option>
              {PREFERRED_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Sort Results
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "name" | "year" | "skills")}
              className="w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="match">Domain Match %</option>
              <option value="name">Name (A–Z)</option>
              <option value="year">Academic Year</option>
              <option value="skills">Most Skills Listed</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags & Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal size={11} /> Active Filters:
              </span>

              {search && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-[#0a66c2] px-2 py-0.5 rounded border border-blue-100">
                  Search: &ldquo;{search}&rdquo;
                  <button type="button" onClick={() => setSearch("")} className="hover:text-blue-900">
                    <X size={10} />
                  </button>
                </span>
              )}

              {selectedDept !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  Dept: {selectedDept}
                  <button type="button" onClick={() => setSelectedDept("all")} className="hover:text-black">
                    <X size={10} />
                  </button>
                </span>
              )}

              {selectedYear !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  Year: {selectedYear}
                  <button type="button" onClick={() => setSelectedYear("all")} className="hover:text-black">
                    <X size={10} />
                  </button>
                </span>
              )}

              {selectedCareer !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  Goal: {selectedCareer}
                  <button type="button" onClick={() => setSelectedCareer("all")} className="hover:text-black">
                    <X size={10} />
                  </button>
                </span>
              )}

              {selectedSkill !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  Skill: {selectedSkill}
                  <button type="button" onClick={() => setSelectedSkill("all")} className="hover:text-black">
                    <X size={10} />
                  </button>
                </span>
              )}

              {selectedIndustry !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                  Industry: {selectedIndustry}
                  <button type="button" onClick={() => setSelectedIndustry("all")} className="hover:text-black">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="text-[#0a66c2] hover:underline flex items-center gap-1 font-semibold text-xs"
            >
              <RotateCcw size={12} />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. STUDENT RESULTS (Compact Cards or Table) ─────────────────── */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Users size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No students match your filter criteria</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try broadening your search term, clearing target skills, or removing department restrictions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((st) => {
            const hasPending =
              st.hasPendingRequest ||
              mentorshipActivity.pendingRequests.some(
                (r) => (r.studentId === st.id || r.student?.id === st.id) && r.status === "pending"
              );
            const isMentee =
              st.isMentee ||
              mentorshipActivity.acceptedMentorships.some(
                (m) => m.studentId === st.id || m.student?.id === st.id
              );

            return (
              <div
                key={st.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-[#b2d5f8] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Avatar, Name, University, Academic Year, Match Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={st.name} size="md" className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-gray-900 truncate">{st.name}</h3>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded shrink-0">
                            {st.academicYear.split(" ")[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 truncate mt-0.5">
                          {st.university}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{st.department}</p>
                      </div>
                    </div>

                    {st.matchScore && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8] shrink-0">
                        {st.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {/* Career Goal */}
                  <div className="mt-3 bg-gray-50 rounded-md p-2.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-900 font-semibold">
                      <Target size={12} className="text-[#0a66c2] shrink-0" />
                      <span className="truncate">Aspires to be: {st.careerGoal}</span>
                    </div>

                    {/* Short Introduction */}
                    {st.bio && (
                      <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {st.bio}
                      </p>
                    )}
                  </div>

                  {/* Relevant Technical Skills */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Technical Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {st.skills.slice(0, 4).map((sk) => {
                        const skName = typeof sk === "string" ? sk : sk.name;
                        return (
                          <span
                            key={skName}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 font-medium"
                          >
                            {skName}
                          </span>
                        );
                      })}
                      {st.skills.length > 4 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{st.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Industry or Mentorship Focus */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-50">
                    <span className="flex items-center gap-1 truncate max-w-[170px]">
                      <Briefcase size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{st.preferredIndustry || "Cloud & SaaS"}</span>
                    </span>
                    {st.gpa && st.education?.isGpaPublic !== false && (
                      <span className="font-semibold text-gray-700 shrink-0">
                        GPA: {st.gpa.split(" ")[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons: View Profile + Connect / Invite */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudentForDetail(st)}
                      className="text-xs text-gray-700 hover:text-[#0a66c2] hover:bg-blue-50 px-2 h-7"
                    >
                      <Eye size={12} className="mr-1" />
                      <span>Quick View</span>
                    </Button>
                    <Link
                      href={`/alumni-dashboard/students/${st.id}`}
                      className="text-xs font-semibold text-[#0a66c2] hover:underline"
                    >
                      Full Profile
                    </Link>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={hasPending || isMentee}
                    onClick={() => setSelectedStudentForOffer(st)}
                    className="text-xs bg-[#0a66c2] hover:bg-[#004182] h-7 px-2.5 flex items-center gap-1"
                  >
                    <Send size={11} />
                    <span>
                      {isMentee
                        ? "Active Mentee"
                        : hasPending
                        ? "Pending"
                        : "Invite to Mentorship"}
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Student</th>
                  <th className="py-3 px-4 font-bold">University &amp; Year</th>
                  <th className="py-3 px-4 font-bold">Career Goal</th>
                  <th className="py-3 px-4 font-bold">Technical Skills</th>
                  <th className="py-3 px-4 font-bold">Match</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((st) => {
                  const hasPending =
                    st.hasPendingRequest ||
                    mentorshipActivity.pendingRequests.some(
                      (r) => (r.studentId === st.id || r.student?.id === st.id) && r.status === "pending"
                    );
                  const isMentee =
                    st.isMentee ||
                    mentorshipActivity.acceptedMentorships.some(
                      (m) => m.studentId === st.id || m.student?.id === st.id
                    );

                  return (
                    <tr key={st.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={st.name} size="sm" />
                          <div className="min-w-0">
                            <Link
                              href={`/alumni-dashboard/students/${st.id}`}
                              className="font-bold text-gray-900 hover:text-[#0a66c2] hover:underline truncate block"
                            >
                              {st.name}
                            </Link>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {st.preferredIndustry || "Cloud & SaaS"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800 block truncate">{st.university}</span>
                        <span className="text-[11px] text-gray-500 block">
                          {st.academicYear} · {st.department}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block truncate">{st.careerGoal}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{st.bio}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {st.skills.slice(0, 3).map((sk) => {
                            const skName = typeof sk === "string" ? sk : sk.name;
                            return (
                              <span
                                key={skName}
                                className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded"
                              >
                                {skName}
                              </span>
                            );
                          })}
                          {st.skills.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{st.skills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {st.matchScore ? (
                          <span className="text-[10px] font-bold text-[#057642] bg-[#eef8f1] border border-[#bfe3c9] px-2 py-0.5 rounded">
                            {st.matchScore}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStudentForDetail(st)}
                            className="text-xs h-7 px-2 text-gray-600 hover:text-[#0a66c2]"
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={hasPending || isMentee}
                            onClick={() => setSelectedStudentForOffer(st)}
                            className="text-xs bg-[#0a66c2] hover:bg-[#004182] h-7 px-2.5"
                          >
                            {isMentee ? "Mentee" : hasPending ? "Pending" : "Invite"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODALS ───────────────────────────────────────────────────────── */}

      {/* Student Detail Modal (for Quick View) */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onOfferMentorship={(st) => setSelectedStudentForOffer(st)}
      />

      {/* Offer Mentorship Modal (for Personalized Invitations) */}
      <OfferMentorshipModal
        student={selectedStudentForOffer}
        isOpen={Boolean(selectedStudentForOffer)}
        onClose={() => setSelectedStudentForOffer(null)}
        onSuccess={(name) =>
          showToast(`Mentorship invitation dispatched to ${name}! Track it under Mentorship Requests.`)
        }
      />
    </div>
  );
}

export default function DiscoverStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading student directory...
        </div>
      }
    >
      <DiscoverStudentsContent />
    </Suspense>
  );
}
