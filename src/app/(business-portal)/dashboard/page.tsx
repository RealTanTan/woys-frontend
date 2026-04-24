"use client";
/*
 * PAGE: Dashboard
 * Shows plan usage, key stats, AI suggestions, list growth chart, recent broadcasts, unread messages.
 *
 * DATA (currently mock — swap when backend is ready):
 *   currentOrg   → GET /api/org            (getOrg in api.ts)
 *   broadcasts   → GET /api/broadcasts     (getBroadcasts in api.ts)
 *   conversations→ GET /api/conversations  (getConversations in api.ts)
 *   suggestions  → GET /api/ai/suggestions (getAiSuggestions in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getOrg, getBroadcasts, getConversations, getAiSuggestions } from "@/lib/api";
 *   useEffect(() => { getOrg().then(setOrg); }, []);
 *
 * AI-05: Approve converts suggestion to scheduled campaign (POST /api/broadcasts).
 *        Edit opens /broadcasts/new with message pre-filled.
 *        Dismiss calls DELETE /api/ai/suggestions/:id — backend logs for feedback loop.
 * AN-02: List growth chart — GET /api/analytics/growth?period=weekly
 */
import { useState } from "react";
import { MessageSquare, Users, Radio, TrendingUp, CheckCircle, AlertCircle, Sparkles, Check, Pencil, X, TrendingDown } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { currentOrg, broadcasts, conversations, getAiSuggestions } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatRelative } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AiPromoSuggestion } from "@/types";

// Mock weekly list growth data — replace with GET /api/analytics/growth?period=weekly
const GROWTH_DATA = [
  { week: "Mar 31", added: 18, removed: 2 },
  { week: "Apr 7",  added: 24, removed: 3 },
  { week: "Apr 14", added: 31, removed: 1 },
  { week: "Apr 21", added: 19, removed: 4 },
  { week: "Apr 28", added: 27, removed: 2 },
];

function GrowthChart() {
  const max = Math.max(...GROWTH_DATA.map(d => d.added));
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block" /> Added</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Removed</span>
      </div>
      <div className="flex items-end gap-2 h-24">
        {GROWTH_DATA.map((d) => (
          <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-20">
              <div
                className="flex-1 bg-brand-500 rounded-t-md transition-all"
                style={{ height: `${(d.added / max) * 100}%` }}
                title={`+${d.added} added`}
              />
              <div
                className="flex-1 bg-red-400 rounded-t-md transition-all"
                style={{ height: `${(d.removed / max) * 100}%` }}
                title={`-${d.removed} removed`}
              />
            </div>
            <p className="text-[10px] text-slate-400">{d.week}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> +{GROWTH_DATA.reduce((s,d) => s + d.added, 0)} this month
        </span>
        <span className="text-red-500 font-medium flex items-center gap-1">
          <TrendingDown className="w-3 h-3" /> -{GROWTH_DATA.reduce((s,d) => s + d.removed, 0)} removed
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const usagePct = Math.round((currentOrg.messages_used / currentOrg.messages_limit) * 100);
  const usageColor = usagePct >= 80 ? "bg-red-500" : usagePct >= 60 ? "bg-amber-500" : "bg-brand-500";
  const recentBroadcasts = broadcasts.filter(b => b.status === "sent").slice(0, 3);
  const recentConvs = conversations.filter(c => c.unread_count > 0).slice(0, 4);

  const [suggestions, setSuggestions] = useState<AiPromoSuggestion[]>(getAiSuggestions());
  const [approvedIdx, setApprovedIdx] = useState<number | null>(null);

  const handleApprove = (s: AiPromoSuggestion, idx: number) => {
    // TODO: createBroadcast({ name: s.title, message: s.body, audience_type: "all", scheduled_at: null }) from api.ts
    setApprovedIdx(idx);
    setTimeout(() => {
      setSuggestions(prev => prev.filter((_, i) => i !== idx));
      setApprovedIdx(null);
    }, 1200);
  };

  const handleEdit = (s: AiPromoSuggestion) => {
    // Pass message body to broadcast builder via URL param
    router.push(`/broadcasts/new?msg=${encodeURIComponent(s.body)}`);
  };

  const handleDismiss = (idx: number) => {
    // TODO: dismissAiSuggestion(suggestion.id) from api.ts — backend logs for feedback loop (AI-06)
    setSuggestions(prev => prev.filter((_, i) => i !== idx));
  };

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
            <div className="h-2.5 rounded-full bg-white transition-all" style={{ width: `${usagePct}%` }} />
          </div>
          {usagePct >= 80 && (
            <p className="text-yellow-200 text-xs mt-2 font-medium">⚠ {usagePct >= 100 ? "Plan limit reached — upgrade to keep sending." : `At ${usagePct}% of your plan limit — consider upgrading soon.`}</p>
          )}
          {usagePct < 80 && (
            <p className="text-brand-200 text-xs mt-2">{(currentOrg.messages_limit - currentOrg.messages_used).toLocaleString()} messages remaining · Resets May 1</p>
          )}
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Contacts" value={currentOrg.contacts_count} icon={<Users className="w-5 h-5" />} color="brand" />
          <StatCard label="Messages Sent" value={currentOrg.messages_used.toLocaleString()} icon={<MessageSquare className="w-5 h-5" />} color="green" />
          <StatCard label="Broadcasts" value={broadcasts.length} sub="this month" icon={<Radio className="w-5 h-5" />} color="purple" />
          <StatCard label="Delivery Rate" value="97.2%" sub="+1.4% vs last month" icon={<TrendingUp className="w-5 h-5" />} color="orange" />
        </div>

        {/* AI Suggestions (AI-05) */}
        {suggestions.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">AI Campaign Suggestions</h2>
              <Badge color="blue">New</Badge>
            </div>
            <div className="space-y-3">
              {suggestions.map((s, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border transition-all ${approvedIdx === idx ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"}`}>
                  {approvedIdx === idx ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                      <Check className="w-4 h-4" /> Campaign scheduled! Redirecting to broadcasts...
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{s.title}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">{s.body}</p>
                          <p className="text-xs text-slate-400 italic">💡 {s.reason}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(s, idx)}>
                          <Check className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(s)}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDismiss(idx)} className="text-slate-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" /> Dismiss
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

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

          {/* List growth chart (AN-02) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">List Growth</h2>
              <Badge color="green">Weekly</Badge>
            </div>
            <GrowthChart />
          </Card>
        </div>

        {/* Unread messages */}
        {recentConvs.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Unread Messages</h2>
              <Link href="/messages"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium shrink-0">{conv.unread_count}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

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
