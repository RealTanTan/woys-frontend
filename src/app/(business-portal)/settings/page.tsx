"use client";
/*
 * PAGE: Settings (4 tabs)
 *   General    → Business name/email (read-only, managed by WOYS admin)
 *   Team       → List team members, invite, remove
 *   SMS & CASL → View SMS number, edit STOP reply message
 *   Plan       → View usage bar, compare/upgrade plans (Stripe)
 *
 * DATA (currently mock — swap when backend is ready):
 *   org         → GET   /api/org              (getOrg in api.ts)
 *   team        → GET   /api/team             (getTeam in api.ts)
 *   invite      → POST  /api/team/invite      (inviteTeamMember in api.ts)
 *   remove      → DELETE/api/team/:id         (removeTeamMember in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getOrg, getTeam, inviteTeamMember, removeTeamMember } from "@/lib/api";
 *
 * CASL: STOP message is saved via PATCH /api/org — backend must store it and
 *   auto-send it whenever a contact replies STOP to any SMS.
 *
 * BILLING: Plan upgrade buttons should open a Stripe Checkout session.
 *   Backend endpoint: POST /api/billing/checkout → returns { url: string }
 */
import { useState } from "react";
import { Save, Phone, Users, Shield, CreditCard, Plus, Trash2, Lock } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { currentOrg, teamMembers } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { planLabel } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General" },
  { id: "team", label: "Team" },
  { id: "sms", label: "SMS & CASL" },
  { id: "plan", label: "Plan & Billing" },
];

const roleColors: Record<string, "purple" | "blue" | "gray"> = {
  owner: "purple", manager: "blue", agent: "gray",
};

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [stopMessage, setStopMessage] = useState(
    "You have been unsubscribed from Billiard Bar & Club messages. Reply START to re-subscribe."
  );
  const [helpMessage, setHelpMessage] = useState("For help with Billiard Bar & Club messages, call (416) 555-0192 or visit our website. Reply STOP to unsubscribe.");
  const [infoMessage, setInfoMessage] = useState("Billiard Bar & Club SMS Marketing. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help.");
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [saved, setSaved] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const usagePct = Math.round((currentOrg.messages_used / currentOrg.messages_limit) * 100);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Tabs tabs={tabs} active={tab} onChange={setTab} className="w-fit" />

        {tab === "general" && (
          <div className="max-w-xl space-y-5">
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">General settings are managed by WOYS</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">
                  To update your business name, email, or identifier, please contact WOYS support using the help button in the bottom-right corner.
                </p>
              </div>
            </div>
            <Card>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Business Profile</p>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                    Business Name <Lock className="w-3.5 h-3.5" />
                  </label>
                  <input
                    value={orgName}
                    readOnly
                    className="w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                    Slug / URL Identifier <Lock className="w-3.5 h-3.5" />
                  </label>
                  <input
                    value={currentOrg.slug}
                    readOnly
                    className="w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                    Business Email <Lock className="w-3.5 h-3.5" />
                  </label>
                  <input
                    value="hello@billiardbar.ca"
                    readOnly
                    className="w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "team" && (
          <div className="max-w-2xl space-y-5">
            <Card padding={false}>
              <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team Members ({teamMembers.length})</p>
                <Button size="sm"><Plus className="w-4 h-4" /> Invite Member</Button>
              </div>
              {teamMembers.map((m) => (
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
                    <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}

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
                  <Textarea
                    rows={3}
                    value={stopMessage}
                    onChange={e => setStopMessage(e.target.value)}
                    hint="Sent automatically when a contact replies STOP. Required by CASL."
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">HELP Reply Message</p>
                  <Textarea
                    rows={2}
                    value={helpMessage}
                    onChange={e => setHelpMessage(e.target.value)}
                    hint="Sent automatically when a contact replies HELP. Required by TCPA/CTIA."
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">INFO Reply Message</p>
                  <Textarea
                    rows={2}
                    value={infoMessage}
                    onChange={e => setInfoMessage(e.target.value)}
                    hint="Sent automatically when a contact replies INFO. CTIA requirement."
                  />
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">CASL Reminder</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Under the Canadian Anti-Spam Legislation (CASL), contacts who reply STOP are immediately suppressed from all broadcasts. Non-compliance can result in fines up to $10M CAD.
                  </p>
                </div>
              </div>
            </Card>
            <Button onClick={handleSave}><Save className="w-4 h-4" />{saved ? "Saved!" : "Save Changes"}</Button>
          </div>
        )}

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
                { name: "Starter",    price: "$29", sms: "1,000",  contacts: "500",   color: "gray" },
                { name: "Growth",     price: "$79", sms: "5,000",  contacts: "2,000", color: "blue", current: true },
                { name: "Pro",        price: "$199",sms: "15,000", contacts: "10,000",color: "purple" },
                { name: "Enterprise", price: "Custom", sms: "Unlimited", contacts: "Unlimited", color: "orange" },
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
                    <p className="font-bold text-slate-900 dark:text-slate-100">{plan.price}<span className="text-xs font-normal text-slate-400">{plan.price !== "Custom" ? "/mo" : ""}</span></p>
                    {!plan.current && <Button size="sm" variant="outline">Upgrade</Button>}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Billing powered by Stripe · Cancel anytime
            </p>

            {/* BL-05: Self-serve cancellation */}
            <Card className="border-red-100 dark:border-red-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Cancel Subscription</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Your account stays active until the end of the current billing period. No refunds on partial months.
              </p>
              {!showCancelConfirm ? (
                <Button variant="danger" size="sm" onClick={() => setShowCancelConfirm(true)}>
                  Cancel Subscription
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Are you sure?</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                      This will cancel your subscription. You'll lose access at the end of your billing cycle. This cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => { setShowCancelConfirm(false); alert("Cancellation submitted. A confirmation email will be sent."); }}>
                      Yes, Cancel My Subscription
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>
                      Keep My Plan
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
