"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Bell, Menu, Zap, LayoutDashboard, Users, MessageSquare, Radio, GitBranch, Settings, Building2, Ticket } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { layers } from "@/lib/layers";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

type OverlayPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function getAnchoredPosition(anchor: HTMLElement, preferredWidth: number): OverlayPosition {
  const margin = 12;
  const rect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = viewportWidth < 640 ? viewportWidth - margin * 2 : Math.min(preferredWidth, viewportWidth - margin * 2);
  const left = viewportWidth < 640
    ? margin
    : Math.min(Math.max(rect.right - width, margin), viewportWidth - width - margin);
  const top = Math.min(rect.bottom + 8, viewportHeight - 120);

  return {
    top,
    left,
    width,
    maxHeight: Math.max(220, viewportHeight - top - margin),
  };
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const path = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsPosition, setNotificationsPosition] = useState<OverlayPosition | null>(null);
  const [mobileNavPosition, setMobileNavPosition] = useState<OverlayPosition | null>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const mobileNavButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavPanelRef = useRef<HTMLDivElement>(null);
  const isAdmin = path.startsWith("/admin");
  const mobileHome = isAdmin ? "/admin/dashboard" : "/dashboard";
  const mobileNav = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/businesses", label: "Businesses", icon: Building2 },
        { href: "/admin/tickets", label: "Tickets", icon: Ticket },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/contacts", label: "Contacts", icon: Users },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/broadcasts", label: "Campaigns", icon: Radio },
        { href: "/flows", label: "Flows", icon: GitBranch },
        { href: "/settings", label: "Settings", icon: Settings },
      ];

  const notifications = [
    { title: "2 replies need attention", body: "Priya asked about Saturday availability.", href: "/messages" },
    { title: "Campaign delivered well", body: "Spring League Night Push reached 97% of customers.", href: "/broadcasts/b1" },
    { title: "Your list is growing", body: "27 new customers joined this week.", href: "/contacts" },
  ];

  const updateOverlayPositions = useCallback(() => {
    if (notificationsOpen && notificationsButtonRef.current) {
      setNotificationsPosition(getAnchoredPosition(notificationsButtonRef.current, 360));
    }
    if (mobileNavOpen && mobileNavButtonRef.current) {
      setMobileNavPosition(getAnchoredPosition(mobileNavButtonRef.current, 320));
    }
  }, [mobileNavOpen, notificationsOpen]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedNotification =
        notificationsButtonRef.current?.contains(target) || notificationsPanelRef.current?.contains(target);
      const clickedMobileNav =
        mobileNavButtonRef.current?.contains(target) || mobileNavPanelRef.current?.contains(target);

      if (notificationsOpen && !clickedNotification) {
        setNotificationsOpen(false);
      }
      if (mobileNavOpen && !clickedMobileNav) {
        setMobileNavOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen, notificationsOpen]);

  useEffect(() => {
    updateOverlayPositions();

    if (!mobileNavOpen && !notificationsOpen) return;

    window.addEventListener("resize", updateOverlayPositions);
    window.addEventListener("scroll", updateOverlayPositions, true);
    return () => {
      window.removeEventListener("resize", updateOverlayPositions);
      window.removeEventListener("scroll", updateOverlayPositions, true);
    };
  }, [mobileNavOpen, notificationsOpen, updateOverlayPositions]);

  return (
    <header className="relative flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-white/70 dark:border-white/10 bg-white/75 dark:bg-slate-950/65 backdrop-blur-xl shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <Link href={mobileHome} className="md:hidden w-9 h-9 rounded-xl bg-slate-950 dark:bg-brand-400 text-white dark:text-slate-950 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white truncate">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">{actions}</div>
        <div className="relative">
          <button
            ref={notificationsButtonRef}
            onClick={() => {
              setNotificationsOpen((open) => {
                const next = !open;
                if (next && notificationsButtonRef.current) {
                  setNotificationsPosition(getAnchoredPosition(notificationsButtonRef.current, 360));
                }
                return next;
              });
              setMobileNavOpen(false);
            }}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />}
          </button>
          {notificationsOpen && notificationsPosition && (
            <OverlayPortal>
              <div
                ref={notificationsPanelRef}
                style={{
                  top: notificationsPosition.top,
                  left: notificationsPosition.left,
                  width: notificationsPosition.width,
                  maxHeight: notificationsPosition.maxHeight,
                  zIndex: layers.dropdown,
                }}
                className="fixed overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/20 ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/50 dark:ring-white/10"
              >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Today</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">A few things worth checking.</p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">You are all caught up.</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">New replies and campaign updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-slate-900 dark:focus:bg-slate-900"
                    >
                      <p className="text-sm font-medium text-slate-950 dark:text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">{item.body}</p>
                    </Link>
                  ))}
                </div>
              )}
              </div>
            </OverlayPortal>
          )}
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="relative md:hidden">
          <button
            ref={mobileNavButtonRef}
            onClick={() => {
              setMobileNavOpen((open) => {
                const next = !open;
                if (next && mobileNavButtonRef.current) {
                  setMobileNavPosition(getAnchoredPosition(mobileNavButtonRef.current, 320));
                }
                return next;
              });
              setNotificationsOpen(false);
            }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Menu"
            aria-expanded={mobileNavOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
          {mobileNavOpen && mobileNavPosition && (
            <OverlayPortal>
              <div
                ref={mobileNavPanelRef}
                style={{
                  top: mobileNavPosition.top,
                  left: mobileNavPosition.left,
                  width: mobileNavPosition.width,
                  maxHeight: mobileNavPosition.maxHeight,
                  zIndex: layers.dropdown,
                }}
                className="fixed overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/20 ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/50 dark:ring-white/10"
              >
              {mobileNav.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
              </div>
            </OverlayPortal>
          )}
        </div>
      </div>
    </header>
  );
}
