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

// Strict monochrome palette for avatars
const COLORS = [
  "bg-[#090909] text-white border-[#090909]",
  "bg-[#242424] text-white border-[#242424]",
  "bg-[#454545] text-white border-[#454545]",
  "bg-[#F4F4F4] text-[#090909] border-[#E7E7E7]",
  "bg-[#EBEBEB] text-[#242424] border-[#D1D1D1]",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name = "", src, size = "md", className, ...props }: AvatarProps) {
  const safeName = (name && name.trim().length > 0) ? name.trim() : "Student";
  const initials = getInitials(safeName);
  const colorClass = getColor(safeName);

  if (src) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden shrink-0 border border-[#E7E7E7] bg-[#F4F4F4]",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={safeName}
          className="w-full h-full object-cover grayscale contrast-105"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-semibold select-none border",
        sizeClasses[size],
        colorClass,
        className
      )}
      aria-label={safeName}
      {...props}
    >
      {initials}
    </div>
  );
}
