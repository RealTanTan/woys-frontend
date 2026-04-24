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
import { use, useState } from "react";
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

const MODULES = [
  { id: "campaigns",    label: "Campaigns",         desc: "Mass broadcast campaigns" },
  { id: "automation",   label: "Automation Flows",  desc: "Multi-step automated sequences" },
  { id: "two_way",      label: "Two-Way Messaging", desc: "Inbox & conversation threads" },
  { id: "ai_brain",     label: "AI Brain",          desc: "Proactive campaign suggestions" },
  { id: "templates",    label: "Templates",         desc: "Reusable message templates" },
  { id: "analytics",    label: "Analytics",         desc: "Campaign delivery reports" },
  { id: "csv_import",   label: "CSV Import",        desc: "Bulk contact import" },
  { id: "mms",          label: "MMS (Images)",      desc: "Multimedia message attachments" },
  { id: "ecommerce",    label: "E-commerce Hook",   desc: "Webhook for online store events" },
  { id: "white_glove",  label: "White-Glove Setup", desc: "Admin-managed onboarding" },
];

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

  const [modules, setModules] = useState<Record<string, boolean>>({
    campaigns: true, automation: true, two_way: true, ai_brain: true,
    templates: true, analytics: true, csv_import: true, mms: false,
    ecommerce: false, white_glove: false,
  });

  const toggleModule = (id: string) => {
    // TODO: await adminUpdateModule(org.id, id, !modules[id]) from api.ts
    setModules(m => ({ ...m, [id]: !m[id] }));
  };

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
            <span className={`font-semibold ${usagePct >= 80 ? "text-red-500" : usagePct >= 60 ? "text-amber-500" : "text-emerald-500"}`}>{usagePct}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${usagePct >= 80 ? "bg-red-500" : usagePct >= 60 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${usagePct}%` }} />
          </div>
          {usagePct >= 100 && <p className="text-xs text-red-500 mt-2">⚠ Plan limit reached — business cannot send more SMS this cycle.</p>}
          {usagePct >= 80 && usagePct < 100 && <p className="text-xs text-amber-500 mt-2">⚠ At {usagePct}% of plan limit — consider contacting the business about upgrading.</p>}
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

        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Module Configuration</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Disabled modules are fully hidden from the client UI — not grayed out. (MD-02)</p>
          <div className="space-y-2">
            {MODULES.map(mod => (
              <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{mod.label}</p>
                  <p className="text-xs text-slate-400">{mod.desc}</p>
                </div>
                <button
                  onClick={() => toggleModule(mod.id)}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${modules[mod.id] ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${modules[mod.id] ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
