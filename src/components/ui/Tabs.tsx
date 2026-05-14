"use client";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto bg-white/70 dark:bg-white/5 p-1 rounded-xl border border-slate-200/70 dark:border-white/10 shadow-sm", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
            active === tab.id
              ? "bg-slate-950 dark:bg-brand-400 text-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "text-xs rounded-full px-1.5 py-0.5 font-semibold",
              active === tab.id
                ? "bg-white/15 dark:bg-slate-950/15 text-white dark:text-slate-950"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
