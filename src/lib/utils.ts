import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatResponseRate(rate: number): string {
  return `${rate}%`;
}

export function getAvailabilityLabel(
  availability: "available" | "limited" | "unavailable"
): string {
  switch (availability) {
    case "available":
      return "Open to Mentoring";
    case "limited":
      return "Limited Availability";
    case "unavailable":
      return "Not Available";
  }
}

export function getAvailabilityColor(
  availability: "available" | "limited" | "unavailable"
): string {
  switch (availability) {
    case "available":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "limited":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "unavailable":
      return "text-slate-500 bg-slate-50 border-slate-200";
  }
}

export function getMentorshipStatusColor(
  status: "pending" | "active" | "completed" | "declined"
): string {
  switch (status) {
    case "active":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "pending":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "completed":
      return "text-indigo-700 bg-indigo-50 border-indigo-200";
    case "declined":
      return "text-slate-500 bg-slate-50 border-slate-200";
  }
}
