import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  border?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
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
        "shadow-sm",
        paddingClasses[padding],
        hover &&
          "transition-shadow duration-150 hover:shadow-md cursor-pointer",
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
    <div className={cn("flex items-start justify-between gap-3", className)} {...props}>
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
        "flex items-center gap-2 pt-4 mt-4 border-t border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
