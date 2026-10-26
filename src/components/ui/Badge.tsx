import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "neutral"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "indigo"
  | "gray"
  | "glass"
  | "dark"
  | "pill";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

// Strict monochrome palette for badges - no chromatic colors
const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#F4F4F4] text-[#242424] border-[#E7E7E7]",
  neutral: "bg-[#F4F4F4] text-[#090909] border-[#E7E7E7] font-medium",
  gray: "bg-[#F4F4F4] text-[#454545] border-[#E7E7E7]",
  glass: "bg-white/80 text-[#242424] border-[#E7E7E7] backdrop-blur-xs",
  dark: "bg-[#090909] text-white border-[#090909]",
  pill: "bg-white text-[#242424] border-[#E7E7E7] shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
  // Map former chromatic variants to neutral tones to guarantee strict monochrome across the codebase
  blue: "bg-[#F4F4F4] text-[#090909] border-[#E7E7E7] font-medium",
  green: "bg-[#F4F4F4] text-[#090909] border-[#E7E7E7] font-medium",
  amber: "bg-[#F4F4F4] text-[#242424] border-[#E7E7E7]",
  red: "bg-[#F4F4F4] text-[#242424] border-[#242424]",
  indigo: "bg-[#090909] text-white border-[#090909]",
};

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border rounded-full font-medium tracking-tight select-none",
        size === "sm" ? "text-[10px] sm:text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
