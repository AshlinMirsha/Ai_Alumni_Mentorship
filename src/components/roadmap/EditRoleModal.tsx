"use client";

import { useState, useEffect, type FormEvent } from "react";
import { X, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EditRoleModalProps {
  currentRole: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveRole: (newRole: string) => void;
}

interface EditRoleFormProps {
  initialRole: string;
  onClose: () => void;
  onSaveRole: (newRole: string) => void;
}

function EditRoleForm({ initialRole, onClose, onSaveRole }: EditRoleFormProps) {
  const [role, setRole] = useState(initialRole);

  const popularRoles = [
    "Full-Stack Software Engineer",
    "Backend Developer",
    "Software Engineer Intern",
    "AI Engineer",
    "Frontend Platform Engineer",
    "Cloud Solutions Architect",
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (role.trim()) {
      onSaveRole(role.trim());
      onClose();
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E7E7E7] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
            <Target size={15} />
          </div>
          <h2 id="edit-role-modal-title" className="text-sm font-bold text-[#191919]">
            Edit Target Career Role
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="target-role-input" className="text-xs font-semibold text-[#191919]">
            Target Position Title
          </label>
          <input
            id="target-role-input"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Full-Stack Software Engineer"
            required
            className="w-full rounded-xl border border-neutral-200 bg-white text-xs text-[#191919] px-3 py-2 h-9 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Popular Career Tracks
          </label>
          <div className="flex flex-wrap gap-1.5">
            {popularRoles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`text-[11px] px-2.5 py-1 rounded-full border text-left transition-colors ${
                  role === r
                    ? "bg-[#090909] text-white border-[#090909] font-medium"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-full text-xs">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="inline-flex items-center gap-1.5 rounded-full bg-[#090909] hover:bg-[#242424] text-white text-xs">
            <Check size={13} />
            Save Target Role
          </Button>
        </div>
      </form>
    </div>
  );
}

export function EditRoleModal({
  currentRole,
  isOpen,
  onClose,
  onSaveRole,
}: EditRoleModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
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
      aria-labelledby="edit-role-modal-title"
    >
      <EditRoleForm
        key={currentRole}
        initialRole={currentRole}
        onClose={onClose}
        onSaveRole={onSaveRole}
      />
    </div>
  );
}
