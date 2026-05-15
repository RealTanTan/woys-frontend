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
import { MessageSquare, Users, Radio, TrendingUp, Sparkles, Check, Pencil, X } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getAiSuggestions } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { useDemoStore } from "@/lib/demo-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AiPromoSuggestion } from "@/types";

// Mock weekly list growth data — replace with GET /api/analytics/growth?period=weekly
const GROWTH_DATA = [
  { week: "Apr 13", added: 18, removed: 2 },
  { week: "Apr 20", added: 24, removed: 3 },
  { week: "Apr 27", added: 31, removed: 1 },
  { week: "May 4", added: 19, removed: 4 },
  { week: "May 11", added: 27, removed: 2 },
];

function GrowthChart() {
  const max = Math.max(...GROWTH_DATA.map(d => d.added));
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-24" aria-label="Customer list growth">
        {GROWTH_DATA.map((d) => (
          <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-20">
              <div
                className="flex-1 bg-slate-950 dark:bg-white rounded-t-md transition-all"
                style={{ height: `${(d.added / max) * 100}%` }}
                title={`+${d.added} added`}
              />
              <div
                className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-md transition-all"
                style={{ height: `${(d.removed / max) * 100}%` }}
                title={`-${d.removed} removed`}
              />
            </div>
            <p className="text-[10px] text-slate-400">{d.week}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-900 dark:text-slate-100">+{GROWTH_DATA.reduce((s,d) => s + d.added, 0)} customers this month</span>
        <span className="text-slate-500 dark:text-slate-400">{GROWTH_DATA.reduce((s,d) => s + d.removed, 0)} unsubscribed</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { orgName, messagesUsed, messagesLimit, contacts, broadcasts, conversations, isDemo } = useDemoStore();
  const usagePct = Math.round((messagesUsed / messagesLimit) * 100);
  const recentBroadcasts = broadcasts.filter(b => b.status === "sent").slice(0, 3);
  const recentConvs = conversations.filter(c => c.unread_count > 0).slice(0, 4);

  const [suggestions, setSuggestions] = useState<AiPromoSuggestion[]>(() => isDemo ? [] : getAiSuggestions());
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
      <Topbar title="Today" subtitle={`${orgName} is open for customer replies and campaigns.`} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-fade-up">

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="relative overflow-hidden bg-slate-950 text-white border-white/10 p-6 sm:p-7">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(45,212,179,0.20),transparent_60%)]" />
            <div className="relative max-w-2xl">
              <p className="text-sm font-medium text-brand-200">Most important right now</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {recentConvs.length > 0
                  ? `${recentConvs.length} customer${recentConvs.length > 1 ? "s" : ""} waiting for a reply.`
                  : "Your inbox is clear."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {recentConvs.length === 0 && recentBroadcasts.length === 0
                  ? "Add your first customers and send a campaign to get started."
                  : "Reply while the conversation is warm. Your campaigns are healthy, and you still have room in this month’s SMS plan."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/messages">
                  <Button className="bg-white text-slate-950 hover:bg-slate-200 dark:bg-white dark:text-slate-950">
                    Open Messages
                  </Button>
                </Link>
                <Link href="/broadcasts/new">
                  <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15 dark:text-white">
                    New Campaign
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">SMS this month</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                {messagesUsed.toLocaleString()}
                <span className="text-base font-normal text-slate-500"> / {messagesLimit.toLocaleString()}</span>
              </p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-slate-950 dark:bg-white" style={{ width: `${usagePct}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{(messagesLimit - messagesUsed).toLocaleString()} messages left. Resets June 1.</p>
          </Card>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Customers" value={contacts.length} sub={contacts.length > 0 ? `+${Math.min(contacts.length, 27)} this week` : "Add your first contact"} icon={<Users className="w-5 h-5" />} color="brand" />
          <StatCard label="Delivery Rate" value="97.2%" sub="healthy" icon={<TrendingUp className="w-5 h-5" />} color="green" />
          <StatCard label="Unread Replies" value={recentConvs.reduce((sum, c) => sum + c.unread_count, 0)} sub="needs attention" icon={<MessageSquare className="w-5 h-5" />} color="orange" />
        </div>

        {suggestions.length > 0 && (
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <h2 className="font-semibold text-slate-950 dark:text-white">Recommended next campaign</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">One simple idea based on today&apos;s customer activity.</p>
              </div>
              <Badge color="gray">Smart suggestion</Badge>
            </div>
            <div className="space-y-3">
              {suggestions.slice(0, 1).map((s, idx) => (
                <div key={idx} className={`rounded-2xl border p-4 transition-all ${approvedIdx === idx ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"}`}>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{s.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{s.body}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{s.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleApprove(s, idx)}>
                      <Check className="w-3.5 h-3.5" /> Use This
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(s)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit First
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDismiss(idx)} className="text-slate-500">
                      <X className="w-3.5 h-3.5" /> Not Now
                    </Button>
                  </div>
                  {approvedIdx === idx && (
                    <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">Your campaign is ready.</p>
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
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent campaigns</h2>
              <Link href="/broadcasts"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="space-y-3">
              {recentBroadcasts.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No campaigns sent yet.</p>
              ) : (
                recentBroadcasts.map((b) => {
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
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{delivRate}%</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </Card>

          {/* List growth chart (AN-02) */}
          {!isDemo ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Customer growth</h2>
                <Badge color="gray">This month</Badge>
              </div>
              <GrowthChart />
            </Card>
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Customer growth</h2>
                <Badge color="gray">This month</Badge>
              </div>
              <p className="text-sm text-slate-400 py-6 text-center">Your customer growth chart will appear here.</p>
            </Card>
          )}
        </div>

        {/* Unread messages */}
        {recentConvs.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Replies to answer</h2>
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

      </main>
    </div>
  );
}
