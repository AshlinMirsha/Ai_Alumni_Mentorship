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
  Share2,
  Trash2,
  Sparkles,
  Calendar,
  Briefcase,
  Award,
  BookOpen,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadCommunityPosts,
  addCommunityComment,
  deleteCommunityPost,
  toggleLikeCommunityPost,
  loadAlumniProfile,
} from "@/lib/dashboard-storage";
import { initialCommunityPosts, defaultAlumniUser } from "@/lib/mock-data";
import { NewDiscussionModal } from "@/components/alumni-dashboard/NewDiscussionModal";
import { cn } from "@/lib/utils";
import type { CommunityComment, CommunityCategory } from "@/types";

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
    toggleLikeCommunityPost(postId);
  };

  const handleCopyLink = (postTitle: string, postId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/alumni-dashboard/community#${postId}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url);
      }
    }
    showToast(`Discussion link for "${postTitle}" copied to clipboard!`);
  };

  const handleDeletePost = (postId: string, title: string) => {
    deleteCommunityPost(postId);
    showToast(`Removed post: "${title}".`);
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
    showToast("Your response was published to the community thread.");
  };

  const getCategoryBadge = (cat: CommunityCategory) => {
    switch (cat) {
      case "career_advice":
        return {
          label: "Career Advice",
          style: "bg-blue-50 text-[#0a66c2] border-blue-200",
          icon: BookOpen,
        };
      case "technical":
        return {
          label: "Technical Knowledge",
          style: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Sparkles,
        };
      case "achievement":
        return {
          label: "Mentee Achievement",
          style: "bg-emerald-50 text-[#057642] border-emerald-200",
          icon: Award,
        };
      case "event":
        return {
          label: "Event Announcement",
          style: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Calendar,
        };
      case "opportunity":
        return {
          label: "Verified Opportunity",
          style: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Briefcase,
        };
      case "interview_prep":
        return {
          label: "Interview Prep",
          style: "bg-teal-50 text-teal-700 border-teal-200",
          icon: MessagesSquare,
        };
      default:
        return {
          label: "General Discussion",
          style: "bg-gray-100 text-gray-700 border-gray-200",
          icon: MessagesSquare,
        };
    }
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
              <span>Campus &amp; Alumni Community Feed</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Exchange industry knowledge, share student achievements, announce campus events, and guide the next generation.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewDiscussionOpen(true)}
            className="bg-[#0a66c2] hover:bg-[#004182] text-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create Post</span>
          </Button>
        </div>

        {/* Filter Strip */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "All Feed" },
              { id: "career_advice", label: "Career Advice" },
              { id: "technical", label: "Technical Knowledge" },
              { id: "achievement", label: "Achievements" },
              { id: "event", label: "Events & Talks" },
              { id: "opportunity", label: "Opportunities" },
              { id: "interview_prep", label: "Interview Prep" },
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
              placeholder="Search feed, authors, tags..."
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
          <h3 className="text-sm font-bold text-gray-900">No community posts in this category</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Share technical advice, an event announcement, or career advice with students.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewDiscussionOpen(true)}
            className="mt-4 text-xs bg-[#0a66c2]"
          >
            + Create Post
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isCommentsOpen = Boolean(expandedComments[post.id]);
            const replyValue = replyTextMap[post.id] || "";
            const isMine =
              post.authorId === currentAlumni.id ||
              post.authorName === currentAlumni.name;
            const badgeInfo = getCategoryBadge(post.category);
            const CategoryIcon = badgeInfo.icon;

            return (
              <div
                key={post.id}
                id={post.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:border-[#b2d5f8] transition-colors"
              >
                {/* Author Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={post.authorName} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-gray-900">{post.authorName}</h4>
                        {post.authorType === "alumni" ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#057642] bg-[#eef8f1] px-1.5 py-0.2 rounded border border-[#bfe3c9]">
                            <ShieldCheck size={10} /> Alumni Mentor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            Student Member
                          </span>
                        )}
                        {isMine && (
                          <span className="text-[10px] font-semibold text-gray-400">
                            (You)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">{post.authorRole}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1",
                      badgeInfo.style
                    )}
                  >
                    <CategoryIcon size={11} />
                    <span>{badgeInfo.label}</span>
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
                        className="text-[11px] font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    {/* Like Action */}
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 font-medium transition-colors",
                        post.likedByMe
                          ? "text-[#0a66c2] font-semibold"
                          : "text-gray-600 hover:text-[#0a66c2]"
                      )}
                    >
                      <ThumbsUp
                        size={14}
                        className={post.likedByMe ? "fill-current text-[#0a66c2]" : ""}
                      />
                      <span>{post.likes} Helpful</span>
                    </button>

                    {/* Comment Action */}
                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span>{post.comments.length} Responses</span>
                    </button>

                    {/* Share / Copy Link Action */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(post.title, post.id)}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-[#0a66c2] font-medium transition-colors"
                      title="Copy link to post"
                    >
                      <Share2 size={13} />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Author delete option */}
                    {isMine && (
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    <span className="text-[11px] text-gray-400">
                      {new Date(post.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Comments Thread Section */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div className="space-y-2.5">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-1">
                          No responses yet. Be the first to share your thoughts or answer questions!
                        </p>
                      ) : (
                        post.comments.map((comment) => (
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
                        ))
                      )}
                    </div>

                    {/* Comment Composer */}
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
                          placeholder="Write an encouraging response, answer, or mentor tip..."
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
