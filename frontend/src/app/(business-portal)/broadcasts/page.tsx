"use client";
/*
 * PAGE: Broadcasts (Campaign List)
 * Lists all mass SMS campaigns with tabs: All / Sent / Scheduled / Drafts.
 * Top section shows 4 audience channels: VIP, New Customers, Win-back, All Contacts.
 * Clicking a broadcast row opens the analytics detail page (/broadcasts/[id]).
 *
 * DATA (currently mock — swap when backend is ready):
 *   broadcasts → GET /api/broadcasts  (getBroadcasts in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getBroadcasts } from "@/lib/api";
 *   const [broadcasts, setBroadcasts] = useState([]);
 *   useEffect(() => { getBroadcasts().then(setBroadcasts); }, []);
 *
 * NOTE: audience channel contact counts (VIP: 45, New: 22 etc.) are hardcoded here.
 *   Backend should expose GET /api/contacts/counts?by=tag to populate these dynamically.
 */
import { useState } from "react";
import { Plus, Radio, Users, Star, RotateCcw, CheckCircle, Clock, Send, FileText, XCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { broadcasts } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate, formatRelative } from "@/lib/utils";
import Link from "next/link";
import type { Broadcast } from "@/types";

const audienceIcons: Record<string, React.ReactNode> = {
  vip: <Star className="w-4 h-4 text-purple-500" />,
  new_customers: <Users className="w-4 h-4 text-green-500" />,
  winback: <RotateCcw className="w-4 h-4 text-orange-500" />,
  all: <Radio className="w-4 h-4 text-brand-500" />,
  custom: <Users className="w-4 h-4 text-slate-500" />,
};

const audienceLabels: Record<string, string> = {
  vip: "VIP Customers", new_customers: "New Customers", winback: "Win-back", all: "All Contacts", custom: "Custom",
};

function StatusBadge({ status }: { status: Broadcast["status"] }) {
  const map: Record<string, { color: "green" | "blue" | "yellow" | "gray" | "red"; label: string; icon: React.ReactNode }> = {
    sent:      { color: "green",  label: "Sent",      icon: <CheckCircle className="w-3 h-3" /> },
    scheduled: { color: "blue",   label: "Scheduled", icon: <Clock className="w-3 h-3" /> },
    sending:   { color: "yellow", label: "Sending…",  icon: <Send className="w-3 h-3" /> },
    draft:     { color: "gray",   label: "Draft",     icon: <FileText className="w-3 h-3" /> },
    cancelled: { color: "red",    label: "Cancelled", icon: <XCircle className="w-3 h-3" /> },
  };
  const { color, label, icon } = map[status];
  return <Badge color={color}><span className="mr-1">{icon}</span>{label}</Badge>;
}

function BroadcastCard({ b }: { b: Broadcast }) {
  const delivRate = b.total_recipients ? Math.round((b.delivered_count / b.total_recipients) * 100) : 0;

  return (
    <Link href={`/broadcasts/${b.id}`}>
      <div className="p-5 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
              {audienceIcons[b.audience_type]}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{b.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{b.message}</p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <StatusBadge status={b.status} />
            <Badge color="gray">{audienceLabels[b.audience_type]}</Badge>
          </div>
        </div>

        {b.status === "sent" && (
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Recipients", value: b.total_recipients },
              { label: "Sent",       value: b.sent_count },
              { label: "Delivered",  value: `${delivRate}%` },
              { label: "Failed",     value: b.failed_count, red: b.failed_count > 0 },
            ].map(({ label, value, red }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                <p className={`text-base font-bold ${red ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {b.status === "scheduled" && (
          <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Scheduled for {b.scheduled_at ? formatDate(b.scheduled_at) : "—"}
          </p>
        )}

        <p className="text-xs text-slate-400 mt-2">Created {formatDate(b.created_at)}</p>
      </div>
    </Link>
  );
}

export default function BroadcastsPage() {
  const [tab, setTab] = useState("all");

  const tabs = [
    { id: "all",       label: "All",       count: broadcasts.length },
    { id: "sent",      label: "Sent",      count: broadcasts.filter(b => b.status === "sent").length },
    { id: "scheduled", label: "Scheduled", count: broadcasts.filter(b => b.status === "scheduled").length },
    { id: "draft",     label: "Drafts",    count: broadcasts.filter(b => b.status === "draft").length },
  ];

  const filtered = tab === "all" ? broadcasts : broadcasts.filter(b => b.status === tab);

  // Broadcast channels / audience groups summary
  const channels = [
    { id: "vip",           label: "VIP Customers",  icon: <Star className="w-5 h-5" />, color: "purple", count: 45,  sent: 3 },
    { id: "new_customers", label: "New Customers",   icon: <Users className="w-5 h-5" />, color: "green", count: 22, sent: 1 },
    { id: "winback",       label: "Win-back",        icon: <RotateCcw className="w-5 h-5" />, color: "orange", count: 68, sent: 1 },
    { id: "all",           label: "All Contacts",    icon: <Radio className="w-5 h-5" />, color: "blue", count: 248, sent: 2 },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Broadcasts"
        subtitle="Mass SMS campaigns"
        actions={
          <Link href="/broadcasts/new">
            <Button size="sm"><Plus className="w-4 h-4" /> New Broadcast</Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Audience Channels */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Audience Channels</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {channels.map((ch) => {
              const colorMap: Record<string, string> = {
                purple: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
                green:  "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
                orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
                blue:   "bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400",
              };
              return (
                <Card key={ch.id} className="flex flex-col gap-3 cursor-pointer hover:shadow-md transition">
                  <div className={`p-2.5 rounded-xl w-fit ${colorMap[ch.color]}`}>{ch.icon}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{ch.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{ch.count} contacts · {ch.sent} campaigns</p>
                  </div>
                  <Link href="/broadcasts/new">
                    <Button variant="secondary" size="sm" className="w-full">Send Campaign</Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Campaign list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Campaign History</h2>
            <Tabs tabs={tabs} active={tab} onChange={setTab} />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Radio className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No broadcasts in this category</p>
              </div>
            ) : (
              filtered.map(b => <BroadcastCard key={b.id} b={b} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
