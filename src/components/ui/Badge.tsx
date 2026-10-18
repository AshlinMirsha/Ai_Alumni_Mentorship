import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "indigo"
  | "gray";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  blue: "bg-[#ebf3fb] text-[#0a66c2] border-[#b2d5f8]",
  green: "bg-[#eef8f1] text-[#057642] border-[#bfe3c9]",
  amber: "bg-[#fff8ea] text-[#915907] border-[#fde5b2]",
  red: "bg-[#feeff0] text-[#cc1016] border-[#f9c2c5]",
  indigo: "bg-[#f0f2fe] text-[#4f46e5] border-[#d3d8fd]",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
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
        "inline-flex items-center border rounded font-medium tracking-tight",
        size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
