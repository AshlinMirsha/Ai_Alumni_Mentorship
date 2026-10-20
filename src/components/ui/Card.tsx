import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  border?: boolean;
  variant?: "default" | "glass" | "glass-elevated" | "flat" | "soft";
}

const paddingClasses = {
  none: "",
  sm: "p-3.5 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

const variantClasses = {
  default: "bg-white border-[#E7E7E7] shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
  glass: "bg-white/90 backdrop-blur-md border-[#E7E7E7]",
  "glass-elevated": "bg-white border-[#E7E7E7] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
  flat: "bg-white border-[#E7E7E7] shadow-none",
  soft: "bg-[#F4F4F4] border-[#E7E7E7] shadow-none",
};

export function Card({
  padding = "md",
  hover = false,
  border = true,
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl relative",
        variantClasses[variant],
        border && "border",
        paddingClasses[padding],
        hover &&
          "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] hover:border-[#D1D1D1] cursor-pointer",
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
    <div className={cn("flex items-start justify-between gap-3 pb-3 border-b border-[#E7E7E7]", className)} {...props}>
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
        "flex items-center gap-2 pt-3.5 mt-3.5 border-t border-[#E7E7E7]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
