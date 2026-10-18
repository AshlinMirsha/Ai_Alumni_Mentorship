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
    "bg-[#0a66c2] text-white border border-[#0a66c2] hover:bg-[#004182] hover:border-[#004182] active:bg-[#002e5c] shadow-xs",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 active:bg-gray-100",
  ghost:
    "bg-transparent text-gray-600 border border-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
  outline:
    "bg-transparent text-[#0a66c2] border border-[#0a66c2] hover:bg-[#ebf3fb] hover:border-[#004182] active:bg-[#dceaf8]",
  danger:
    "bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800 shadow-xs",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3.5 text-xs gap-1.5 rounded-full font-semibold",
  md: "h-9 px-4 text-sm gap-2 rounded-full font-semibold",
  lg: "h-10 px-5 text-sm gap-2 rounded-full font-semibold",
};

const baseClass = (variant: Variant, size: Size, fullWidth: boolean, className?: string) =>
  cn(
    "inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a66c2] focus-visible:ring-offset-1",
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
