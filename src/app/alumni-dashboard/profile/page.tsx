"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Building2,
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Save,
  Plus,
  Eye,
  Lock,
  Globe,
  Briefcase,
  Layers,
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

function AlumniProfileInnerForm({
  initialData,
  onSaveSuccess,
}: {
  initialData: Alumni;
  onSaveSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Alumni>(initialData);
  const [newSkill, setNewSkill] = useState("");
  const [newArea, setNewArea] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const skillName = newSkill.trim();
    if (!formData.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, { id: `sk-${Date.now()}`, name: skillName, level: "advanced" }],
      });
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s.id !== skillId),
    });
  };

  const handleAddArea = () => {
    if (!newArea.trim()) return;
    const areaName = newArea.trim();
    if (!formData.mentorshipAreas.some((a) => a.toLowerCase() === areaName.toLowerCase())) {
      setFormData({
        ...formData,
        mentorshipAreas: [...formData.mentorshipAreas, areaName],
      });
    }
    setNewArea("");
  };

  const handleRemoveArea = (area: string) => {
    setFormData({
      ...formData,
      mentorshipAreas: formData.mentorshipAreas.filter((a) => a !== area),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      saveAlumniProfile(formData);
      setIsSaving(false);
      onSaveSuccess();
    }, 250);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">1. Professional Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your professional details as shown on your public student-facing profile.
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving}
            className="bg-[#090909] hover:bg-[#242424] text-white text-xs flex items-center gap-1.5 rounded-full border-0 shadow-none"
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
              required
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={formData.headline || ""}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Job Title</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Organization</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Profile URL</label>
            <input
              type="url"
              value={formData.linkedinUrl || "https://linkedin.com/in/marcus-vance"}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Professional Biography &amp; Mentorship Philosophy
          </label>
          <textarea
            rows={4}
            value={formData.bio || ""}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell students about your career path, technical domain, and what you enjoy discussing in mentorship sessions..."
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-3 text-gray-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* 2. Education Credentials */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <GraduationCap size={16} className="text-[#090909]" />
            <span>2. Education &amp; University Affiliation</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Institutional background verified for alumni badge accreditation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">University</label>
            <input
              type="text"
              value={formData.university || "University of Technology"}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Degree Earned</label>
            <input
              type="text"
              value={formData.degree || "B.S. in Computer Science"}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Graduation Year</label>
            <input
              type="number"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* 3. Skills & Technical Expertise */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Layers size={16} className="text-[#090909]" />
            <span>3. Technical Skills &amp; Domain Expertise</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Technologies and engineering domains where you can provide code reviews and mock interviews.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-900"
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-neutral-500 hover:text-black ml-0.5"
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. Kubernetes, Go, Kafka)..."
              className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSkill}
              className="text-xs rounded-full border-neutral-300"
            >
              <Plus size={13} className="mr-1" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Mentorship Interests & Focus Areas */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Briefcase size={16} className="text-[#090909]" />
            <span>4. Mentorship Focus Areas</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Topics and discussion formats you prefer to mentor students in.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.mentorshipAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-900"
              >
                <span>{area}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArea(area)}
                  className="text-neutral-500 hover:text-black ml-0.5"
                  title="Remove area"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddArea();
                }
              }}
              placeholder="Add focus (e.g. System Design, Mock Coding)..."
              className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddArea}
              className="text-xs rounded-full border-neutral-300"
            >
              <Plus size={13} className="mr-1" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Mentorship Availability & Capacity */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900">5. Mentorship Availability &amp; Capacity</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your active availability status and maximum student capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Availability Status
            </label>
            <select
              value={formData.mentorshipAvailability}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mentorshipAvailability: e.target.value as Alumni["mentorshipAvailability"],
                })
              }
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="available">Accepting New Mentees (Open)</option>
              <option value="limited">Limited Availability (1 slot)</option>
              <option value="unavailable">Full / Not Accepting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Max Active Mentees Capacity
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={formData.maxMentees || 5}
              onChange={(e) =>
                setFormData({ ...formData, maxMentees: Number(e.target.value) || 5 })
              }
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Average Response Time
            </label>
            <input
              type="text"
              value={formData.averageResponseTime}
              onChange={(e) =>
                setFormData({ ...formData, averageResponseTime: e.target.value })
              }
              placeholder="e.g. within 24 hours"
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* 6. Profile Visibility Preferences */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Eye size={16} className="text-[#090909]" />
            <span>6. Profile Visibility &amp; Privacy Preferences</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Control who can discover your profile and send mentorship inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "public" as const,
              title: "Public to All Students",
              icon: Globe,
              description: "Visible to all verified students across the university network.",
            },
            {
              id: "university_only" as const,
              title: "Department Only",
              icon: Building2,
              description: "Only students registered under your academic department.",
            },
            {
              id: "private" as const,
              title: "Direct Invite Only",
              icon: Lock,
              description: "Hidden from directory; accessible only through direct invitations.",
            },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = (formData.visibilityPreference || "public") === opt.id;
            return (
              <label
                key={opt.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-black bg-neutral-100 ring-1 ring-black"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="visibilityPreference"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          visibilityPreference: opt.id,
                        })
                      }
                      className="text-black focus:ring-black accent-black"
                    />
                    <Icon size={14} className={isSelected ? "text-black" : "text-gray-400"} />
                    <span className="text-xs font-bold text-gray-900">{opt.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{opt.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="p-4 bg-white border border-[#E7E7E7] rounded-xl flex items-center justify-between shadow-xs">
        <span className="text-[11px] text-gray-500">
          Preferences persist across student matching algorithms and dashboard sessions.
        </span>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSaving}
          className="bg-[#090909] hover:bg-[#242424] text-white text-xs flex items-center gap-2 px-5 py-2.5 font-semibold shadow-xs rounded-full"
        >
          <Save size={14} />
          <span>{isSaving ? "Saving..." : "Save All Profile &amp; Mentorship Settings"}</span>
        </Button>
      </div>
    </form>
  );
}

export default function AlumniProfilePage() {
  const alumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#090909] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-neutral-800">
          <CheckCircle2 size={15} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-28 bg-[#171717] border-b border-[#262626] relative" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-12 mb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="h-24 w-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
              <Avatar name={alumni.name} size="lg" />
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full font-semibold border border-neutral-200">
                <ShieldCheck size={13} /> Verified Alumni Mentor
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">{alumni.name}</h1>
            <p className="text-xs text-gray-700 mt-0.5 font-medium">{alumni.headline}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-gray-800">
                <Building2 size={13} className="text-gray-400" />
                {alumni.role} at {alumni.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                {alumni.location}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap size={13} className="text-gray-400" />
                Class of {alumni.graduationYear} · {alumni.department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyed Form to ensure state sync */}
      <AlumniProfileInnerForm
        key={alumni.id}
        initialData={alumni}
        onSaveSuccess={() => showToast("Alumni profile & mentorship preferences saved successfully!")}
      />
    </div>
  );
}
