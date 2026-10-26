"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Users, FilterX, Check, RotateCcw } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import {
  AlumniFilters,
  type AlumniFilterState,
  initialFilterState,
} from "@/components/alumni/AlumniFilters";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { alumniData, currentStudent } from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadAllAlumni,
} from "@/lib/dashboard-storage";

export default function AlumniDiscoveryPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const allAlumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAllAlumni,
    () => alumniData
  );

  const [filters, setFilters] = useState<AlumniFilterState>(initialFilterState);

  const handleFilterChange = <K extends keyof AlumniFilterState>(
    key: K,
    value: AlumniFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  // Distinct roles, companies, and departments dynamically derived from all alumni
  const roles = useMemo(
    () =>
      Array.from(new Set(allAlumni.map((a) => a.role?.trim()).filter(Boolean) as string[])).sort(),
    [allAlumni]
  );
  const companies = useMemo(
    () =>
      Array.from(new Set(allAlumni.map((a) => a.company?.trim()).filter(Boolean) as string[])).sort(),
    [allAlumni]
  );
  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          allAlumni
            .map((a) => a.department?.trim() || a.education?.[0]?.field?.trim())
            .filter(Boolean) as string[]
        )
      ).sort(),
    [allAlumni]
  );

  // Filter alumni
  const filteredAlumni = useMemo(() => {
    return allAlumni.filter((alumnus) => {
      // 1. Search query (matches name, role, company, department, industry, skills)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = alumnus.name?.toLowerCase().includes(q) ?? false;
        const matchesRole = alumnus.role?.toLowerCase().includes(q) ?? false;
        const matchesCompany = alumnus.company?.toLowerCase().includes(q) ?? false;
        const matchesDept =
          (alumnus.department?.toLowerCase().includes(q) ||
            alumnus.education?.[0]?.field?.toLowerCase().includes(q)) ??
          false;
        const matchesIndustry = alumnus.industry?.toLowerCase().includes(q) ?? false;
        const matchesSkill = alumnus.skills?.some((s) =>
          s.name?.toLowerCase().includes(q)
        ) ?? false;

        if (!matchesName && !matchesRole && !matchesCompany && !matchesDept && !matchesIndustry && !matchesSkill) {
          return false;
        }
      }

      // 2. Category Chip
      if (filters.category !== "All") {
        if (filters.category === "Cloud & Infra" && !alumnus.role.includes("Backend") && !alumnus.role.includes("Infrastructure") && !alumnus.role.includes("Engineer")) {
          return false;
        }
        if (filters.category === "Frontend & Design" && !alumnus.role.includes("Frontend") && !alumnus.role.includes("Design") && !alumnus.role.includes("Software")) {
          return false;
        }
        if (filters.category === "Product" && !alumnus.role.includes("Product")) {
          return false;
        }
        if (filters.category === "AI & ML" && !alumnus.role.includes("AI") && !alumnus.role.includes("Data") && !alumnus.role.includes("Scientist")) {
          return false;
        }
        if (filters.category === "Finance" && !alumnus.industry?.includes("FinTech") && !alumnus.industry?.includes("Venture")) {
          return false;
        }
      }

      // 3. Left sidebar role filter
      if (filters.role !== "all" && alumnus.role !== filters.role) {
        return false;
      }

      // 4. Left sidebar company filter
      if (filters.company !== "all" && alumnus.company !== filters.company) {
        return false;
      }

      // 5. Left sidebar department filter
      if (filters.department !== "all") {
        const dept = alumnus.department || alumnus.education?.[0]?.field;
        if (dept !== filters.department) {
          return false;
        }
      }

      // 6. Graduation year filter
      if (filters.graduationYearRange !== "all") {
        const gy = alumnus.graduationYear;
        if (filters.graduationYearRange === "2021-2024" && (gy < 2021 || gy > 2024)) return false;
        if (filters.graduationYearRange === "2018-2020" && (gy < 2018 || gy > 2020)) return false;
        if (filters.graduationYearRange === "before-2018" && gy >= 2018) return false;
      }

      return true;
    });
  }, [allAlumni, filters]);

  // Sort
  const sortedAlumni = useMemo(() => {
    const list = [...filteredAlumni];
    switch (filters.sortBy) {
      case "recommended":
        return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      case "relevant":
        return list.sort((a, b) => {
          const aOverlap = a.skills.filter((as) =>
            student.skills.some((ss) => ss.name.toLowerCase() === as.name.toLowerCase())
          ).length;
          const bOverlap = b.skills.filter((bs) =>
            student.skills.some((ss) => ss.name.toLowerCase() === bs.name.toLowerCase())
          ).length;
          return bOverlap - aOverlap;
        });
      case "experienced":
        return list.sort((a, b) => (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0));
      case "recent":
        return list.sort((a, b) => {
          const aActive = a.lastActive?.includes("today") ? 3 : a.lastActive?.includes("week") ? 2 : 1;
          const bActive = b.lastActive?.includes("today") ? 3 : b.lastActive?.includes("week") ? 2 : 1;
          return bActive - aActive;
        });
      default:
        return list;
    }
  }, [filteredAlumni, filters.sortBy, student.skills]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
      {/* App Sidebar (Desktop) */}
      <AppSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="relative w-64 h-full bg-white">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Explore verified alumni"
          subtitle="Direct access to university alumni across Tier-1 engineering, product, and design organizations."
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Top Search & Category Chips */}
          <AlumniFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            roles={roles}
            companies={companies}
            departments={departments}
            totalResults={sortedAlumni.length}
            totalAlumniCount={allAlumni.length}
          />

          {/* Directory Body: Left Filter Sidebar + Right 3-Column Card Grid */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Filter Sidebar (Matching Reference 4) */}
            <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E7E7E7] rounded-2xl p-5 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                  Filters
                </span>
                {(filters.role !== "all" || filters.company !== "all" || filters.department !== "all" || filters.graduationYearRange !== "all") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] text-[#737373] hover:text-[#090909] font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Department Section */}
              {departments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#090909]">Department ({departments.length})</p>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => handleFilterChange("department", "all")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        filters.department === "all"
                          ? "bg-[#090909] text-white"
                          : "text-[#555555] hover:bg-[#F4F4F4]"
                      }`}
                    >
                      <span>All Departments</span>
                      {filters.department === "all" && <Check size={12} />}
                    </button>
                    {departments.map((d) => {
                      const isSelected = filters.department === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleFilterChange("department", isSelected ? "all" : d)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors truncate ${
                            isSelected
                              ? "bg-[#090909] text-white"
                              : "text-[#555555] hover:bg-[#F4F4F4]"
                          }`}
                        >
                          <span className="truncate">{d}</span>
                          {isSelected && <Check size={12} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Roles Section */}
              <div className="space-y-2 pt-2 border-t border-[#E7E7E7]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#090909]">Role ({roles.length})</p>
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => handleFilterChange("role", "all")}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      filters.role === "all"
                        ? "bg-[#090909] text-white"
                        : "text-[#555555] hover:bg-[#F4F4F4]"
                    }`}
                  >
                    <span>All Roles</span>
                    {filters.role === "all" && <Check size={12} />}
                  </button>
                  {roles.map((r) => {
                    const isSelected = filters.role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleFilterChange("role", isSelected ? "all" : r)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors truncate ${
                          isSelected
                            ? "bg-[#090909] text-white"
                            : "text-[#555555] hover:bg-[#F4F4F4]"
                        }`}
                      >
                        <span className="truncate">{r}</span>
                        {isSelected && <Check size={12} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company Section */}
              <div className="space-y-2 pt-2 border-t border-[#E7E7E7]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#090909]">Company ({companies.length})</p>
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => handleFilterChange("company", "all")}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      filters.company === "all"
                        ? "bg-[#090909] text-white"
                        : "text-[#555555] hover:bg-[#F4F4F4]"
                    }`}
                  >
                    <span>All Companies</span>
                    {filters.company === "all" && <Check size={12} />}
                  </button>
                  {companies.map((c) => {
                    const isSelected = filters.company === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleFilterChange("company", isSelected ? "all" : c)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors truncate ${
                          isSelected
                            ? "bg-[#090909] text-white"
                            : "text-[#555555] hover:bg-[#F4F4F4]"
                        }`}
                      >
                        <span className="truncate">{c}</span>
                        {isSelected && <Check size={12} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Graduation Year Section */}
              <div className="space-y-2 pt-2 border-t border-[#E7E7E7]">
                <p className="text-xs font-semibold text-[#090909]">Graduation Year</p>
                <div className="space-y-1">
                  {[
                    { label: "All Years", value: "all" },
                    { label: "2021 – 2024 (Recent)", value: "2021-2024" },
                    { label: "2018 – 2020", value: "2018-2020" },
                    { label: "Before 2018", value: "before-2018" },
                  ].map((gy) => {
                    const isSelected = filters.graduationYearRange === gy.value;
                    return (
                      <button
                        key={gy.value}
                        type="button"
                        onClick={() => handleFilterChange("graduationYearRange", gy.value)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[#090909] text-white"
                            : "text-[#555555] hover:bg-[#F4F4F4]"
                        }`}
                      >
                        <span>{gy.label}</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Right: Alumni Cards Grid (3 Columns) */}
            <div className="lg:col-span-9">
              {sortedAlumni.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedAlumni.map((alumnus) => (
                    <AlumniCard key={alumnus.id} alumni={alumnus} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FilterX size={24} />}
                  title="No alumni found matching criteria"
                  description="We couldn't find any alumni matching your active search query and filter combination. Try clearing your filters."
                  actionLabel="Clear All Filters"
                  onAction={handleResetFilters}
                  className="py-16 bg-white border border-[#E7E7E7] rounded-2xl"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
