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
    <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden my-8">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-blue-600" />
          <h2 id="edit-role-modal-title" className="text-base font-bold text-gray-900">
            Edit Target Career Role
          </h2>
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

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="target-role-input" className="text-xs font-semibold text-gray-700">
            Target Position Title
          </label>
          <input
            id="target-role-input"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Full-Stack Software Engineer"
            required
            className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Popular Career Tracks
          </label>
          <div className="flex flex-wrap gap-1.5">
            {popularRoles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`text-[11px] px-2.5 py-1 rounded-md border text-left transition-colors ${
                  role === r
                    ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="inline-flex items-center gap-1.5">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto"
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
