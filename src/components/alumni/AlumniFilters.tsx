"use client";

import { Search, X, RotateCcw } from "lucide-react";

export interface AlumniFilterState {
  searchQuery: string;
  category: string;
  role: string;
  company: string;
  department: string;
  industry: string;
  skill: string;
  experienceRange: string;
  graduationYearRange: string;
  availability: string;
  sortBy: string;
}

export const initialFilterState: AlumniFilterState = {
  searchQuery: "",
  category: "All",
  role: "all",
  company: "all",
  department: "all",
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
  departments?: string[];
  totalResults: number;
  totalAlumniCount: number;
}

const CATEGORIES = [
  "All",
  "Cloud & Infra",
  "Frontend & Design",
  "Product",
  "AI & ML",
  "Finance",
];

export function AlumniFilters({
  filters,
  onFilterChange,
  onResetFilters,
  roles,
  companies,
  totalResults,
  totalAlumniCount,
}: AlumniFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Input & Category Chips (Matching Reference 4 top bar) */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E7E7] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
            />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange("searchQuery", e.target.value)}
              placeholder="Search by name, role, company, or technical skills..."
              className="w-full pl-9 pr-9 py-2 bg-[#F4F4F4] border border-transparent focus:border-[#090909] focus:bg-white rounded-full text-xs text-[#090909] placeholder-[#737373] focus:outline-none transition-all"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange("searchQuery", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#090909]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort By Control */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-[#737373] hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange("sortBy", e.target.value)}
              aria-label="Sort alumni"
              className="bg-[#F4F4F4] border border-transparent focus:border-[#090909] focus:bg-white text-xs text-[#090909] font-medium rounded-full px-3 py-1.5 h-9 focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended Match</option>
              <option value="relevant">Most Relevant</option>
              <option value="experienced">Most Experienced</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterChange("category", cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#090909] text-white shadow-xs"
                    : "bg-[#F4F4F4] text-[#454545] hover:text-[#090909] hover:bg-[#EBEBEB]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Status Strip */}
      <div className="flex items-center justify-between text-xs text-[#737373] px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#090909]">
            Showing {totalResults} of {totalAlumniCount} verified alumni
          </span>
          {(filters.searchQuery || filters.category !== "All" || filters.role !== "all" || filters.company !== "all" || filters.department !== "all" || filters.graduationYearRange !== "all") && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#090909] hover:underline ml-2"
            >
              <RotateCcw size={11} />
              Reset filters
            </button>
          )}
        </div>
        <span className="text-[11px] text-[#737373] hidden md:inline">
          Institutional .edu verification active
        </span>
      </div>
    </div>
  );
}
