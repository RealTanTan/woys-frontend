"use client";
/*
 * PAGE: Settings (4 tabs)
 *   General    → Business name/email (read-only, managed by WOYS admin)
 *   Team       → List team members, invite, remove
 *   SMS & CASL → View SMS number, edit STOP/HELP/INFO reply messages
 *   Plan       → View usage bar, compare/upgrade plans (Stripe)
 *
 * DATA (currently mock — swap when backend is ready):
 *   org    → GET  /api/org          (getOrg in api.ts)
 *   team   → GET  /api/team         (getTeam in api.ts)
 *   invite → POST /api/team/invite  (inviteTeamMember in api.ts)
 *   remove → DELETE /api/team/:id  (removeTeamMember in api.ts)
 */
import { useState } from "react";
import { Save, Phone, Shield, CreditCard, Plus, Trash2, Lock } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { currentOrg, teamMembers as initialTeam } from "@/lib/mock-data";
import { planLabel } from "@/lib/utils";
import type { TeamMember } from "@/types";

const tabs = [
  { id: "general", label: "General" },
  { id: "team",    label: "Team" },
  { id: "sms",     label: "SMS & CASL" },
  { id: "plan",    label: "Plan & Billing" },
];

const roleColors: Record<string, "purple" | "blue" | "gray"> = {
  owner: "purple", manager: "blue", agent: "gray",
};

export default function SettingsPage() {
  const [showToast, toastNode] = useToast();
  const [tab, setTab] = useState("general");

  // SMS & CASL
  const [stopMessage, setStopMessage] = useState("You have been unsubscribed from Billiard Bar & Club messages. Reply START to re-subscribe.");
  const [helpMessage, setHelpMessage] = useState("For help with Billiard Bar & Club messages, call (416) 555-0192 or visit our website. Reply STOP to unsubscribe.");
  const [infoMessage, setInfoMessage] = useState("Billiard Bar & Club SMS Marketing. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help.");
  const [saving, setSaving] = useState(false);

  // Team
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "agent" });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Plan
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  const usagePct = Math.round((currentOrg.messages_used / currentOrg.messages_limit) * 100);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    showToast("CASL settings saved.");
  };

  const handleInvite = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
    setInviteLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const newMember: TeamMember = {
      id: `m${Date.now()}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      role: inviteForm.role as "manager" | "agent",
    };
    setTeam(t => [...t, newMember]);
    setInviteLoading(false);
    setInviteOpen(false);
    setInviteForm({ name: "", email: "", role: "agent" });
    showToast(`Invite sent to ${inviteForm.email}.`);
  };

  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setTeam(t => t.filter(m => m.id !== deleteTarget.id));
    showToast(`${deleteTarget.name} removed from team.`);
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  const handleUpgrade = async (planName: string) => {
    setUpgradeLoading(planName);
    // TODO: POST /api/billing/checkout → redirect to Stripe checkout URL
    await new Promise(r => setTimeout(r, 800));
    setUpgradeLoading(null);
    showToast(`Redirecting to billing for ${planName} plan…`);
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    // TODO: POST /api/billing/cancel
    await new Promise(r => setTimeout(r, 1000));
    setCancelLoading(false);
    setShowCancelConfirm(false);
    showToast("Cancellation submitted. Confirmation email sent.");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
      <Topbar title="Settings" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Tabs tabs={tabs} active={tab} onChange={setTab} className="w-fit" />

        {/* GENERAL */}
        {tab === "general" && (
          <div className="max-w-xl space-y-5">
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">General settings are managed by WOYS</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">To update business name, email, or identifier, contact WOYS support.</p>
              </div>
            </div>
            <Card>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Business Profile</p>
              <div className="space-y-4">
                {[
                  { label: "Business Name",       value: currentOrg.name,          mono: false },
                  { label: "Slug / URL Identifier", value: currentOrg.slug,        mono: true  },
                  { label: "Business Email",       value: "hello@billiardbar.ca",   mono: false },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                      {f.label} <Lock className="w-3.5 h-3.5" />
                    </label>
                    <input
                      value={f.value}
                      readOnly
                      className={`w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none${f.mono ? " font-mono" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TEAM */}
        {tab === "team" && (
          <div className="max-w-2xl space-y-5">
            <Card padding={false}>
              <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team Members ({team.length})</p>
                <Button size="sm" onClick={() => setInviteOpen(true)}><Plus className="w-4 h-4" /> Invite Member</Button>
              </div>
              {team.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}</p>
                  </div>
                  <Badge color={roleColors[m.role]}>{m.role.charAt(0).toUpperCase() + m.role.slice(1)}</Badge>
                  {m.role !== "owner" && (
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* SMS & CASL */}
        {tab === "sms" && (
          <div className="max-w-xl space-y-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">SMS Number</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{currentOrg.sms_number}</p>
                <Badge color="green">Active</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-2">Your dedicated Canadian long-code number via Twilio.</p>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">CASL Compliance</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">STOP Reply Message</p>
                  <Textarea rows={3} value={stopMessage} onChange={e => setStopMessage(e.target.value)} hint="Sent automatically when a contact replies STOP. Required by CASL." />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">HELP Reply Message</p>
                  <Textarea rows={2} value={helpMessage} onChange={e => setHelpMessage(e.target.value)} hint="Sent automatically when a contact replies HELP. Required by TCPA/CTIA." />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">INFO Reply Message</p>
                  <Textarea rows={2} value={infoMessage} onChange={e => setInfoMessage(e.target.value)} hint="Sent automatically when a contact replies INFO. CTIA requirement." />
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">CASL Reminder</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Under CASL, contacts who reply STOP are immediately suppressed from all broadcasts. Non-compliance can result in fines up to $10M CAD.
                  </p>
                </div>
              </div>
            </Card>
            <Button loading={saving} onClick={handleSave}>
              <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}

        {/* PLAN & BILLING */}
        {tab === "plan" && (
          <div className="max-w-xl space-y-5">
            <Card className="bg-gradient-to-r from-brand-600 to-brand-500 text-white border-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-brand-100 text-sm">Current Plan</p>
                  <p className="text-2xl font-bold mt-0.5">{planLabel(currentOrg.plan)}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{usagePct}%</p>
                  <p className="text-brand-200 text-sm">used</p>
                </div>
              </div>
              <div className="w-full bg-brand-400/40 rounded-full h-2">
                <div className="h-2 rounded-full bg-white" style={{ width: `${usagePct}%` }} />
              </div>
              <p className="text-brand-200 text-xs mt-2">
                {currentOrg.messages_used.toLocaleString()} / {currentOrg.messages_limit.toLocaleString()} SMS used this month
              </p>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              {[
                { name: "Starter",    price: "$29",    sms: "1,000",     contacts: "500",       current: false },
                { name: "Growth",     price: "$79",    sms: "5,000",     contacts: "2,000",     current: true  },
                { name: "Pro",        price: "$199",   sms: "15,000",    contacts: "10,000",    current: false },
                { name: "Enterprise", price: "Custom", sms: "Unlimited", contacts: "Unlimited", current: false },
              ].map(plan => (
                <div key={plan.name} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${plan.current ? "border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-950/30" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{plan.name}</p>
                      {plan.current && <Badge color="blue">Current</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.sms} SMS · {plan.contacts} contacts</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {plan.price}<span className="text-xs font-normal text-slate-400">{plan.price !== "Custom" ? "/mo" : ""}</span>
                    </p>
                    {!plan.current && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={upgradeLoading === plan.name}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Billing powered by Stripe · Cancel anytime
            </p>

            {/* Cancel Subscription */}
            <Card className="border-red-100 dark:border-red-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Cancel Subscription</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Your account stays active until the end of the current billing period. No refunds on partial months.
              </p>
              {!showCancelConfirm ? (
                <Button variant="danger" size="sm" onClick={() => setShowCancelConfirm(true)}>Cancel Subscription</Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Are you sure?</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                      This will cancel your subscription. You'll lose access at end of billing cycle.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" loading={cancelLoading} onClick={handleCancelSubscription}>
                      Yes, Cancel My Subscription
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>Keep My Plan</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Invite Member Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member" size="md">
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            value={inviteForm.name}
            onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="jane@yourbusiness.com"
            value={inviteForm.email}
            onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select
              value={inviteForm.role}
              onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="agent">Agent — Inbox & messaging only</option>
              <option value="manager">Manager — Contacts, broadcasts, templates</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={inviteLoading}
              disabled={!inviteForm.name.trim() || !inviteForm.email.trim()}
              onClick={handleInvite}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Team Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remove <strong>{deleteTarget?.name}</strong> from the team? They will lose all access immediately.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleteLoading} onClick={handleDeleteMember}>Remove</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
