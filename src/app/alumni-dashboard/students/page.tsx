"use client";

import { useState, useMemo, useSyncExternalStore, Suspense } from "react";
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
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadStudentsList,
} from "@/lib/dashboard-storage";
import { studentsData } from "@/lib/mock-data";
import { OfferMentorshipModal } from "@/components/alumni-dashboard/OfferMentorshipModal";
import { StudentDetailModal } from "@/components/alumni-dashboard/StudentDetailModal";
import type { DiscoverStudent } from "@/types";

function DiscoverStudentsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const students = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentsList,
    () => studentsData
  );

  const [search, setSearch] = useState(initialQuery);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"match" | "name" | "year">("match");

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<DiscoverStudent | null>(null);
  const [selectedStudentForOffer, setSelectedStudentForOffer] = useState<DiscoverStudent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    return students
      .filter((st) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = st.name.toLowerCase().includes(q);
          const matchesGoal = (st.careerGoal || "").toLowerCase().includes(q);
          const matchesDept = (st.department || "").toLowerCase().includes(q);
          const matchesSkills = st.skills.some((s) => {
            const skillName = typeof s === "string" ? s : s.name;
            return skillName.toLowerCase().includes(q);
          });
          const matchesTopics = st.seekingMentorshipIn?.some((t) =>
            t.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesGoal && !matchesDept && !matchesSkills && !matchesTopics) {
            return false;
          }
        }

        // Year filter
        if (selectedYear !== "all") {
          if (!st.academicYear.toLowerCase().includes(selectedYear.toLowerCase())) {
            return false;
          }
        }

        // Target Role filter
        if (selectedRole !== "all") {
          if (!st.careerGoal.toLowerCase().includes(selectedRole.toLowerCase())) {
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
        return 0;
      });
  }, [students, search, selectedYear, selectedRole, sortBy]);

  const hasActiveFilters = search.trim() !== "" || selectedYear !== "all" || selectedRole !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedYear("all");
    setSelectedRole("all");
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
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users size={20} className="text-[#0a66c2]" />
              <span>Discover Students</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse ambitious students seeking guidance in backend engineering, distributed systems, and technical careers.
            </p>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 shrink-0">
            Showing <strong className="text-gray-900">{filteredStudents.length}</strong> verified students
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or role..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Academic Years</option>
              <option value="sophomore">Sophomore (2nd Year)</option>
              <option value="junior">Junior (3rd Year)</option>
              <option value="senior">Senior (4th Year)</option>
              <option value="graduate">Graduate Student</option>
            </select>
          </div>

          {/* Target Role */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="all">All Career Goals</option>
              <option value="software">Software Engineer</option>
              <option value="product">Product Manager</option>
              <option value="machine learning">AI / Machine Learning</option>
              <option value="devops">DevOps &amp; Cloud</option>
              <option value="security">Security Engineer</option>
              <option value="ui/ux">UI/UX Designer</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "name" | "year")}
              className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="match">Sort by: Highest Match %</option>
              <option value="name">Sort by: Student Name (A-Z)</option>
              <option value="year">Sort by: Academic Year</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Filters applied to student directory</span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#0a66c2] hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw size={11} />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Users size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No students match your search criteria</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your query keywords, removing target role filters, or clearing the academic year selector.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-4 text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-[#b2d5f8] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={st.name} size="md" />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 truncate">{st.name}</h3>
                      <p className="text-[11px] text-gray-500 truncate">
                        {st.academicYear} · {st.department}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{st.university}</p>
                    </div>
                  </div>

                  {st.matchScore && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8] shrink-0">
                      {st.matchScore}% Match
                    </span>
                  )}
                </div>

                {/* Target Role & Bio */}
                <div className="mt-3 bg-gray-50 rounded-md p-2.5 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-900 font-semibold">
                    <Target size={12} className="text-[#0a66c2] shrink-0" />
                    <span className="truncate">Aspires to be: {st.careerGoal}</span>
                  </div>
                  {st.bio && (
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {st.bio}
                    </p>
                  )}
                </div>

                {/* Mentorship Focus Requested */}
                {st.seekingMentorshipIn && st.seekingMentorshipIn.length > 0 && (
                  <div className="mt-2.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Seeking Guidance In:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {st.seekingMentorshipIn.slice(0, 2).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-[#0a66c2] border border-blue-100 font-medium truncate max-w-[190px]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                <div className="mt-2.5">
                  <div className="flex flex-wrap gap-1">
                    {st.skills.slice(0, 4).map((sk) => {
                      const skName = typeof sk === "string" ? sk : sk.name;
                      return (
                        <span
                          key={skName}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600"
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
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentForDetail(st)}
                  className="text-xs text-gray-700 flex items-center gap-1 px-2.5"
                >
                  <Eye size={12} />
                  <span>View Details</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={st.hasPendingRequest}
                  onClick={() => setSelectedStudentForOffer(st)}
                  className="text-xs bg-[#0a66c2] hover:bg-[#004182] flex items-center gap-1.5"
                >
                  <Send size={11} />
                  <span>{st.hasPendingRequest ? "Offer Pending" : "Offer Mentorship"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onOfferMentorship={(st) => setSelectedStudentForOffer(st)}
      />

      {/* Offer Mentorship Modal */}
      <OfferMentorshipModal
        student={selectedStudentForOffer}
        isOpen={Boolean(selectedStudentForOffer)}
        onClose={() => setSelectedStudentForOffer(null)}
        onSuccess={(name) =>
          showToast(`Mentorship offer sent to ${name}! Track it under Mentorship Requests.`)
        }
      />
    </div>
  );
}

export default function DiscoverStudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading student directory...</div>}>
      <DiscoverStudentsContent />
    </Suspense>
  );
}
