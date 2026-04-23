"use client";
/*
 * PAGE: Broadcast Detail & Analytics  (/broadcasts/[id])
 * Shows message body, delivery stats (recipients / sent / delivered / failed),
 * a visual delivery progress bar, and actions for scheduled/draft broadcasts.
 *
 * DATA (currently mock — swap when backend is ready):
 *   broadcast → GET /api/broadcasts/:id  (getBroadcast in api.ts)
 *   cancel    → DELETE /api/broadcasts/:id (cancelBroadcast in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getBroadcast, cancelBroadcast } from "@/lib/api";
 *   const [broadcast, setBroadcast] = useState(null);
 *   useEffect(() => { getBroadcast(id).then(setBroadcast); }, [id]);
 */
import { use } from "react";
import { ArrowLeft, Radio, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { broadcasts } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BroadcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const b = broadcasts.find(br => br.id === id);

  if (!b) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <p>Broadcast not found</p>
        <Link href="/broadcasts" className="text-brand-600 mt-2 text-sm hover:underline">← Back</Link>
      </div>
    );
  }

  const delivRate = b.total_recipients ? Math.round((b.delivered_count / b.total_recipients) * 100) : 0;
  const failRate = b.total_recipients ? Math.round((b.failed_count / b.total_recipients) * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title={b.name}
        subtitle="Broadcast Detail"
        actions={
          <Link href="/broadcasts">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Status row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge color={b.status === "sent" ? "green" : b.status === "scheduled" ? "blue" : b.status === "draft" ? "gray" : "yellow"}>
            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
          </Badge>
          <Badge color="gray">
            {b.audience_type === "vip" ? "VIP Customers" : b.audience_type === "new_customers" ? "New Customers" : b.audience_type === "winback" ? "Win-back" : "All Contacts"}
          </Badge>
          {b.sent_at && <span className="text-sm text-slate-500 dark:text-slate-400">Sent {formatDate(b.sent_at)}</span>}
          {b.scheduled_at && b.status === "scheduled" && <span className="text-sm text-slate-500 dark:text-slate-400">Scheduled for {formatDate(b.scheduled_at)}</span>}
        </div>

        {/* Message preview */}
        <Card>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Message</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{b.message}</p>
          <p className="text-xs text-slate-400 mt-3">{b.message.length} characters · 1 SMS segment</p>
        </Card>

        {/* Analytics */}
        {b.status === "sent" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Recipients", value: b.total_recipients, icon: <Users className="w-5 h-5" />, color: "brand" },
                { label: "Sent",       value: b.sent_count,       icon: <Radio className="w-5 h-5" />, color: "brand" },
                { label: "Delivered",  value: b.delivered_count,  icon: <CheckCircle className="w-5 h-5" />, color: "green" },
                { label: "Failed",     value: b.failed_count,     icon: <XCircle className="w-5 h-5" />, color: b.failed_count > 0 ? "red" : "green" },
              ].map(({ label, value, icon, color }) => {
                const colorMap: Record<string, string> = {
                  brand: "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400",
                  green: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
                  red:   "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
                };
                return (
                  <Card key={label} className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Delivery bar */}
            <Card>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Delivery Breakdown</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Delivered</span><span>{delivRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${delivRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Failed</span><span>{failRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${failRate}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                {b.failed_count > 0 ? `${b.failed_count} messages failed — likely invalid or unreachable numbers.` : "All messages delivered successfully."}
              </p>
            </Card>
          </>
        )}

        {b.status === "scheduled" && (
          <div className="flex gap-3">
            <Button variant="outline"><Clock className="w-4 h-4" /> Edit Schedule</Button>
            <Button variant="danger">Cancel Broadcast</Button>
          </div>
        )}

        {b.status === "draft" && (
          <div className="flex gap-3">
            <Link href={`/broadcasts/new`}>
              <Button variant="secondary">Edit Draft</Button>
            </Link>
            <Button>Send Now</Button>
          </div>
        )}
      </main>
    </div>
  );
}
