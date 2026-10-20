"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leadingIcon,
      trailingElement,
      id,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-gray-700 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            style={{ backgroundColor: "#FFFFFF", ...(props.style || {}) }}
            className={cn(
              "w-full rounded-xl border bg-white text-sm text-[#090909] placeholder:text-[#737373]",
              "px-3.5 py-2.5 h-[44px]",
              "border-[#E7E7E7] transition-all duration-150",
              "focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]",
              "disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed",
              error && "border-red-500 focus:border-red-500 focus:ring-red-400/20",
              leadingIcon && "pl-10",
              trailingElement && "pr-10",
              className
            )}
            {...props}
          />

          {trailingElement && (
            <span className="absolute right-3.5 flex items-center justify-center">
              {trailingElement}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 mt-0.5">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
