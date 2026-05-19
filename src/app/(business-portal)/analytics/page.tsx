"use client";
import { TrendingUp, MessageSquare, Users, Radio } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { useDemoStore } from "@/lib/demo-store";

export default function AnalyticsPage() {
  const { contacts, broadcasts } = useDemoStore();
  const sentBroadcasts = broadcasts.filter(b => b.status === "sent");
  const totalSent = broadcasts.reduce((s, b) => s + (b.sent_count ?? 0), 0);
  const totalDelivered = broadcasts.reduce((s, b) => s + (b.delivered_count ?? 0), 0);
  const deliveryRate = totalSent > 0 ? `${Math.round((totalDelivered / totalSent) * 100)}%` : "—";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Analytics" subtitle="Campaign performance and audience insights" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Contacts" value={contacts.length} sub="in your list" icon={<Users className="w-5 h-5" />} color="brand" />
          <StatCard label="Campaigns Sent" value={sentBroadcasts.length} sub="all time" icon={<Radio className="w-5 h-5" />} color="purple" />
          <StatCard label="Messages Sent" value={totalSent.toLocaleString()} sub="this period" icon={<MessageSquare className="w-5 h-5" />} color="green" />
          <StatCard label="Delivery Rate" value={deliveryRate} sub={totalSent > 0 ? "healthy" : "no data yet"} icon={<TrendingUp className="w-5 h-5" />} color="orange" />
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 flex flex-col items-center justify-center text-center gap-3">
          <TrendingUp className="w-12 h-12 text-slate-200 dark:text-slate-700" />
          <p className="font-semibold text-slate-900 dark:text-slate-100">Detailed analytics coming soon</p>
          <p className="text-sm text-slate-400 max-w-sm">Send your first campaign to start seeing open rates, click-throughs, and customer engagement over time.</p>
        </div>
      </main>
    </div>
  );
}
