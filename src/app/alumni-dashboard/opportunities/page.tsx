"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Building2,
  Edit3,
  Trash2,
  Clock,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadOpportunities,
  loadAlumniProfile,
  deleteOpportunity,
  toggleOpportunityStatus,
} from "@/lib/dashboard-storage";
import { initialOpportunities, defaultAlumniUser } from "@/lib/mock-data";
import { PostOpportunityModal } from "@/components/alumni-dashboard/PostOpportunityModal";
import { OpportunityDetailModal } from "@/components/alumni-dashboard/OpportunityDetailModal";
import { DeleteOpportunityModal } from "@/components/alumni-dashboard/DeleteOpportunityModal";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types";

export default function AlumniOpportunitiesPage() {

  const opportunities = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadOpportunities,
    () => initialOpportunities
  );

  const currentAlumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const [activeType, setActiveType] = useState<string>("all");
  const [onlyMyPosts, setOnlyMyPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [detailOpportunity, setDetailOpportunity] = useState<Opportunity | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState<Opportunity | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const isMine =
        opp.postedByAlumniId === currentAlumni.id ||
        opp.postedByAlumniName === currentAlumni.name;

      if (onlyMyPosts && !isMine) {
        return false;
      }
      if (activeType !== "all" && opp.type !== activeType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesComp = opp.company.toLowerCase().includes(q);
        const matchesLoc = opp.location.toLowerCase().includes(q);
        const matchesSkills = opp.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesComp && !matchesLoc && !matchesSkills) {
          return false;
        }
      }
      return true;
    });
  }, [opportunities, onlyMyPosts, activeType, searchQuery, currentAlumni]);

  const myPostsCount = useMemo(() => {
    return opportunities.filter(
      (opp) =>
        opp.postedByAlumniId === currentAlumni.id ||
        opp.postedByAlumniName === currentAlumni.name
    ).length;
  }, [opportunities, currentAlumni]);

  const handleToggleStatus = (opp: Opportunity) => {
    toggleOpportunityStatus(opp.id);
    const updatedStatus = opp.status === "closed" ? "reopened" : "marked as closed";
    showToast(`Opportunity "${opp.title}" has been ${updatedStatus}.`);
    if (detailOpportunity?.id === opp.id) {
      setDetailOpportunity((prev) =>
        prev ? { ...prev, status: prev.status === "closed" ? "active" : "closed" } : null
      );
    }
  };

  const handleDeleteConfirm = (oppId: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    const title = opp?.title || "Listing";
    deleteOpportunity(oppId);
    showToast(`Deleted opportunity listing: "${title}".`);
    setDeletingOpportunity(null);
    if (detailOpportunity?.id === oppId) {
      setDetailOpportunity(null);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "internship":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "full_time":
        return "bg-neutral-900 text-white border-black";
      case "referral":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "workshop":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "hackathon":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "event":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#090909] text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Briefcase size={22} className="text-[#090909]" />
              <span>Career Opportunities, Referrals &amp; Events</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              Post internships, full-time openings, referral channels, workshops, and technical hackathons directly to verified campus talent.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingOpportunity(null);
              setIsPostModalOpen(true);
            }}
            className="bg-[#090909] hover:bg-[#242424] text-white text-xs shrink-0 flex items-center gap-1.5 shadow-none rounded-full border-0"
          >
            <Plus size={14} />
            <span>Post Opportunity</span>
          </Button>
        </div>

        {/* Quick Metrics Strip */}
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-gray-200/80">
            <span className="text-[11px] text-gray-500 font-medium block">All Opportunities</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{opportunities.length}</div>
            <span className="text-[10px] text-gray-500 font-medium">Published listings</span>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-gray-200/80">
            <span className="text-[11px] text-gray-500 font-medium block">Active Openings</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {opportunities.filter((o) => o.status !== "closed").length}
            </div>
            <span className="text-[10px] text-neutral-800 font-semibold">Accepting applications</span>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-gray-200/80">
            <span className="text-[11px] text-gray-500 font-medium block">My Listings</span>
            <div className="text-lg font-bold text-neutral-900 mt-0.5">{myPostsCount}</div>
            <span className="text-[10px] text-neutral-900 font-semibold">Managed by you</span>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-gray-200/80">
            <span className="text-[11px] text-gray-500 font-medium block">Total Student Applicants</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {opportunities.reduce((acc, o) => acc + (o.applicantsCount || 0), 0)}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Applied candidates</span>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "All Opportunities" },
              { id: "internship", label: "Internships" },
              { id: "full_time", label: "Full-Time Jobs" },
              { id: "referral", label: "Referrals" },
              { id: "workshop", label: "Workshops" },
              { id: "hackathon", label: "Hackathons" },
              { id: "event", label: "Technical Events" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  activeType === tab.id
                    ? "bg-[#090909] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyMyPosts}
                onChange={(e) => setOnlyMyPosts(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-neutral-900 border-gray-300 focus:ring-black"
              />
              <span className="font-semibold text-gray-800">
                Only My Listings ({myPostsCount})
              </span>
            </label>

            <div className="relative w-52">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, company, skills..."
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Briefcase size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No opportunities match your filter</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {onlyMyPosts
              ? "You haven't posted any listings in this category yet. Share an opportunity to help students!"
              : "Try switching categories, clearing your search, or be the first to post a new opening!"}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingOpportunity(null);
              setIsPostModalOpen(true);
            }}
            className="mt-4 text-xs bg-[#090909] hover:bg-[#242424] text-white rounded-full border-0 shadow-none"
          >
            + Post Opportunity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => {
            const isMine =
              opp.postedByAlumniId === currentAlumni.id ||
              opp.postedByAlumniName === currentAlumni.name;
            const isClosed = opp.status === "closed";

            return (
              <div
                key={opp.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all hover:border-[#b2d5f8] hover:shadow-2xs flex flex-col justify-between ${
                  isClosed ? "border-gray-200 bg-gray-50/50 opacity-80" : "border-gray-200/90"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                          {opp.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor(
                            opp.type
                          )}`}
                        >
                          {opp.type.replace("_", " ")}
                        </span>

                        {opp.workArrangement && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                            <Laptop size={10} />
                            <span>
                              {opp.workArrangement === "remote"
                                ? "Remote"
                                : opp.workArrangement === "hybrid"
                                ? "Hybrid"
                                : "On-Site"}
                            </span>
                          </span>
                        )}

                        {isClosed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                            Closed
                          </span>
                        )}

                        {isMine && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-200">
                            Posted by You
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          <Building2 size={13} className="text-gray-400" />
                          {opp.company}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin size={13} className="text-gray-400" />
                          {opp.location}
                        </span>
                        {opp.deadline && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar size={13} />
                            Deadline: {opp.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 inline-flex items-center gap-1">
                        <Users size={12} />
                        {opp.applicantsCount} applicants
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {opp.postedDate}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-700 leading-relaxed line-clamp-2">
                    {opp.description}
                  </p>

                  {/* Eligibility Tag if available */}
                  {opp.eligibility && (
                    <p className="mt-2 text-[11px] text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                      <strong>Eligibility:</strong> {opp.eligibility}
                    </p>
                  )}

                  {/* Skills */}
                  {opp.skills && opp.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {opp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Author management buttons */}
                    {isMine && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOpportunity(opp);
                            setIsPostModalOpen(true);
                          }}
                          className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 py-1 px-1.5"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(opp)}
                          className="text-xs font-semibold text-gray-600 hover:text-black hover:underline flex items-center gap-1 py-1 px-1.5"
                        >
                          <Clock size={11} />
                          <span>{isClosed ? "Reopen" : "Close"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingOpportunity(opp)}
                          className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 py-1 px-1.5"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailOpportunity(opp)}
                    className="text-xs text-neutral-900 border-[#E7E7E7] hover:bg-neutral-100 rounded-full"
                  >
                    <span>View Details &rarr;</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post / Edit Opportunity Modal */}
      <PostOpportunityModal
        isOpen={isPostModalOpen}
        initialData={editingOpportunity}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingOpportunity(null);
        }}
        onSuccess={(title, isEdit) =>
          showToast(
            isEdit
              ? `Successfully updated opportunity: "${title}".`
              : `Successfully published opportunity: "${title}".`
          )
        }
      />

      {/* Detail Modal */}
      <OpportunityDetailModal
        opportunity={detailOpportunity}
        isOpen={!!detailOpportunity}
        isAuthor={
          Boolean(detailOpportunity) &&
          (detailOpportunity?.postedByAlumniId === currentAlumni.id ||
            detailOpportunity?.postedByAlumniName === currentAlumni.name)
        }
        onClose={() => setDetailOpportunity(null)}
        onEdit={(opp) => {
          setEditingOpportunity(opp);
          setIsPostModalOpen(true);
        }}
        onDelete={(opp) => setDeletingOpportunity(opp)}
        onToggleStatus={(opp) => handleToggleStatus(opp)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteOpportunityModal
        opportunity={deletingOpportunity}
        isOpen={!!deletingOpportunity}
        onClose={() => setDeletingOpportunity(null)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
}
