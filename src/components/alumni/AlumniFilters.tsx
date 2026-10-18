"use client";

import { useState } from "react";
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface AlumniFilterState {
  searchQuery: string;
  role: string;
  company: string;
  industry: string;
  skill: string;
  experienceRange: string;
  graduationYearRange: string;
  availability: string;
  sortBy: string;
}

export const initialFilterState: AlumniFilterState = {
  searchQuery: "",
  role: "all",
  company: "all",
  industry: "all",
  skill: "all",
  experienceRange: "all",
  graduationYearRange: "all",
  availability: "all",
  sortBy: "recommended",
};

interface AlumniFiltersProps {
  filters: AlumniFilterState;
  onFilterChange: <K extends keyof AlumniFilterState>(key: K, value: AlumniFilterState[K]) => void;
  onResetFilters: () => void;
  roles: string[];
  companies: string[];
  industries: string[];
  skills: string[];
  totalResults: number;
  totalAlumniCount: number;
}

export function AlumniFilters({
  filters,
  onFilterChange,
  onResetFilters,
  roles,
  companies,
  industries,
  skills,
  totalResults,
  totalAlumniCount,
}: AlumniFiltersProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Compute active filter tags
  const activeFilters: { key: keyof AlumniFilterState; label: string; value: string }[] = [];

  if (filters.searchQuery) {
    activeFilters.push({
      key: "searchQuery",
      label: "Search",
      value: `"${filters.searchQuery}"`,
    });
  }
  if (filters.role !== "all") {
    activeFilters.push({ key: "role", label: "Role", value: filters.role });
  }
  if (filters.company !== "all") {
    activeFilters.push({ key: "company", label: "Company", value: filters.company });
  }
  if (filters.industry !== "all") {
    activeFilters.push({ key: "industry", label: "Industry", value: filters.industry });
  }
  if (filters.skill !== "all") {
    activeFilters.push({ key: "skill", label: "Skill", value: filters.skill });
  }
  if (filters.experienceRange !== "all") {
    const expLabels: Record<string, string> = {
      "1-3": "1–3 years exp",
      "4-6": "4–6 years exp",
      "7+": "7+ years exp",
    };
    activeFilters.push({
      key: "experienceRange",
      label: "Experience",
      value: expLabels[filters.experienceRange] || filters.experienceRange,
    });
  }
  if (filters.graduationYearRange !== "all") {
    const gradLabels: Record<string, string> = {
      "2021-2024": "Graduated 2021–2024",
      "2018-2020": "Graduated 2018–2020",
      "before-2018": "Graduated Before 2018",
    };
    activeFilters.push({
      key: "graduationYearRange",
      label: "Class Year",
      value: gradLabels[filters.graduationYearRange] || filters.graduationYearRange,
    });
  }
  if (filters.availability !== "all") {
    const availLabels: Record<string, string> = {
      available: "Available for Mentorship",
      limited: "Limited Spots",
      unavailable: "Not Accepting Mentees",
    };
    activeFilters.push({
      key: "availability",
      label: "Status",
      value: availLabels[filters.availability] || filters.availability,
    });
  }

  const activeCount = activeFilters.length;

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Prominent Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange("searchQuery", e.target.value)}
              placeholder="Search by name, role, company, or skill..."
              className="w-full pl-9 pr-9 py-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition-colors"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange("searchQuery", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange("sortBy", e.target.value)}
              aria-label="Sort alumni"
              className="bg-white border border-gray-300 text-xs text-gray-800 font-medium rounded-md px-3 py-2 h-9 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] cursor-pointer"
            >
              <option value="recommended">Recommended (Demo Match)</option>
              <option value="relevant">Most Relevant</option>
              <option value="experienced">Most Experienced</option>
              <option value="recent">Recently Active</option>
            </select>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-[#0a66c2] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls Row (Desktop) */}
        <div className="hidden lg:grid grid-cols-7 gap-2.5 pt-3 border-t border-gray-100">
          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Job Role</label>
            <select
              value={filters.role}
              onChange={(e) => onFilterChange("role", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Company</label>
            <select
              value={filters.company}
              onChange={(e) => onFilterChange("company", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => onFilterChange("industry", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Technical Skill</label>
            <select
              value={filters.skill}
              onChange={(e) => onFilterChange("skill", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Skills</option>
              {skills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Experience</label>
            <select
              value={filters.experienceRange}
              onChange={(e) => onFilterChange("experienceRange", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Any Experience</option>
              <option value="1-3">1–3 years</option>
              <option value="4-6">4–6 years</option>
              <option value="7+">7+ years</option>
            </select>
          </div>

          {/* Graduation Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Graduation</label>
            <select
              value={filters.graduationYearRange}
              onChange={(e) => onFilterChange("graduationYearRange", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Any Year</option>
              <option value="2021-2024">2021–2024 (Recent)</option>
              <option value="2018-2020">2018–2020</option>
              <option value="before-2018">Before 2018</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => onFilterChange("availability", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md text-xs text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="limited">Limited Spots</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Mobile Collapsible Filter Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => onFilterChange("role", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">All Roles</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                <select
                  value={filters.company}
                  onChange={(e) => onFilterChange("company", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">All Companies</option>
                  {companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => onFilterChange("industry", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Technical Skill</label>
                <select
                  value={filters.skill}
                  onChange={(e) => onFilterChange("skill", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">All Skills</option>
                  {skills.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Experience</label>
                <select
                  value={filters.experienceRange}
                  onChange={(e) => onFilterChange("experienceRange", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">Any Experience</option>
                  <option value="1-3">1–3 years</option>
                  <option value="4-6">4–6 years</option>
                  <option value="7+">7+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Graduation Year</label>
                <select
                  value={filters.graduationYearRange}
                  onChange={(e) => onFilterChange("graduationYearRange", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">Any Year</option>
                  <option value="2021-2024">2021–2024 (Recent)</option>
                  <option value="2018-2020">2018–2020</option>
                  <option value="before-2018">Before 2018</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mentorship Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => onFilterChange("availability", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-800 px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="limited">Limited Spots</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-xs text-gray-600"
              >
                Clear all filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Chips & Result Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-700">
            Showing {totalResults} of {totalAlumniCount} alumni
          </span>

          {activeCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">Active filters:</span>
              {activeFilters.map((af) => (
                <span
                  key={af.key}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ebf3fb] text-[#004182] border border-[#b2d5f8] text-[11px] font-medium"
                >
                  <span className="text-[#0a66c2] font-normal">{af.label}:</span>
                  <span className="font-semibold">{af.value}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (af.key === "searchQuery") {
                        onFilterChange("searchQuery", "");
                      } else {
                        onFilterChange(af.key, "all");
                      }
                    }}
                    className="p-0.5 hover:text-[#004182] rounded-full hover:bg-[#d0e2f5] transition-colors"
                    aria-label={`Remove filter ${af.label}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors ml-1"
              >
                <RotateCcw size={11} />
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Demo score notice */}
        <p className="text-[11px] text-gray-600 hidden md:block">
          * Recommendation scores &amp; matches are illustrative demo calculations based on student profile.
        </p>
      </div>
    </div>
  );
}
