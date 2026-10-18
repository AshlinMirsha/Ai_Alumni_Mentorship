"use client";

import { useState } from "react";
import { X, Send, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addCommunityPost, loadAlumniProfile } from "@/lib/dashboard-storage";
import type { CommunityPost } from "@/types";

interface NewDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string) => void;
}

export function NewDiscussionModal({
  isOpen,
  onClose,
  onSuccess,
}: NewDiscussionModalProps) {
  const currentAlumni = loadAlumniProfile();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"]>("career_advice");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);

    const tags = tagsText
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      authorId: currentAlumni.id,
      authorName: currentAlumni.name,
      authorRole: `${currentAlumni.role} at ${currentAlumni.company}`,
      authorType: "alumni",
      category,
      timestamp: new Date().toISOString(),
      likes: 1,
      tags: tags.length > 0 ? tags : ["CareerAdvice", "TechCareers"],
      comments: [],
    };

    setTimeout(() => {
      addCommunityPost(newPost);
      setSubmitting(false);
      onSuccess(newPost.title);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessagesSquare size={16} className="text-[#0a66c2]" />
              <span>Start a Community Discussion</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share industry perspective, answer career questions, or start a discussion for students.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Discussion Topic / Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3 things engineers look for when reviewing campus project portfolios"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Discussion Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityPost["category"])}
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              <option value="career_advice">Career Advice &amp; Progression</option>
              <option value="interview_prep">Technical Interview Preparation</option>
              <option value="technical">Engineering &amp; System Design</option>
              <option value="industry_trends">Industry Trends &amp; Future Tech</option>
              <option value="general">General Campus &amp; Alumni Q&amp;A</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Post Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide thoughtful advice, context, or questions for students..."
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Backend, Interviews, Hiring, SystemDesign"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || !title.trim() || !content.trim()}
              className="text-xs bg-[#0a66c2] hover:bg-[#004182] flex items-center gap-1.5"
            >
              <Send size={12} />
              <span>{submitting ? "Publishing..." : "Publish Discussion"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
