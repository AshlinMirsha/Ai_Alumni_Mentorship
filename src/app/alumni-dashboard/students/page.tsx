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
import { cn } from "@/lib/utils";
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#191919] text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. HEADER SECTION ────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9D9D9] rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Heading, Badges & Subtitle */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#191919] tracking-tight">
                Discover Students
              </h1>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#057642] bg-[#EEF8F1] px-2.5 py-0.5 rounded-full border border-[#BFE3C9] whitespace-nowrap">
                  <ShieldCheck size={12} className="shrink-0" />
                  <span>Verified University Directory</span>
                </span>
                <span className="text-[10px] font-medium text-[#666666] bg-[#F3F2EF] px-2 py-0.5 rounded-full border border-[#E0E0E0] whitespace-nowrap">
                  Demo Directory Mode
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#666666] max-w-2xl leading-relaxed">
              Connect with motivated students seeking career guidance, resume feedback, and industry mentorship across software engineering, systems design, and product leadership.
            </p>
          </div>

          {/* Right: Result Count & Grid/List View Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <div className="text-xs font-medium text-[#666666] bg-[#F3F2EF] px-3 py-1.5 rounded-md border border-[#D9D9D9] whitespace-nowrap">
              Showing <strong className="text-[#191919] font-bold">{filteredStudents.length}</strong> of {students.length} students
            </div>

            <div className="flex items-center border border-[#D9D9D9] rounded-md p-0.5 bg-[#F3F2EF]" role="group" aria-label="View mode">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-[#0A66C2] shadow-2xs font-semibold"
                    : "text-[#666666] hover:text-[#191919]"
                )}
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="List view"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors",
                  viewMode === "table"
                    ? "bg-white text-[#0A66C2] shadow-2xs font-semibold"
                    : "text-[#666666] hover:text-[#191919]"
                )}
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. SEARCH & FILTERS SECTION ──────────────────────────────── */}
      <div className="bg-white border border-[#D9D9D9] rounded-lg p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, technical skills (e.g. Go, Python, React), department, career interests, or desired role..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#D9D9D9] rounded-md text-[#191919] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Filter 1: Department */}
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#D9D9D9] rounded-md text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors truncate cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#D9D9D9] rounded-md text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors truncate cursor-pointer"
            >
              <option value="all">All Academic Years</option>
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr.value} value={yr.value}>
                  {yr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Career Goal */}
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
              Career Goal
            </label>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#D9D9D9] rounded-md text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors truncate cursor-pointer"
            >
              <option value="all">All Career Goals</option>
              {CAREER_INTERESTS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Technical Skill */}
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
              Technical Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#D9D9D9] rounded-md text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors truncate cursor-pointer"
            >
              <option value="all">All Technical Skills</option>
              {TECHNICAL_SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 5: Industry Focus */}
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
              Industry Focus
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#D9D9D9] rounded-md text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors truncate cursor-pointer"
            >
              <option value="all">All Industries</option>
              {PREFERRED_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 6: Sort Results */}
          <div>
            <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
              Sort Results
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "name" | "year" | "skills")}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#D9D9D9] rounded-md text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors cursor-pointer"
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
          <div className="pt-3 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#666666] mr-1 flex items-center gap-1">
                <SlidersHorizontal size={12} /> Active:
              </span>

              {search && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#EBF3FB] text-[#0A66C2] px-2 py-0.5 rounded border border-[#B2D5F8]">
                  Search: &ldquo;{search}&rdquo;
                  <button type="button" onClick={() => setSearch("")} className="hover:text-blue-900 ml-0.5" title="Remove search filter">
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedDept !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#F3F2EF] text-[#191919] px-2 py-0.5 rounded border border-[#D9D9D9]">
                  Dept: {selectedDept}
                  <button type="button" onClick={() => setSelectedDept("all")} className="hover:text-black ml-0.5" title="Remove department filter">
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedYear !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#F3F2EF] text-[#191919] px-2 py-0.5 rounded border border-[#D9D9D9]">
                  Year: {ACADEMIC_YEARS.find((y) => y.value === selectedYear)?.label || selectedYear}
                  <button type="button" onClick={() => setSelectedYear("all")} className="hover:text-black ml-0.5" title="Remove year filter">
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedCareer !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#F3F2EF] text-[#191919] px-2 py-0.5 rounded border border-[#D9D9D9]">
                  Goal: {selectedCareer}
                  <button type="button" onClick={() => setSelectedCareer("all")} className="hover:text-black ml-0.5" title="Remove career goal filter">
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedSkill !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#F3F2EF] text-[#191919] px-2 py-0.5 rounded border border-[#D9D9D9]">
                  Skill: {selectedSkill}
                  <button type="button" onClick={() => setSelectedSkill("all")} className="hover:text-black ml-0.5" title="Remove skill filter">
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedIndustry !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#F3F2EF] text-[#191919] px-2 py-0.5 rounded border border-[#D9D9D9]">
                  Industry: {selectedIndustry}
                  <button type="button" onClick={() => setSelectedIndustry("all")} className="hover:text-black ml-0.5" title="Remove industry filter">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="text-[#0A66C2] hover:underline flex items-center gap-1 font-semibold text-xs ml-auto"
            >
              <RotateCcw size={12} />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. STUDENT RESULTS (Grid Cards or Table) ─────────────────── */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border border-[#D9D9D9] rounded-lg p-12 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-[#F3F2EF] text-[#666666] flex items-center justify-center mx-auto mb-3">
            <Users size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#191919]">No students match your filter criteria</h3>
          <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto leading-relaxed">
            Try broadening your search term, selecting different technical skills, or clearing the academic year or department filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-4 text-xs border-[#D9D9D9] text-[#191919] hover:bg-[#F3F2EF]"
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW - 3 columns on large desktop, 2 on medium, 1 on mobile */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="bg-white border border-[#D9D9D9] hover:border-[#0A66C2]/40 rounded-lg p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                {/* Upper Information Area */}
                <div className="space-y-4">
                  {/* Card Header: Avatar, Name, University, Academic Year, Match Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar name={st.name} size="md" className="shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/alumni-dashboard/students/${st.id}`}
                            className="text-sm font-bold text-[#191919] hover:text-[#0A66C2] hover:underline truncate"
                          >
                            {st.name}
                          </Link>
                          <span className="text-[10px] font-medium text-[#666666] bg-[#F3F2EF] px-2 py-0.5 rounded-full border border-[#E0E0E0] shrink-0">
                            {st.academicYear}
                          </span>
                        </div>
                        <p className="text-xs text-[#444444] font-medium truncate mt-0.5">
                          {st.university}
                        </p>
                        <p className="text-[11px] text-[#666666] truncate">{st.department}</p>
                      </div>
                    </div>

                    {st.matchScore && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EEF8F1] text-[#057642] border border-[#BFE3C9] shrink-0 flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck size={11} className="shrink-0" />
                        <span>{st.matchScore}% Match</span>
                      </span>
                    )}
                  </div>

                  {/* Career Goal & Introduction */}
                  <div className="bg-[#F8FAFC] rounded-md p-3 border border-[#EAEAEA] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#191919] font-semibold">
                      <Target size={13} className="text-[#0A66C2] shrink-0" />
                      <span className="truncate">Aspires to be: {st.careerGoal}</span>
                    </div>

                    {st.bio && (
                      <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                        {st.bio}
                      </p>
                    )}
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] block mb-1.5">
                      Technical Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {st.skills.slice(0, 4).map((sk) => {
                        const skName = typeof sk === "string" ? sk : sk.name;
                        return (
                          <span
                            key={skName}
                            className="px-2 py-0.5 text-[11px] rounded bg-[#F3F2EF] text-[#191919] font-medium border border-[#E0E0E0]"
                          >
                            {skName}
                          </span>
                        );
                      })}
                      {st.skills.length > 4 && (
                        <span className="text-[11px] text-[#666666] self-center pl-1 font-medium">
                          +{st.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Industry or Mentorship Focus & GPA */}
                  <div className="flex items-center justify-between text-xs text-[#666666] pt-2 border-t border-[#EAEAEA]">
                    <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Briefcase size={12} className="text-[#666666] shrink-0" />
                      <span className="truncate font-medium">{st.preferredIndustry || "Cloud & SaaS"}</span>
                    </span>
                    {st.gpa && st.education?.isGpaPublic !== false && (
                      <span className="font-semibold text-[#191919] shrink-0 bg-[#F3F2EF] px-2 py-0.5 rounded text-[11px] border border-[#E0E0E0]">
                        GPA: {st.gpa.split(" ")[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons: Quick View, Full Profile, Invite to Mentorship */}
                <div className="mt-5 pt-3.5 border-t border-[#EAEAEA] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDetail(st)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#191919] hover:text-[#0A66C2] hover:bg-[#F3F2EF] px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      <Eye size={13} className="text-[#666666]" />
                      <span>Quick View</span>
                    </button>
                    <Link
                      href={`/alumni-dashboard/students/${st.id}`}
                      className="text-xs font-semibold text-[#0A66C2] hover:underline px-1 py-1"
                    >
                      Full Profile
                    </Link>
                  </div>

                  <button
                    type="button"
                    disabled={hasPending || isMentee}
                    onClick={() => setSelectedStudentForOffer(st)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap",
                      isMentee
                        ? "bg-[#EEF8F1] text-[#057642] border border-[#BFE3C9] cursor-default"
                        : hasPending
                        ? "bg-[#F3F2EF] text-[#666666] border border-[#D9D9D9] cursor-default"
                        : "bg-[#0A66C2] hover:bg-[#004182] text-white shadow-2xs"
                    )}
                  >
                    <Send size={12} className={isMentee || hasPending ? "text-current" : "text-white"} />
                    <span>
                      {isMentee
                        ? "Active Mentee"
                        : hasPending
                        ? "Invitation Sent"
                        : "Invite to Mentorship"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white border border-[#D9D9D9] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3F2EF] border-b border-[#D9D9D9] text-[#666666] uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-bold">Student</th>
                  <th className="py-3.5 px-4 font-bold">University &amp; Year</th>
                  <th className="py-3.5 px-4 font-bold">Career Goal</th>
                  <th className="py-3.5 px-4 font-bold">Technical Skills</th>
                  <th className="py-3.5 px-4 font-bold">Match</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
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
                    <tr key={st.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={st.name} size="sm" />
                          <div className="min-w-0">
                            <Link
                              href={`/alumni-dashboard/students/${st.id}`}
                              className="font-bold text-[#191919] hover:text-[#0A66C2] hover:underline truncate block"
                            >
                              {st.name}
                            </Link>
                            <span className="text-[11px] text-[#666666] block truncate">
                              {st.preferredIndustry || "Cloud & SaaS"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#191919] block truncate">{st.university}</span>
                        <span className="text-[11px] text-[#666666] block">
                          {st.academicYear} · {st.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#191919] block truncate">{st.careerGoal}</span>
                        <span className="text-[11px] text-[#666666] line-clamp-1">{st.bio}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {st.skills.slice(0, 3).map((sk) => {
                            const skName = typeof sk === "string" ? sk : sk.name;
                            return (
                              <span
                                key={skName}
                                className="text-[11px] bg-[#F3F2EF] text-[#191919] px-2 py-0.5 rounded border border-[#E0E0E0] font-medium"
                              >
                                {skName}
                              </span>
                            );
                          })}
                          {st.skills.length > 3 && (
                            <span className="text-[11px] text-[#666666] font-medium">+{st.skills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {st.matchScore ? (
                          <span className="text-[11px] font-bold text-[#057642] bg-[#EEF8F1] border border-[#BFE3C9] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck size={11} className="shrink-0" />
                            <span>{st.matchScore}%</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#666666]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetail(st)}
                            className="text-xs h-7 px-2.5 rounded text-[#191919] hover:text-[#0A66C2] hover:bg-[#F3F2EF] font-medium transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            disabled={hasPending || isMentee}
                            onClick={() => setSelectedStudentForOffer(st)}
                            className={cn(
                              "text-xs h-7 px-2.5 rounded font-semibold transition-colors whitespace-nowrap",
                              isMentee
                                ? "bg-[#EEF8F1] text-[#057642] border border-[#BFE3C9] cursor-default"
                                : hasPending
                                ? "bg-[#F3F2EF] text-[#666666] border border-[#D9D9D9] cursor-default"
                                : "bg-[#0A66C2] hover:bg-[#004182] text-white shadow-2xs"
                            )}
                          >
                            {isMentee ? "Mentee" : hasPending ? "Sent" : "Invite"}
                          </button>
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
