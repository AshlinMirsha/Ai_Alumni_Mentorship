"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadOpportunities,
  loadAlumniProfile,
} from "@/lib/dashboard-storage";
import { initialOpportunities, defaultAlumniUser } from "@/lib/mock-data";
import { PostOpportunityModal } from "@/components/alumni-dashboard/PostOpportunityModal";
import { cn } from "@/lib/utils";

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
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      if (onlyMyPosts && opp.postedByAlumniId !== currentAlumni.id && opp.postedByAlumniName !== currentAlumni.name) {
        return false;
      }
      if (activeType !== "all" && opp.type !== activeType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesComp = opp.company.toLowerCase().includes(q);
        const matchesSkills = opp.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesComp && !matchesSkills) {
          return false;
        }
      }
      return true;
    });
  }, [opportunities, onlyMyPosts, activeType, searchQuery, currentAlumni]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Briefcase size={20} className="text-[#0a66c2]" />
              <span>Career Opportunities &amp; Referrals</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Share internship positions, new grad openings, and employee referrals directly with verified students.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPostModalOpen(true)}
            className="bg-[#0a66c2] hover:bg-[#004182] text-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Post New Opportunity</span>
          </Button>
        </div>

        {/* Filters Strip */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "All Opportunities" },
              { id: "internship", label: "Internships" },
              { id: "full_time", label: "Full-Time" },
              { id: "referral", label: "Referrals" },
              { id: "research", label: "Research / Shadowing" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeType === tab.id
                    ? "bg-[#0a66c2] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyMyPosts}
                onChange={(e) => setOnlyMyPosts(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-[#0a66c2] border-gray-300 focus:ring-[#0a66c2]"
              />
              <span className="font-medium">Only My Postings</span>
            </label>

            <div className="relative w-48">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-7 pr-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Briefcase size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No opportunities match your filter</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try switching categories, clearing your search, or be the first to post a new opening!
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPostModalOpen(true)}
            className="mt-4 text-xs bg-[#0a66c2]"
          >
            + Post Opportunity
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => {
            const isMine = opp.postedByAlumniId === currentAlumni.id || opp.postedByAlumniName === currentAlumni.name;

            return (
              <div
                key={opp.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:border-[#b2d5f8] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{opp.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0a66c2] border border-blue-100">
                        {opp.type.replace("_", " ")}
                      </span>
                      {isMine && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                          Posted by You
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                        <Building2 size={13} className="text-gray-400" />
                        {opp.company}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin size={13} className="text-gray-400" />
                        {opp.location}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar size={13} />
                        Deadline: {opp.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-semibold text-[#057642] bg-[#eef8f1] px-2.5 py-1 rounded-full border border-[#bfe3c9] inline-flex items-center gap-1">
                      <Users size={12} />
                      {opp.applicantsCount} student applicants
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Posted: {opp.postedDate}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-700 leading-relaxed">
                  {opp.description}
                </p>

                {opp.requirements && opp.requirements.length > 0 && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-800 block mb-1">
                      Role Expectations &amp; Eligibility:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5">
                      {opp.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {opp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">
                      Posted by: <strong className="text-gray-800">{opp.postedByAlumniName}</strong>
                    </span>
                    {opp.applyUrl && (
                      <a
                        href={opp.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#0a66c2] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Official Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Opportunity Modal */}
      <PostOpportunityModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={(title) =>
          showToast(`Successfully published opportunity: "${title}".`)
        }
      />
    </div>
  );
}
