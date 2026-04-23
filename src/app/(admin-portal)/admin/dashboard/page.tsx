"use client";
/*
 * PAGE: Admin Dashboard
 * Overview of the entire WOYS platform — total businesses, SMS sent, open tickets.
 * Shows per-org usage bars and recent ticket list.
 *
 * DATA (currently mock — swap when backend is ready):
 *   organizations → GET /api/admin/organizations  (adminGetOrganizations in api.ts)
 *   tickets       → GET /api/admin/tickets        (adminGetTickets in api.ts)
 *
 * HOW TO CONNECT:
 *   import { adminGetOrganizations, adminGetTickets } from "@/lib/api";
 *   useEffect(() => {
 *     Promise.all([adminGetOrganizations(), adminGetTickets()])
 *       .then(([orgs, tickets]) => { setOrgs(orgs); setTickets(tickets); });
 *   }, []);
 *
 * AUTH: admin routes must be protected server-side — verify Clerk role === "super_admin".
 */
import { Building2, MessageSquare, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminOrganizations, adminTickets } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const totalMessages = adminOrganizations.reduce((s, o) => s + o.messages_used, 0);
  const totalContacts = adminOrganizations.reduce((s, o) => s + o.contacts_count, 0);
  const activeOrgs = adminOrganizations.filter(o => o.status === "active").length;
  const openTickets = adminTickets.filter(t => t.status === "open").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Admin Dashboard" subtitle="Platform overview — WOYS Internal" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Businesses" value={adminOrganizations.length} icon={<Building2 className="w-5 h-5" />} color="brand" />
          <StatCard label="Active Orgs" value={activeOrgs} sub="of 5 total" icon={<CheckCircle className="w-5 h-5" />} color="green" />
          <StatCard label="SMS Sent (all)" value={totalMessages.toLocaleString()} icon={<MessageSquare className="w-5 h-5" />} color="purple" />
          <StatCard label="Open Tickets" value={openTickets} sub="need attention" icon={<AlertCircle className="w-5 h-5" />} color={openTickets > 0 ? "orange" : "green"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Businesses overview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Businesses</h2>
              <Link href="/admin/businesses"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="space-y-3">
              {adminOrganizations.slice(0, 4).map((org) => {
                const pct = Math.round((org.messages_used / org.messages_limit) * 100);
                return (
                  <Link key={org.id} href={`/admin/businesses/${org.id}`}>
                    <div className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{org.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{org.plan} plan · {org.contacts_count} contacts</p>
                        </div>
                        <Badge color={org.status === "active" ? "green" : org.status === "trial" ? "yellow" : "red"}>
                          {org.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{pct}% used</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Recent tickets */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Support Tickets</h2>
              <Link href="/admin/tickets"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="space-y-3">
              {adminTickets.slice(0, 4).map((t) => (
                <div key={t.id} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{t.subject}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.org_name} · {formatDate(t.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 items-end">
                      <Badge color={t.status === "open" ? "red" : t.status === "in_progress" ? "yellow" : "green"}>
                        {t.status.replace("_", " ")}
                      </Badge>
                      <Badge color={t.priority === "high" ? "red" : t.priority === "medium" ? "yellow" : "gray"}>
                        {t.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Platform stats */}
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Plan Distribution</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {["trial", "starter", "growth", "pro", "enterprise"].map(plan => {
              const count = adminOrganizations.filter(o => o.plan === plan).length;
              return (
                <div key={plan} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">{plan}</p>
                </div>
              );
            })}
          </div>
        </Card>

      </main>
    </div>
  );
}
