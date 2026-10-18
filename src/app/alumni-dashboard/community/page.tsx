"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  MessagesSquare,
  Plus,
  ThumbsUp,
  MessageSquare,
  Search,
  CheckCircle2,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadCommunityPosts,
  likeCommunityPost,
  addCommunityComment,
  loadAlumniProfile,
} from "@/lib/dashboard-storage";
import { initialCommunityPosts, defaultAlumniUser } from "@/lib/mock-data";
import { NewDiscussionModal } from "@/components/alumni-dashboard/NewDiscussionModal";
import { cn } from "@/lib/utils";
import type { CommunityComment } from "@/types";

export default function AlumniCommunityPage() {
  const posts = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadCommunityPosts,
    () => initialCommunityPosts
  );

  const currentAlumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    "post-001": true,
  });
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesContent = p.content.toLowerCase().includes(q);
        const matchesAuthor = p.authorName.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [posts, activeCategory, searchQuery]);

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleLike = (postId: string) => {
    likeCommunityPost(postId);
  };

  const handlePostReply = (postId: string) => {
    const text = replyTextMap[postId];
    if (!text || !text.trim()) return;

    const newComment: CommunityComment = {
      id: `com-${Date.now()}`,
      authorId: currentAlumni.id,
      authorName: currentAlumni.name,
      authorRole: `${currentAlumni.role} at ${currentAlumni.company}`,
      authorType: "alumni",
      content: text.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    addCommunityComment(postId, newComment);
    setReplyTextMap((prev) => ({ ...prev, [postId]: "" }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    showToast("Your response was published to the discussion.");
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

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MessagesSquare size={20} className="text-[#0a66c2]" />
              <span>Campus &amp; Alumni Community</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Share industry wisdom, answer questions from college students, and foster an active alumni-to-student community.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewDiscussionOpen(true)}
            className="bg-[#0a66c2] hover:bg-[#004182] text-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Start Discussion</span>
          </Button>
        </div>

        {/* Filter Strip */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "All Discussions" },
              { id: "career_advice", label: "Career Advice" },
              { id: "interview_prep", label: "Interview Prep" },
              { id: "technical", label: "Technical & Systems" },
              { id: "industry_trends", label: "Industry Trends" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeCategory === tab.id
                    ? "bg-[#0a66c2] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions &amp; tags..."
              className="w-full pl-7 pr-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>
        </div>
      </div>

      {/* Discussions Feed */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <MessagesSquare size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No discussions in this category</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Start a discussion to share practical advice with students.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewDiscussionOpen(true)}
            className="mt-4 text-xs bg-[#0a66c2]"
          >
            + Start Discussion
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isCommentsOpen = Boolean(expandedComments[post.id]);
            const replyValue = replyTextMap[post.id] || "";

            return (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:border-[#b2d5f8] transition-colors"
              >
                {/* Author Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={post.authorName} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-gray-900">{post.authorName}</h4>
                        {post.authorType === "alumni" && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#057642] bg-[#eef8f1] px-1.5 py-0.2 rounded border border-[#bfe3c9]">
                            <ShieldCheck size={10} /> Alumni Mentor
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">{post.authorRole}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a66c2] bg-blue-50 px-2 py-0.5 rounded">
                    {post.category.replace("_", " ")}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-gray-900 mt-3 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-[#0a66c2] font-medium transition-colors"
                    >
                      <ThumbsUp size={14} />
                      <span>{post.likes} Helpful</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span>{post.comments.length} Responses</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {new Date(post.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Comments Thread Section */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div className="space-y-2.5">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{comment.authorName}</span>
                              <span className="text-[10px] text-gray-500">
                                ({comment.authorRole})
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Alumni Comment Composer */}
                    <div className="flex gap-2 items-center mt-3 pt-2">
                      <Avatar name={currentAlumni.name} size="sm" />
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={replyValue}
                          onChange={(e) =>
                            setReplyTextMap((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handlePostReply(post.id);
                            }
                          }}
                          placeholder="Write an encouraging response or mentor tip..."
                          className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={!replyValue.trim()}
                          onClick={() => handlePostReply(post.id)}
                          className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                        >
                          <Send size={11} className="mr-1" />
                          <span>Reply</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Discussion Modal */}
      <NewDiscussionModal
        isOpen={isNewDiscussionOpen}
        onClose={() => setIsNewDiscussionOpen(false)}
        onSuccess={(title) =>
          showToast(`Published community discussion: "${title}".`)
        }
      />
    </div>
  );
}
