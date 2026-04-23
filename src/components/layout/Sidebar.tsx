"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, MessageSquare, Radio,
  FileText, Settings, LogOut, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockLogout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/contacts",   label: "Contacts",    icon: Users },
  { href: "/messages",   label: "Messages",    icon: MessageSquare },
  { href: "/broadcasts", label: "Broadcasts",  icon: Radio },
  { href: "/templates",  label: "Templates",   icon: FileText },
  { href: "/settings",   label: "Settings",    icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    mockLogout();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-lg leading-none">WOYS</p>
          <p className="text-xs text-slate-400 leading-none mt-0.5">SMS Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
