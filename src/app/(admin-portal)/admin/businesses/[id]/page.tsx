"use client";
/*
 * PAGE: Admin — Business Detail  (/admin/businesses/[id])
 * Shows one org's profile, SMS usage bar, and admin action buttons
 * (upgrade plan, reset usage, suspend/reactivate).
 *
 * DATA (currently mock — swap when backend is ready):
 *   org      → GET   /api/admin/organizations/:id  (adminGetOrganization in api.ts)
 *   suspend  → PATCH /api/admin/organizations/:id/suspend  (adminSuspendOrg in api.ts)
 *   plan     → PATCH /api/admin/organizations/:id/plan     (adminUpdatePlan in api.ts)
 *
 * HOW TO CONNECT:
 *   import { adminGetOrganization, adminSuspendOrg, adminUpdatePlan } from "@/lib/api";
 *   const [org, setOrg] = useState(null);
 *   useEffect(() => { adminGetOrganization(id).then(setOrg); }, [id]);
 */
import { use } from "react";
import { ArrowLeft, MessageSquare, Users, Phone, Building2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminOrganizations } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate, planLabel } from "@/lib/utils";
import Link from "next/link";

const planColors: Record<string, "gray" | "blue" | "green" | "purple" | "orange"> = {
  trial: "gray", starter: "blue", growth: "green", pro: "purple", enterprise: "orange",
};

export default function AdminBusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const org = adminOrganizations.find(o => o.id === id);

  if (!org) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <p>Business not found</p>
        <Link href="/admin/businesses" className="text-brand-600 mt-2 text-sm hover:underline">← Back</Link>
      </div>
    );
  }

  const usagePct = Math.round((org.messages_used / org.messages_limit) * 100);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title={org.name}
        subtitle="Business Detail"
        actions={
          <Link href="/admin/businesses">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge color={org.status === "active" ? "green" : org.status === "trial" ? "yellow" : "red"}>{org.status}</Badge>
          <Badge color={planColors[org.plan]}>{planLabel(org.plan)}</Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">Joined {formatDate(org.created_at)}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Messages Used" value={org.messages_used.toLocaleString()} sub={`of ${org.messages_limit.toLocaleString()} / month`} icon={<MessageSquare className="w-5 h-5" />} color="brand" />
          <StatCard label="Total Contacts" value={org.contacts_count} icon={<Users className="w-5 h-5" />} color="green" />
          <StatCard label="SMS Number" value={org.sms_number} icon={<Phone className="w-5 h-5" />} color="purple" />
        </div>

        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Usage This Month</p>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">{org.messages_used.toLocaleString()} / {org.messages_limit.toLocaleString()} SMS</span>
            <span className={`font-semibold ${usagePct >= 90 ? "text-red-500" : usagePct >= 70 ? "text-amber-500" : "text-emerald-500"}`}>{usagePct}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${usagePct}%` }} />
          </div>
          {usagePct >= 90 && (
            <p className="text-xs text-red-500 mt-2">⚠ Near plan limit — consider contacting the business about upgrading.</p>
          )}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Admin Actions</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm">Upgrade Plan</Button>
            <Button variant="outline" size="sm">Reset Usage</Button>
            <Button variant="outline" size="sm">Send Notification</Button>
            {org.status === "active"
              ? <Button variant="danger" size="sm">Suspend Account</Button>
              : <Button size="sm">Reactivate Account</Button>
            }
          </div>
        </Card>
      </main>
    </div>
  );
}
