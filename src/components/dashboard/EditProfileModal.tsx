"use client";

import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { X, Plus, Check, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Student, Skill, Interest } from "@/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSave: (updated: Student) => void;
  onReset: () => void;
}

const ACADEMIC_YEAR_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Graduate Student",
];

const PRESET_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Django",
  "SQL",
  "PostgreSQL",
  "Docker",
  "Java",
  "Spring Boot",
  "FastAPI",
  "AWS",
  "Git",
];

interface FormContentProps {
  student: Student;
  onSave: (updated: Student) => void;
  onClose: () => void;
  onReset: () => void;
}

function EditProfileForm({ student, onSave, onClose, onReset }: FormContentProps) {
  const [name, setName] = useState(student.name);
  const [department, setDepartment] = useState(student.department);
  const [academicYear, setAcademicYear] = useState(student.academicYear || "Second Year");
  const [careerGoal, setCareerGoal] = useState(
    student.careerGoal || student.careerGoals?.[0] || "Full-Stack Software Engineer"
  );
  const [skills, setSkills] = useState<string[]>(
    student.skills.map((s) => (typeof s === "string" ? s : s.name))
  );
  const [newSkill, setNewSkill] = useState("");
  const [interests, setInterests] = useState<string[]>(
    student.interests.map((i) => (typeof i === "string" ? i : i.name))
  );
  const [newInterest, setNewInterest] = useState("");
  const [projects, setProjects] = useState<string[]>(student.projects || []);
  const [newProject, setNewProject] = useState("");
  const [bio, setBio] = useState(student.bio || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests((prev) => prev.filter((i) => i !== interestToRemove));
  };

  const handleAddProject = () => {
    const trimmed = newProject.trim();
    if (trimmed && !projects.includes(trimmed)) {
      setProjects((prev) => [...prev, trimmed]);
      setNewProject("");
    }
  };

  const handleRemoveProject = (projectToRemove: string) => {
    setProjects((prev) => prev.filter((p) => p !== projectToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Name is required.";
    if (!department.trim()) errs.department = "Department is required.";
    if (!careerGoal.trim()) errs.careerGoal = "Career goal is required.";
    if (skills.length === 0) errs.skills = "Please add at least one skill.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const updatedSkills: Skill[] = skills.map((s, idx) => ({
      id: `sk-custom-${idx}`,
      name: s,
      level: "intermediate",
    }));

    const updatedInterests: Interest[] = interests.map((i, idx) => ({
      id: `int-custom-${idx}`,
      name: i,
    }));

    const updatedStudent: Student = {
      ...student,
      name: name.trim(),
      department: department.trim(),
      academicYear: academicYear,
      careerGoal: careerGoal.trim(),
      careerGoals: [careerGoal.trim()],
      skills: updatedSkills,
      interests: updatedInterests,
      projects: projects,
      bio: bio.trim(),
      headline: `${academicYear} ${department.trim()} student · Aspiring ${careerGoal.trim()}`,
    };

    onSave(updatedStudent);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div>
          <h2 id="edit-profile-modal-title" className="text-base font-bold text-gray-900">
            Edit Student Profile
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Update sample demo information. Changes are safely saved to your browser session.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      {/* Demo Mode Notice */}
      <div className="px-6 py-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertCircle size={14} className="text-amber-600 shrink-0" />
          <span>
            <strong>Demo Mode:</strong> Persisted locally. Passwords or sensitive credentials are never stored.
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset demo profile to initial sample data?")) {
              onReset();
              onClose();
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 hover:underline"
        >
          <RotateCcw size={11} />
          Reset Defaults
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span>Profile updated successfully! Recalculating completion score...</span>
          </div>
        )}

        {/* Grid row 1: Name & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ashlin"
            error={errors.name}
            required
          />

          <Input
            label="Academic Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science"
            error={errors.department}
            required
          />
        </div>

        {/* Grid row 2: Academic Year & Career Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="academic-year-select" className="text-sm font-medium text-gray-700">
              Academic Year
            </label>
            <select
              id="academic-year-select"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white text-sm text-gray-900 px-3 py-2.5 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Primary Career Goal"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Full-Stack Software Engineer"
            error={errors.careerGoal}
            required
          />
        </div>

        {/* Skills Management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Technical Skills <span className="text-xs text-gray-400 font-normal">(Min 3 for 100% completion)</span>
            </label>
            <span className="text-xs text-gray-400">{skills.length} skills listed</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-md min-h-[44px]">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-blue-900 focus:outline-none"
                  aria-label={`Remove skill ${skill}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span className="text-xs text-gray-400 self-center">No skills added yet.</span>
            )}
          </div>

          {errors.skills && <p className="text-xs text-red-600">{errors.skills}</p>}

          {/* Add skill input & suggestions */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type skill & press Enter (e.g. Django, React, SQL)"
              className="flex-1 rounded-md border border-gray-200 text-xs px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
              <Plus size={14} /> Add
            </Button>
          </div>

          {/* Quick suggested chips */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[11px] text-gray-400">Quick add:</span>
            {PRESET_SKILLS.filter((s) => !skills.includes(s))
              .slice(0, 6)
              .map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => setSkills((p) => [...p, suggested])}
                  className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  + {suggested}
                </button>
              ))}
          </div>
        </div>

        {/* Interests Management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Career Interests</label>
            <span className="text-xs text-gray-400">{interests.length} listed</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-md min-h-[40px]">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:text-indigo-900 focus:outline-none"
                  aria-label={`Remove interest ${interest}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {interests.length === 0 && (
              <span className="text-xs text-gray-400 self-center">No interests added.</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              placeholder="Type interest & press Enter (e.g. Web Development, Cloud)"
              className="flex-1 rounded-md border border-gray-200 text-xs px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddInterest}>
              <Plus size={14} /> Add
            </Button>
          </div>
        </div>

        {/* Projects Management */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Portfolio Projects</label>
            <span className="text-xs text-gray-400">{projects.length} listed</span>
          </div>

          <div className="space-y-1.5">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
              >
                <span className="font-medium truncate mr-2">{proj}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(proj)}
                  className="text-gray-400 hover:text-red-600 focus:outline-none"
                  aria-label={`Remove project ${proj}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProject();
                }
              }}
              placeholder="Add a project title (e.g. Alumni Mentorship Platform)"
              className="flex-1 rounded-md border border-gray-200 text-xs px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddProject}>
              <Plus size={14} /> Add Project
            </Button>
          </div>
        </div>

        {/* Bio / Summary */}
        <div className="space-y-1.5">
          <label htmlFor="bio-textarea" className="text-sm font-medium text-gray-700">
            Personal Bio / Career Objective
          </label>
          <textarea
            id="bio-textarea"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief summary of your academic path and career ambitions..."
            className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer buttons */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export function EditProfileModal({
  isOpen,
  onClose,
  student,
  onSave,
  onReset,
}: EditProfileModalProps) {
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-modal-title"
    >
      <EditProfileForm
        key={`${student.name}-${student.department}-${student.careerGoal}-${student.skills.length}`}
        student={student}
        onSave={onSave}
        onClose={onClose}
        onReset={onReset}
      />
    </div>
  );
}
