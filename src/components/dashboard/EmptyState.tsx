import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-300 rounded-lg bg-white shadow-xs ${className}`}
    >
      {icon && (
        <div className="h-12 w-12 rounded-full bg-[#ebf3fb] border border-[#d0e2f5] flex items-center justify-center text-[#0a66c2] mb-3.5 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-5 leading-relaxed">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {actionLabel && actionHref && (
          <Button variant="primary" size="sm" asChild className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182]">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button variant="primary" size="sm" onClick={onAction} className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182]">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="secondary" size="sm" onClick={onSecondaryAction} className="rounded-full font-semibold border-gray-300 text-gray-700">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
