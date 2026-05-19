"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, MessageSquare, Radio,
  Settings, LogOut, Zap, GitBranch, BarChart3, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockLogout, getUser, isDemoSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/contacts",     label: "Contacts",     icon: Users },
  { href: "/messages",     label: "Messages",     icon: MessageSquare },
  { href: "/broadcasts",   label: "Campaigns",    icon: Radio },
  { href: "/flows",        label: "Automations",  icon: GitBranch },
  { href: "/analytics",    label: "Analytics",    icon: BarChart3 },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Demo User");
  const [userOrg, setUserOrg] = useState("Demo workspace");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserName(u.name);
      setUserOrg(u.org ?? "My Business");
    }
    setIsDemo(isDemoSession());
  }, []);

  const handleLogout = () => {
    mockLogout();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-68 shrink-0 h-screen bg-slate-950 text-white border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-950/40">
          <Zap className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-none">WOYS</p>
          <p className="text-xs text-slate-400 leading-none mt-0.5">Revenue SMS</p>
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
                  ? "bg-brand-400 text-slate-950 shadow-lg shadow-brand-950/30"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <p className="text-xs font-semibold text-slate-300 truncate">{userOrg}</p>
        <p className="mt-0.5 text-xs text-slate-500 truncate">{userName}</p>
        {isDemo && (
          <p className="mt-1 text-xs text-brand-400">✦ Demo session</p>
        )}
      </div>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/40 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
