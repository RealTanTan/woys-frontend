"use client";
import { useState } from "react";
import { Save, Shield, Bell, Globe, Lock } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";

const tabs = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Admin Settings" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Tabs tabs={tabs} active={tab} onChange={setTab} className="w-fit" />

        {tab === "general" && (
          <div className="max-w-xl space-y-5">
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Platform settings are read-only</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">
                  These values are configured at the infrastructure level. Contact your engineering team to update them.
                </p>
              </div>
            </div>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Platform Settings</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Platform Name", value: "WOYS" },
                  { label: "Support Email", value: "support@woys.ca" },
                  { label: "Default Country Code", value: "+1 (Canada)" },
                  { label: "Default Trial SMS Limit", value: "100" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                      {label} <Lock className="w-3.5 h-3.5" />
                    </label>
                    <input
                      value={value}
                      readOnly
                      className="w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "security" && (
          <div className="max-w-xl space-y-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Security</p>
              </div>
              <div className="space-y-4">
                <Input label="Admin Email" type="email" defaultValue="admin@woys.ca" />
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              </div>
            </Card>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">2FA Coming Soon</p>
              <p className="text-sm text-amber-600 dark:text-amber-500">Two-factor authentication will be required for all admin accounts in the next release.</p>
            </div>
            <Button onClick={handleSave}><Save className="w-4 h-4" />{saved ? "Saved!" : "Update Password"}</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="max-w-xl space-y-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Email Notifications</p>
              </div>
              <div className="space-y-3">
                {[
                  "New business registration",
                  "Business near plan limit (>90%)",
                  "New support ticket",
                  "Ticket marked resolved",
                  "Suspended account activity",
                ].map((label) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            </Card>
            <Button onClick={handleSave}><Save className="w-4 h-4" />{saved ? "Saved!" : "Save Preferences"}</Button>
          </div>
        )}
      </main>
    </div>
  );
}
