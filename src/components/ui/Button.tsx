"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactElement, Children, cloneElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "glass" | "circle";
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
    "bg-[#090909] text-white border border-[#090909] hover:bg-[#242424] active:bg-black shadow-[0_1px_2px_rgba(0,0,0,0.12)] font-medium tracking-tight [&_*]:!text-white",
  secondary:
    "bg-white text-[#090909] border border-[#E7E7E7] hover:bg-[#F4F4F4] hover:border-[#D1D1D1] active:bg-[#EBEBEB] font-medium tracking-tight shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
  glass:
    "bg-white/90 backdrop-blur-md text-[#090909] border border-[#E7E7E7] hover:bg-white font-medium tracking-tight shadow-xs",
  ghost:
    "bg-transparent text-[#454545] border-0 hover:bg-black/[0.04] hover:text-[#090909] active:bg-black/[0.08] font-medium tracking-tight",
  outline:
    "bg-transparent text-[#090909] border border-[#E7E7E7] hover:bg-[#F4F4F4] hover:border-[#090909] active:bg-[#EBEBEB] font-medium tracking-tight",
  danger:
    "bg-[#242424] text-white border border-[#242424] hover:bg-black active:bg-[#000000] font-medium tracking-tight [&_*]:!text-white",
  circle:
    "w-9 h-9 p-0 rounded-full bg-[#090909] text-white border border-[#090909] hover:bg-[#242424] active:bg-black flex items-center justify-center shrink-0 [&_*]:!text-white shadow-xs",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-[34px] px-3.5 text-xs gap-1.5 rounded-full font-medium",
  md: "h-[40px] px-4 sm:px-5 text-sm gap-2 rounded-full font-medium",
  lg: "h-[46px] px-6 sm:px-7 text-sm sm:text-base gap-2.5 rounded-full font-medium",
};

const baseClass = (variant: Variant, size: Size, fullWidth: boolean, className?: string) =>
  cn(
    "inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#090909] focus-visible:ring-offset-2",
    variantClasses[variant],
    variant !== "circle" && sizeClasses[size],
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
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
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
