"use client";
/*
 * PAGE: Automation Flows (UC-06)
 * Multi-step automated message sequences triggered by events.
 * Pre-built templates: Welcome Series, Abandoned Cart, Re-engagement.
 *
 * DATA (currently mock — swap when backend is ready):
 *   flows      → GET    /api/flows            (getFlows in api.ts)
 *   toggle     → PATCH  /api/flows/:id/toggle (toggleFlow in api.ts)
 *   create     → POST   /api/flows            (createFlow in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getFlows, toggleFlow } from "@/lib/api";
 *   const [flows, setFlows] = useState([]);
 *   useEffect(() => { getFlows().then(setFlows); }, []);
 *
 * FLOW ENGINE: Backend must check opt-out status at SEND TIME (not trigger time).
 * Opted-out contacts are skipped when each step fires (FL-05).
 * TRIGGERS: contact_joins, birthday, date, custom_event (FL-01).
 */
import { useState } from "react";
import { Plus, Zap, Users, Calendar, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Clock, MessageSquare, BarChart2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { flows as mockFlows } from "@/lib/mock-data"; // ← REMOVE when backend ready
import type { Flow } from "@/types";
import { cn } from "@/lib/utils";

const triggerLabels: Record<string, string> = {
  contact_joins: "Contact Joins",
  birthday: "Birthday",
  date: "Date / Schedule",
  custom_event: "Custom Event",
};

const triggerColors: Record<string, "blue" | "purple" | "orange" | "green"> = {
  contact_joins: "green",
  birthday: "purple",
  date: "blue",
  custom_event: "orange",
};

function formatDelay(hours: number): string {
  if (hours === 0) return "Immediately";
  if (hours < 24) return `${hours}h later`;
  return `${Math.round(hours / 24)} day${Math.round(hours / 24) > 1 ? "s" : ""} later`;
}

const TEMPLATES = [
  { name: "Welcome Series",           desc: "3-step welcome for new contacts",           trigger: "contact_joins", icon: <Users className="w-4 h-4" /> },
  { name: "Abandoned Cart Reminder",  desc: "2-step recovery for incomplete bookings",    trigger: "custom_event",  icon: <Zap className="w-4 h-4" /> },
  { name: "Re-engagement",            desc: "Win back contacts inactive for 60+ days",   trigger: "date",          icon: <Calendar className="w-4 h-4" /> },
];

export default function FlowsPage() {
  const [flowList, setFlowList] = useState<Flow[]>(mockFlows);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    // TODO: await toggleFlow(id) from api.ts
    setFlowList(f => f.map(fl => fl.id === id ? { ...fl, is_active: !fl.is_active } : fl));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Automation Flows"
        subtitle="Set up automated message sequences triggered by events"
        actions={<Button size="sm"><Plus className="w-4 h-4" /> New Flow</Button>}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Pre-built templates */}
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick-Start Templates</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-left hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 transition text-brand-600 dark:text-brand-400">
                    {t.icon}
                  </div>
                  <Badge color={triggerColors[t.trigger]}>{triggerLabels[t.trigger]}</Badge>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-2 font-medium">Use template →</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active flows */}
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Your Flows ({flowList.length})</p>
          <div className="space-y-3">
            {flowList.map(flow => (
              <Card key={flow.id} padding={false}>
                {/* Flow header */}
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{flow.name}</p>
                      <Badge color={triggerColors[flow.trigger_type]}>{triggerLabels[flow.trigger_type]}</Badge>
                      <Badge color={flow.is_active ? "green" : "gray"}>{flow.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {flow.steps.length} steps</span>
                      <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" /> {flow.sent_count} sent · {flow.replied_count} replied</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Toggle */}
                    <button onClick={() => toggleActive(flow.id)} title={flow.is_active ? "Deactivate" : "Activate"}>
                      {flow.is_active
                        ? <ToggleRight className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                        : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === flow.id ? null : flow.id)}>
                      {expanded === flow.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded steps timeline */}
                {expanded === flow.id && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/50">
                    <div className="space-y-3">
                      {flow.steps.map((step, idx) => (
                        <div key={step.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            {idx < flow.steps.length - 1 && (
                              <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            {idx > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                                <Clock className="w-3 h-3" /> {formatDelay(step.delay_hours)}
                              </div>
                            )}
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                              {step.message_body}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">Edit Flow</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Delete</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
