import { type HTMLAttributes } from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-14 w-14 text-base",
};

// Professional palette for avatars without images
const COLORS = [
  "bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]",
  "bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]",
  "bg-[#f0f2fe] text-[#4338ca] border border-[#d3d8fd]",
  "bg-[#fff8ea] text-[#915907] border border-[#fde5b2]",
  "bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]",
  "bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4]",
  "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = getColor(name);

  if (src) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-semibold select-none",
        sizeClasses[size],
        colorClass,
        className
      )}
      aria-label={name}
      {...props}
    >
      {initials}
    </div>
  );
}
