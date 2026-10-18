import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  border?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-3.5 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  padding = "md",
  hover = false,
  border = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white",
        border && "border border-gray-200",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
        paddingClasses[padding],
        hover &&
          "transition-all duration-150 hover:border-gray-300 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_3px_8px_rgba(0,0,0,0.06)] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 pb-3 border-b border-gray-100", className)} {...props}>
      {children}
    </div>
  );
}

type CardBodyProps = HTMLAttributes<HTMLDivElement>;
export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

type CardFooterProps = HTMLAttributes<HTMLDivElement>;
export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 pt-3.5 mt-3.5 border-t border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
