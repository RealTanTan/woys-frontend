"use client";
/*
 * PAGE: Admin — Business Detail  (/admin/businesses/[id])
 * Shows one org's profile, SMS usage bar, and admin action buttons.
 *
 * DATA (currently mock — swap when backend is ready):
 *   org      → GET   /api/admin/organizations/:id           (adminGetOrganization in api.ts)
 *   suspend  → PATCH /api/admin/organizations/:id/suspend   (adminSuspendOrg in api.ts)
 *   plan     → PATCH /api/admin/organizations/:id/plan      (adminUpdatePlan in api.ts)
 */
import { use, useState } from "react";
import { ArrowLeft, MessageSquare, Users, Phone } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { adminOrganizations } from "@/lib/mock-data";
import { formatDate, planLabel } from "@/lib/utils";
import Link from "next/link";
import type { Organization } from "@/types";

const planColors: Record<string, "gray" | "blue" | "green" | "purple" | "orange"> = {
  trial: "gray", starter: "blue", growth: "green", pro: "purple", enterprise: "orange",
};

const MODULES = [
  { id: "campaigns",   label: "Campaigns",          desc: "Mass broadcast campaigns" },
  { id: "automation",  label: "Automation Flows",   desc: "Multi-step automated sequences" },
  { id: "two_way",     label: "Two-Way Messaging",  desc: "Inbox & conversation threads" },
  { id: "ai_brain",    label: "AI Brain",           desc: "Proactive campaign suggestions" },
  { id: "templates",   label: "Templates",          desc: "Reusable message templates" },
  { id: "analytics",   label: "Analytics",          desc: "Campaign delivery reports" },
  { id: "csv_import",  label: "CSV Import",         desc: "Bulk contact import" },
  { id: "mms",         label: "MMS (Images)",       desc: "Multimedia message attachments" },
  { id: "ecommerce",   label: "E-commerce Hook",    desc: "Webhook for online store events" },
  { id: "white_glove", label: "White-Glove Setup",  desc: "Admin-managed onboarding" },
];

const PLANS = ["trial", "starter", "growth", "pro", "enterprise"] as const;

export default function AdminBusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const initial = adminOrganizations.find(o => o.id === id);
  const [showToast, toastNode] = useToast();

  const [org, setOrg] = useState<Organization | null>(initial ?? null);
  const [modules, setModules] = useState<Record<string, boolean>>({
    campaigns: true, automation: true, two_way: true, ai_brain: true,
    templates: true, analytics: true, csv_import: true, mms: false,
    ecommerce: false, white_glove: false,
  });

  // Modal state
  const [upgradePlan, setUpgradePlan] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [notifLoading, setNotifLoading] = useState(false);

  if (!org) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <p>Business not found</p>
        <Link href="/admin/businesses" className="text-brand-600 mt-2 text-sm hover:underline">← Back</Link>
      </div>
    );
  }

  const usagePct = Math.round((org.messages_used / org.messages_limit) * 100);

  const toggleModule = (modId: string) => {
    setModules(m => ({ ...m, [modId]: !m[modId] }));
    const mod = MODULES.find(m => m.id === modId);
    showToast(`${mod?.label} ${!modules[modId] ? "enabled" : "disabled"}.`);
  };

  const handleUpgrade = async () => {
    if (!upgradePlan) return;
    setUpgradeLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setOrg(o => o ? { ...o, plan: upgradePlan as Organization["plan"] } : o);
    showToast(`Plan updated to ${planLabel(upgradePlan)}.`);
    setUpgradeLoading(false);
    setUpgradeOpen(false);
  };

  const handleResetUsage = async () => {
    setResetLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setOrg(o => o ? { ...o, messages_used: 0 } : o);
    showToast("Usage reset to 0.");
    setResetLoading(false);
    setResetOpen(false);
  };

  const handleSuspend = async () => {
    setSuspendLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const next = org.status === "active" ? "suspended" : "active";
    setOrg(o => o ? { ...o, status: next } : o);
    showToast(`Account ${next === "active" ? "reactivated" : "suspended"}.`);
    setSuspendLoading(false);
    setSuspendOpen(false);
  };

  const handleSendNotif = async () => {
    if (!notifMsg.trim()) return;
    setNotifLoading(true);
    await new Promise(r => setTimeout(r, 700));
    showToast(`Notification sent to ${org.name}.`);
    setNotifLoading(false);
    setNotifOpen(false);
    setNotifMsg("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
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
          {usagePct >= 100 && <p className="text-xs text-red-500 mt-2">⚠ Plan limit reached.</p>}
          {usagePct >= 80 && usagePct < 100 && <p className="text-xs text-amber-500 mt-2">⚠ At {usagePct}% of plan limit.</p>}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Admin Actions</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => { setUpgradePlan(org.plan); setUpgradeOpen(true); }}>
              Upgrade Plan
            </Button>
            <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
              Reset Usage
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNotifOpen(true)}>
              Send Notification
            </Button>
            {org.status === "active"
              ? <Button variant="danger" size="sm" onClick={() => setSuspendOpen(true)}>Suspend Account</Button>
              : <Button size="sm" onClick={() => setSuspendOpen(true)}>Reactivate Account</Button>
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

      {/* Upgrade Plan Modal */}
      <Modal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title="Upgrade Plan" size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select New Plan</label>
            <select
              value={upgradePlan}
              onChange={e => setUpgradePlan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {PLANS.map(p => <option key={p} value={p}>{planLabel(p)}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setUpgradeOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={upgradeLoading} onClick={handleUpgrade}>Apply Plan</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Usage Modal */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset Usage" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Reset <strong>{org.name}</strong>'s message usage to 0 for this billing cycle?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={resetLoading} onClick={handleResetUsage}>Reset Usage</Button>
          </div>
        </div>
      </Modal>

      {/* Suspend / Reactivate Modal */}
      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title={org.status === "active" ? "Suspend Account" : "Reactivate Account"}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {org.status === "active"
              ? `Suspend ${org.name}? They will lose access immediately and cannot send SMS.`
              : `Reactivate ${org.name}? They will regain full platform access.`}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button
              variant={org.status === "active" ? "danger" : "primary" as "danger"}
              className="flex-1"
              loading={suspendLoading}
              onClick={handleSuspend}
            >
              {org.status === "active" ? "Suspend" : "Reactivate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Notification Modal */}
      <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title="Send Notification" size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">This message will appear as an in-app notification for <strong>{org.name}</strong>.</p>
          <Textarea
            label="Message"
            rows={4}
            placeholder="e.g. Your plan will renew on June 1st. Contact support if you have questions."
            value={notifMsg}
            onChange={e => setNotifMsg(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setNotifOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={notifLoading} disabled={!notifMsg.trim()} onClick={handleSendNotif}>
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
