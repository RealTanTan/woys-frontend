"use client";
/*
 * PAGE: New Broadcast (3-step wizard)
 * Step 1 — Pick audience (VIP / New Customers / Win-back / All)
 * Step 2 — Compose message + AI suggestions panel
 * Step 3 — Schedule (send now or pick date/time) + review summary
 *
 * DATA (currently mock — swap when backend is ready):
 *   AI suggestions → GET /api/ai/suggestions  (getAiSuggestions in api.ts)
 *   Create/send    → POST /api/broadcasts      (createBroadcast in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getAiSuggestions, createBroadcast } from "@/lib/api";
 *   On mount: getAiSuggestions().then(setSuggestions)
 *   On final submit: createBroadcast({ name, message, audience_type, scheduled_at })
 *
 * SMS COUNTER: smsCharCount() in utils.ts — 160 chars = 1 segment, warn if over.
 * CASL: warn user if message body doesn't include "STOP" opt-out instruction.
 */
import { useState } from "react";
import { ArrowLeft, Sparkles, RefreshCw, Star, Users, RotateCcw, Radio, Calendar, Send, FileText } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getAiSuggestions } from "@/lib/mock-data"; // ← REMOVE when backend ready, use api.ts
import { smsCharCount } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const audiences = [
  { id: "vip",           label: "VIP Customers",  desc: "Your best and most loyal customers", icon: <Star className="w-5 h-5" />, count: 45,  color: "purple" },
  { id: "new_customers", label: "New Customers",   desc: "Joined in the last 30 days",          icon: <Users className="w-5 h-5" />, count: 22,  color: "green" },
  { id: "winback",       label: "Win-back",        desc: "No visit in 60+ days",                icon: <RotateCcw className="w-5 h-5" />, count: 68, color: "orange" },
  { id: "all",           label: "All Contacts",    desc: "Everyone with active consent",        icon: <Radio className="w-5 h-5" />, count: 248, color: "blue" },
];

const audienceColors: Record<string, string> = {
  purple: "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30",
  green:  "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30",
  orange: "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30",
  blue:   "border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/30",
};

export default function NewBroadcastPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions] = useState(getAiSuggestions());
  const [showAi, setShowAi] = useState(false);

  const charInfo = smsCharCount(message);
  const selectedAudience = audiences.find(a => a.id === audience);

  const handleSend = () => {
    router.push("/broadcasts");
  };

  const handleAiPick = (body: string) => {
    setMessage(body);
    setShowAi(false);
  };

  const simulateAi = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAiLoading(false);
    setShowAi(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="New Broadcast"
        subtitle={`Step ${step} of 3`}
        actions={
          <Link href="/broadcasts">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Cancel</Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {["Audience", "Message", "Schedule"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step > i + 1 ? "text-brand-600 dark:text-brand-400" : step === i + 1 ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step > i + 1 ? "bg-brand-600 border-brand-600 text-white" : step === i + 1 ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400 bg-white dark:bg-slate-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s}</span>
              </div>
              {i < 2 && <div className={`h-px w-12 ${step > i + 1 ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Audience */}
        {step === 1 && (
          <div className="max-w-2xl space-y-4">
            <Input label="Broadcast Name" placeholder="e.g. Easter Weekend Special" value={name} onChange={e => setName(e.target.value)} />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select Audience</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audiences.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAudience(a.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-sm ${audience === a.id ? audienceColors[a.color] : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${audience === a.id ? "bg-white/60 dark:bg-slate-900/40" : "bg-slate-50 dark:bg-slate-800"}`}>
                        {a.icon}
                      </div>
                      <Badge color="gray">{a.count} contacts</Badge>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{a.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button className="mt-4" disabled={!name || !audience} onClick={() => setStep(2)}>
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2: Message */}
        {step === 2 && (
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Compose Message</p>
              <Button variant="secondary" size="sm" onClick={simulateAi} loading={aiLoading}>
                <Sparkles className="w-4 h-4" /> AI Suggestions
              </Button>
            </div>

            {/* AI suggestions panel */}
            {showAi && (
              <div className="border border-brand-200 dark:border-brand-800 rounded-2xl overflow-hidden">
                <div className="bg-brand-50 dark:bg-brand-950/40 px-4 py-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">AI-Generated Suggestions</p>
                  <p className="text-xs text-brand-500 dark:text-brand-500 ml-1">Based on today's date & season</p>
                  <button onClick={() => setShowAi(false)} className="ml-auto text-brand-400 hover:text-brand-600 text-sm">✕</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {suggestions.map((s, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{s.title}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{s.body}</p>
                          <p className="text-xs text-slate-400 italic">💡 {s.reason}</p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => handleAiPick(s.body)}>Use</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              label="Message"
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message here... Include STOP instructions for CASL compliance."
            />

            {/* Character counter */}
            <div className="flex items-center justify-between">
              <div className={`text-xs font-medium ${charInfo.len > 160 ? "text-amber-600" : "text-slate-500"}`}>
                {charInfo.len} chars · {charInfo.segments} SMS segment{charInfo.segments > 1 ? "s" : ""} · {charInfo.remaining} remaining
              </div>
              {!message.toLowerCase().includes("stop") && message.length > 0 && (
                <Badge color="yellow">Missing STOP instruction</Badge>
              )}
            </div>

            {selectedAudience && (
              <Card className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border-0">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700">{selectedAudience.icon}</div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Sending to: {selectedAudience.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAudience.count} contacts with active CASL consent</p>
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button disabled={!message.trim()} onClick={() => setStep(3)}>Continue →</Button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "now", label: "Send Now", icon: <Send className="w-5 h-5" />, desc: "Send immediately" },
                { id: "later", label: "Schedule", icon: <Calendar className="w-5 h-5" />, desc: "Pick a date & time" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setScheduleType(opt.id as "now" | "later")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${scheduleType === opt.id ? "border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-950/30" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"}`}
                >
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 w-fit mb-3">{opt.icon}</div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {scheduleType === "later" && (
              <Input type="datetime-local" label="Date & Time" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            )}

            {/* Review summary */}
            <Card>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Review Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-medium text-slate-900 dark:text-slate-100">{name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Audience</span><span className="font-medium text-slate-900 dark:text-slate-100">{selectedAudience?.label} ({selectedAudience?.count})</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Message length</span><span className="font-medium text-slate-900 dark:text-slate-100">{charInfo.len} chars · {charInfo.segments} segment{charInfo.segments > 1 ? "s" : ""}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Send</span><span className="font-medium text-slate-900 dark:text-slate-100">{scheduleType === "now" ? "Immediately" : scheduledAt || "—"}</span></div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button variant="outline"><FileText className="w-4 h-4" /> Save Draft</Button>
              <Button onClick={handleSend}>
                {scheduleType === "now" ? <><Send className="w-4 h-4" /> Send Now</> : <><Calendar className="w-4 h-4" /> Schedule</>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
