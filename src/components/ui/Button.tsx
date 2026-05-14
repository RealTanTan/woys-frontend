"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   "bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 shadow-sm shadow-slate-950/10",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-100",
  ghost:     "hover:bg-white/70 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300",
  danger:    "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-900/15",
  outline:   "border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.99]",
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
