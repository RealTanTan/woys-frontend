"use client";
/*
 * PAGE: Automation Flows (UC-06)
 * Multi-step automated message sequences triggered by events.
 *
 * DATA (currently mock — swap when backend is ready):
 *   flows  → GET    /api/flows            (getFlows in api.ts)
 *   toggle → PATCH  /api/flows/:id/toggle (toggleFlow in api.ts)
 *   create → POST   /api/flows            (createFlow in api.ts)
 *   delete → DELETE /api/flows/:id        (deleteFlow in api.ts)
 */
import { useState } from "react";
import { Plus, Zap, Users, Calendar, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Clock, MessageSquare, BarChart2, Trash2, Edit2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { flows as mockFlows } from "@/lib/mock-data";
import type { Flow } from "@/types";

const triggerLabels: Record<string, string> = {
  contact_joins: "Contact Joins",
  birthday:      "Birthday",
  date:          "Date / Schedule",
  custom_event:  "Custom Event",
};

const triggerColors: Record<string, "blue" | "purple" | "orange" | "green"> = {
  contact_joins: "green",
  birthday:      "purple",
  date:          "blue",
  custom_event:  "orange",
};

function formatDelay(hours: number): string {
  if (hours === 0) return "Immediately";
  if (hours < 24)  return `${hours}h later`;
  return `${Math.round(hours / 24)} day${Math.round(hours / 24) > 1 ? "s" : ""} later`;
}

const TEMPLATES = [
  {
    name: "Welcome Series",
    desc: "3-step welcome for new contacts",
    trigger: "contact_joins" as const,
    icon: <Users className="w-4 h-4" />,
    steps: [
      { id: "s1", step_order: 0, delay_hours: 0,   message_body: "Welcome to Billiard Bar & Club! 🎱 Show this message for 10% off your first visit. Reply STOP to unsubscribe." },
      { id: "s2", step_order: 1, delay_hours: 72,  message_body: "Hey {{first_name}}! Hope you enjoyed your visit. Don't forget — Friday nights are our best. See you soon! Reply STOP to opt out." },
      { id: "s3", step_order: 2, delay_hours: 168, message_body: "{{first_name}}, we miss you! Come back this weekend and get a free game on us. Reply STOP to unsubscribe." },
    ],
  },
  {
    name: "Abandoned Booking Reminder",
    desc: "2-step recovery for incomplete bookings",
    trigger: "custom_event" as const,
    icon: <Zap className="w-4 h-4" />,
    steps: [
      { id: "s1", step_order: 0, delay_hours: 1,  message_body: "Hi {{first_name}}! You started a booking at Billiard Bar & Club but didn't finish. Complete it here: [link]. Reply STOP to opt out." },
      { id: "s2", step_order: 1, delay_hours: 24, message_body: "Last chance! Your reserved table at Billiard Bar & Club is still waiting. Book now before it's gone. Reply STOP to unsubscribe." },
    ],
  },
  {
    name: "Re-engagement",
    desc: "Win back contacts inactive for 60+ days",
    trigger: "date" as const,
    icon: <Calendar className="w-4 h-4" />,
    steps: [
      { id: "s1", step_order: 0, delay_hours: 0,   message_body: "We miss you at Billiard Bar & Club, {{first_name}}! It's been a while. Here's 15% off your next visit: COMEBACK15. Reply STOP to opt out." },
      { id: "s2", step_order: 1, delay_hours: 120, message_body: "{{first_name}}, your exclusive offer expires soon! Use COMEBACK15 for 15% off — valid this weekend only. Reply STOP to unsubscribe." },
    ],
  },
];

export default function FlowsPage() {
  const [showToast, toastNode] = useToast();
  const [flowList, setFlowList] = useState<Flow[]>(mockFlows);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Flow | null>(null);
  const [editTarget, setEditTarget] = useState<Flow | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const toggleActive = (id: string) => {
    setFlowList(f => f.map(fl => fl.id === id ? { ...fl, is_active: !fl.is_active } : fl));
    const flow = flowList.find(fl => fl.id === id);
    showToast(flow ? (flow.is_active ? `"${flow.name}" deactivated.` : `"${flow.name}" activated.`) : "Flow updated.");
  };

  const handleUseTemplate = (tpl: typeof TEMPLATES[0]) => {
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      name: tpl.name,
      trigger_type: tpl.trigger,
      is_active: false,
      steps: tpl.steps,
      sent_count: 0,
      replied_count: 0,
      created_at: new Date().toISOString().slice(0, 10),
    };
    setFlowList(f => [...f, newFlow]);
    showToast(`"${tpl.name}" flow created — toggle active when ready.`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setFlowList(f => f.filter(fl => fl.id !== deleteTarget.id));
    showToast(`"${deleteTarget.name}" deleted.`);
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  const handleEdit = async () => {
    if (!editTarget || !editName.trim()) return;
    setEditLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setFlowList(f => f.map(fl => fl.id === editTarget.id ? { ...fl, name: editName.trim() } : fl));
    showToast(`Flow renamed to "${editName.trim()}".`);
    setEditLoading(false);
    setEditTarget(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
      <Topbar
        title="Automation Flows"
        subtitle="Set up automated message sequences triggered by events"
        actions={
          <Button size="sm" onClick={() => handleUseTemplate(TEMPLATES[0])}>
            <Plus className="w-4 h-4" /> New Flow
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* Quick-start templates */}
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick-Start Templates</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => handleUseTemplate(t)}
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

        {/* Your flows */}
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Your Flows ({flowList.length})</p>
          <div className="space-y-3">
            {flowList.map(flow => (
              <Card key={flow.id} padding={false}>
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
                  <div className="flex items-center gap-2 shrink-0">
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

                {expanded === flow.id && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/50">
                    <div className="space-y-3">
                      {flow.steps.map((step, idx) => (
                        <div key={step.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            {idx < flow.steps.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
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
                    <div className="flex flex-col gap-2 mt-3 sm:flex-row">
                      <Button variant="outline" size="sm" onClick={() => { setEditTarget(flow); setEditName(flow.name); }}>
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(flow)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {flowList.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">No flows yet — use a template above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Flow" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleteLoading} onClick={handleDelete}>Delete Flow</Button>
          </div>
        </div>
      </Modal>

      {/* Rename modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Rename Flow" size="sm">
        <div className="space-y-4">
          <Input label="Flow Name" value={editName} onChange={e => setEditName(e.target.value)} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button className="flex-1" loading={editLoading} disabled={!editName.trim()} onClick={handleEdit}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
