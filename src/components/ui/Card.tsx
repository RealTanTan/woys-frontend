import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn(
      "bg-white/90 dark:bg-slate-950/70 border border-slate-200/70 dark:border-white/10 rounded-2xl shadow-sm transition-all duration-200",
      padding && "p-5",
      className
    )}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, sub, icon, color = "brand" }: StatCardProps) {
const colorMap: Record<string, string> = {
    brand: "bg-brand-100/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200/70 dark:ring-brand-800/50",
    green: "bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200/70 dark:ring-emerald-900/60",
    orange: "bg-amber-100/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200/70 dark:ring-amber-900/60",
    red: "bg-red-100/80 dark:bg-red-950/50 text-red-700 dark:text-red-300 ring-1 ring-red-200/70 dark:ring-red-900/60",
    purple: "bg-indigo-100/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200/70 dark:ring-indigo-900/60",
  };

  return (
    <Card className="flex items-center gap-4 hover:border-slate-300 dark:hover:border-white/20">
      {icon && (
        <div className={cn("p-3 rounded-xl", colorMap[color] || colorMap.brand)}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}
