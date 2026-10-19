"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactElement, Children, cloneElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#2166A5] !text-white text-white border-0 hover:bg-[#194F82] active:bg-[#143F68] transition-colors duration-150 shadow-none [&_*]:!text-white [&_*]:text-white",
  secondary:
    "bg-white text-[#252525] border border-[#D5D9DE] hover:bg-[#F5F7FA] hover:border-[#C5C9CE] hover:text-[#252525] active:bg-[#ECEFF3] transition-colors duration-150 shadow-none",
  ghost:
    "bg-transparent text-gray-600 border-0 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transition-colors duration-150 shadow-none",
  outline:
    "bg-transparent text-[#2166A5] border border-[#2166A5] hover:bg-[#F0F5FA] hover:border-[#194F82] active:bg-[#D0E0EF] transition-colors duration-150 shadow-none",
  danger:
    "bg-red-600 !text-white text-white border-0 hover:bg-red-700 active:bg-red-800 transition-colors duration-150 shadow-none",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-[38px] px-4 text-xs sm:text-sm gap-1.5 rounded-[8px] font-medium",
  md: "h-[40px] px-5 text-sm gap-2 rounded-[8px] font-medium",
  lg: "h-[44px] px-6 sm:px-7 text-sm gap-2 rounded-[8px] font-medium",
};

const baseClass = (variant: Variant, size: Size, fullWidth: boolean, className?: string) =>
  cn(
    "inline-flex items-center justify-center transition-colors duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2166A5] focus-visible:ring-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      asChild = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = baseClass(variant, size, fullWidth, className);

    if (asChild) {
      const child = Children.only(children) as ReactElement<{ className?: string; children?: React.ReactNode }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          classes,
          "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none"
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
