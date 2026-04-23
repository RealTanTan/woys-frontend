import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm",
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
    brand: "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400",
    green: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    orange: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
    purple: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
  };

  return (
    <Card className="flex items-center gap-4">
      {icon && (
        <div className={cn("p-3 rounded-xl", colorMap[color] || colorMap.brand)}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}
