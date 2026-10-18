"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Opportunity } from "@/types";

interface DeleteOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onConfirmDelete: (oppId: string) => void;
}

export function DeleteOpportunityModal({
  isOpen,
  onClose,
  opportunity,
  onConfirmDelete,
}: DeleteOpportunityModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleDelete = () => {
    setIsDeleting(true);
    onConfirmDelete(opportunity.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-gray-900">
            <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Delete Opportunity</h2>
              <p className="text-xs text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
          <p className="font-bold text-gray-900">{opportunity.title}</p>
          <p className="text-gray-500 mt-0.5">{opportunity.company} · {opportunity.location}</p>
        </div>

        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          Are you sure you want to permanently delete this opportunity listing? Students will no longer be able to discover or apply to it.
        </p>

        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
