"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Building2,
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadAlumniProfile,
  saveAlumniProfile,
} from "@/lib/dashboard-storage";
import { defaultAlumniUser } from "@/lib/mock-data";
import type { Alumni } from "@/types";

export default function AlumniProfilePage() {
  const alumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const [formData, setFormData] = useState<Alumni>(alumni);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      saveAlumniProfile(formData);
      setIsSaving(false);
      showToast("Alumni profile changes saved successfully!");
    }, 350);
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

      {/* Profile Overview Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-28 bg-linear-to-r from-blue-700 via-blue-800 to-indigo-900 relative" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-12 mb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="h-24 w-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
              <Avatar name={formData.name} size="lg" />
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-[#057642] bg-[#eef8f1] px-2.5 py-1 rounded-full font-semibold border border-[#bfe3c9]">
                <ShieldCheck size={13} /> Verified Alumni Mentor
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">{formData.name}</h1>
            <p className="text-xs text-gray-700 mt-0.5 font-medium">{formData.headline}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-gray-800">
                <Building2 size={13} className="text-gray-400" />
                {formData.role} at {formData.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                {formData.location}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap size={13} className="text-gray-400" />
                Class of {formData.graduationYear} · {formData.department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Basic Information</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Your professional details as shown on your public student-facing profile.
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
            >
              <Save size={13} />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Headline</label>
              <input
                type="text"
                value={formData.headline || ""}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Job Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">About &amp; Mentorship Philosophy</label>
            <textarea
              rows={3}
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>
        </div>

        {/* Mentorship Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Mentorship &amp; Availability Preferences</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Control your availability status and preferred student topics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mentorship Availability</label>
              <select
                value={formData.mentorshipAvailability}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mentorshipAvailability: e.target.value as Alumni["mentorshipAvailability"],
                  })
                }
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              >
                <option value="available">Accepting New Mentees (Open)</option>
                <option value="limited">Limited Availability (1 slot left)</option>
                <option value="unavailable">Full / Not Accepting Mentees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Average Response Time</label>
              <input
                type="text"
                value={formData.averageResponseTime}
                onChange={(e) => setFormData({ ...formData, averageResponseTime: e.target.value })}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mentorship Areas (comma-separated)
            </label>
            <input
              type="text"
              value={formData.mentorshipAreas.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mentorshipAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Example: Backend system design, Production reliability, LeetCode preparation, Resume reviews
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
            >
              <Save size={13} />
              <span>{isSaving ? "Saving..." : "Save Mentorship Preferences"}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
