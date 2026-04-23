"use client";
/*
 * PAGE: Dashboard
 * Shows plan usage, key stats, recent broadcasts, unread messages, quick actions.
 *
 * DATA (currently mock — swap when backend is ready):
 *   currentOrg   → GET /api/org            (getOrg in api.ts)
 *   broadcasts   → GET /api/broadcasts     (getBroadcasts in api.ts)
 *   conversations→ GET /api/conversations  (getConversations in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getOrg, getBroadcasts, getConversations } from "@/lib/api";
 *   Add useEffect + useState for each, e.g.:
 *     const [org, setOrg] = useState(null);
 *     useEffect(() => { getOrg().then(setOrg); }, []);
 */
import { MessageSquare, Users, Radio, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { currentOrg, broadcasts, conversations } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatRelative } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const usagePct = Math.round((currentOrg.messages_used / currentOrg.messages_limit) * 100);
  const usageColor = usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-brand-500";
  const recentBroadcasts = broadcasts.filter(b => b.status === "sent").slice(0, 3);
  const recentConvs = conversations.filter(c => c.unread_count > 0).slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Dashboard" subtitle={`Welcome back — ${currentOrg.name}`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Plan usage banner */}
        <Card className="bg-gradient-to-r from-brand-600 to-brand-500 text-white border-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-brand-100 text-sm font-medium">Plan · {currentOrg.plan.charAt(0).toUpperCase() + currentOrg.plan.slice(1)}</p>
              <p className="text-2xl font-bold mt-0.5">
                {currentOrg.messages_used.toLocaleString()}
                <span className="text-brand-200 text-base font-normal"> / {currentOrg.messages_limit.toLocaleString()} SMS</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{usagePct}%</p>
              <p className="text-brand-200 text-sm">used this month</p>
            </div>
          </div>
          <div className="w-full bg-brand-400/40 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="text-brand-200 text-xs mt-2">
            {(currentOrg.messages_limit - currentOrg.messages_used).toLocaleString()} messages remaining · Resets May 1
          </p>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Contacts" value={currentOrg.contacts_count} icon={<Users className="w-5 h-5" />} color="brand" />
          <StatCard label="Messages Sent" value={currentOrg.messages_used.toLocaleString()} icon={<MessageSquare className="w-5 h-5" />} color="green" />
          <StatCard label="Broadcasts" value={broadcasts.length} sub="this month" icon={<Radio className="w-5 h-5" />} color="purple" />
          <StatCard label="Delivery Rate" value="97.2%" sub="+1.4% vs last month" icon={<TrendingUp className="w-5 h-5" />} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent broadcasts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Broadcasts</h2>
              <Link href="/broadcasts"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="space-y-3">
              {recentBroadcasts.map((b) => {
                const delivRate = b.total_recipients ? Math.round((b.delivered_count / b.total_recipients) * 100) : 0;
                return (
                  <Link key={b.id} href={`/broadcasts/${b.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                      <div className="p-2 bg-brand-50 dark:bg-brand-950/40 rounded-lg">
                        <Radio className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{b.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{b.total_recipients} recipients · {delivRate}% delivered</p>
                      </div>
                      {delivRate >= 95
                        ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Unread messages */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Unread Messages</h2>
              <Link href="/messages"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            {recentConvs.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">All caught up!</p>
            ) : (
              <div className="space-y-3">
                {recentConvs.map((conv) => (
                  <Link key={conv.id} href={`/messages/${conv.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 text-sm font-semibold shrink-0">
                        {conv.contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{conv.contact.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conv.last_message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-slate-400">{formatRelative(conv.last_message_at)}</span>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/broadcasts/new"><Button size="md"><Radio className="w-4 h-4" /> New Broadcast</Button></Link>
            <Link href="/contacts"><Button variant="secondary" size="md"><Users className="w-4 h-4" /> Add Contact</Button></Link>
            <Link href="/messages"><Button variant="outline" size="md"><MessageSquare className="w-4 h-4" /> New Message</Button></Link>
          </div>
        </Card>

      </main>
    </div>
  );
}
