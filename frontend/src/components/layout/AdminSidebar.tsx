"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Ticket, Settings, LogOut, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockLogout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/admin/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/businesses",  label: "Businesses",  icon: Building2 },
  { href: "/admin/tickets",     label: "Tickets",     icon: Ticket },
  { href: "/admin/settings",    label: "Settings",    icon: Settings },
];

export function AdminSidebar() {
  const path = usePathname();
  const router = useRouter();

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-slate-950 border-r border-slate-800">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-none">WOYS</p>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Admin Portal</p>
        </div>
      </div>

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
                  ? "bg-brand-600/20 text-brand-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => { mockLogout(); router.push("/admin/login"); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
