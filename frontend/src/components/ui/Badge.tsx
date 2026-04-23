import { cn } from "@/lib/utils";

type Color = "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  className?: string;
}

const colors: Record<Color, string> = {
  blue:   "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  green:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  purple: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  gray:   "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function Badge({ children, color = "gray", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", colors[color], className)}>
      {children}
    </span>
  );
}
