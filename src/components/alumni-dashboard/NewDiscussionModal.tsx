"use client";

import { useState } from "react";
import { X, Send, MessagesSquare, Sparkles, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addCommunityPost, loadAlumniProfile, loadStudentProfile, loadAuthSession } from "@/lib/dashboard-storage";
import { enhanceCommunityPost } from "@/services/ai-writing-assistant";
import type { CommunityPost, CommunityCategory } from "@/types";

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
  const authSession = loadAuthSession();
  const isAlumni = authSession.role === "alumni";
  const currentAlumni = loadAlumniProfile();
  const currentStudent = loadStudentProfile();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("career_advice");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Assistant states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPreview, setEnhancedPreview] = useState<{
    text: string;
    improvements: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleEnhanceWithAI = async () => {
    if (!content.trim()) {
      setValidationError("Please write an initial draft or key thoughts first before requesting AI enhancement.");
      return;
    }
    setValidationError(null);
    setIsEnhancing(true);

    try {
      const res = await enhanceCommunityPost(content, category);
      setEnhancedPreview({
        text: res.enhancedText,
        improvements: res.improvements,
      });
    } catch {
      // fallback
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyAIEnhancement = () => {
    if (enhancedPreview) {
      setContent(enhancedPreview.text);
      setEnhancedPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Please enter a discussion title or headline.");
      return;
    }
    if (!content.trim()) {
      setValidationError("Please enter the body of your discussion post.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    const tags = tagsText
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const authorId = isAlumni ? currentAlumni.id : currentStudent.id;
    const authorName = isAlumni ? currentAlumni.name : currentStudent.name;
    const authorRole = isAlumni
      ? `${currentAlumni.role} at ${currentAlumni.company}`
      : `${currentStudent.academicYear} · ${currentStudent.department}`;
    const authorType: "alumni" | "student" = isAlumni ? "alumni" : "student";

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      authorId,
      authorName,
      authorRole,
      authorType,
      category,
      timestamp: new Date().toISOString(),
      likes: 1,
      likedByMe: true,
      tags: tags.length > 0 ? tags : ["AlumniNetwork", "TechCareers"],
      comments: [],
    };

    addCommunityPost(newPost);
    setSubmitting(false);
    onSuccess(newPost.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl border border-[#E7E7E7] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessagesSquare size={16} className="text-neutral-900" />
              <span>Create Community Discussion Post</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share career advice, technical wisdom, achievements, event announcements, or verified opportunities.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

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
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Post Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityCategory)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="career_advice">Career Advice &amp; Professional Progression</option>
              <option value="technical">Technical Knowledge &amp; Systems Architecture</option>
              <option value="achievement">Mentee &amp; Student Achievements</option>
              <option value="event">Event Announcements &amp; Tech Talks</option>
              <option value="opportunity">Verified Job &amp; Internship Opportunities</option>
              <option value="interview_prep">Technical Interview Preparation</option>
              <option value="general">General Campus &amp; Alumni Q&amp;A</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Post Content <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                disabled={isEnhancing}
                onClick={handleEnhanceWithAI}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-900 hover:text-black hover:underline"
              >
                <Sparkles size={12} className="text-neutral-900" />
                <span>{isEnhancing ? "Enhancing draft..." : "Enhance with AI Assistant"}</span>
              </button>
            </div>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide thoughtful advice, context, or questions for students..."
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />

            {/* AI Review Panel */}
            {enhancedPreview && (
              <div className="mt-2.5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <Sparkles size={13} className="text-neutral-900 shrink-0" />
                    <span>AI Writing Assistant Suggestion (Review Required)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnhancedPreview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-2 p-2.5 bg-white border border-neutral-200 rounded-lg text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {enhancedPreview.text}
                </div>

                <div className="mt-2 text-[11px] text-neutral-800">
                  <span className="font-semibold block mb-0.5">Improvements Applied:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {enhancedPreview.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEnhancedPreview(null)}
                    className="text-xs text-gray-600 rounded-full"
                  >
                    Keep Original
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApplyAIEnhancement}
                    className="text-xs bg-[#090909] hover:bg-[#242424] text-white rounded-full px-4"
                  >
                    <Check size={12} className="mr-1" />
                    <span>Apply to Post</span>
                  </Button>
                </div>
              </div>
            )}
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
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs rounded-full border-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || !title.trim() || !content.trim()}
              className="text-xs bg-[#090909] hover:bg-[#242424] text-white rounded-full px-4 flex items-center gap-1.5"
            >
              <Send size={12} />
              <span>{submitting ? "Publishing..." : "Publish Post"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
