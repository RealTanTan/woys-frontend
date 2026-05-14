import { cn } from "@/lib/utils";

type Color = "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  className?: string;
}

const colors: Record<Color, string> = {
  blue:   "bg-brand-100/90 text-brand-800 ring-brand-200 dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-800/60",
  green:  "bg-emerald-100/90 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60",
  yellow: "bg-amber-100/90 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/60",
  red:    "bg-red-100/90 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900/60",
  purple: "bg-indigo-100/90 text-indigo-800 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900/60",
  gray:   "bg-slate-100/90 text-slate-700 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10",
  orange: "bg-orange-100/90 text-orange-800 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-900/60",
};

export function Badge({ children, color = "gray", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1", colors[color], className)}>
      {children}
    </span>
  );
}
