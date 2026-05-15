"use client";
/*
 * PAGE: Campaigns (/broadcasts)
 * Two views toggled by top tab:
 *   Campaigns  → mass SMS campaign list + audience channels
 *   Templates  → saved message snippets (create / edit / copy / delete)
 *
 * DATA (currently mock — swap when backend is ready):
 *   broadcasts → GET /api/broadcasts  (getBroadcasts in api.ts)
 *   templates  → GET /api/templates   (getTemplates in api.ts)
 */
import { useState } from "react";
import {
  Plus, Radio, Users, Star, RotateCcw, CheckCircle,
  Clock, Send, FileText, XCircle, Copy, Trash2, Edit,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/demo-store";
import { formatDate, smsCharCount } from "@/lib/utils";
import Link from "next/link";
import type { Broadcast, Template } from "@/types";

// ─── Campaigns helpers ───────────────────────────────────────────────────────

const audienceIcons: Record<string, React.ReactNode> = {
  vip:           <Star className="w-4 h-4 text-purple-500" />,
  new_customers: <Users className="w-4 h-4 text-green-500" />,
  winback:       <RotateCcw className="w-4 h-4 text-orange-500" />,
  all:           <Radio className="w-4 h-4 text-brand-500" />,
  custom:        <Users className="w-4 h-4 text-slate-500" />,
};
const audienceLabels: Record<string, string> = {
  vip: "VIP Customers", new_customers: "New Customers",
  winback: "Win-back", all: "All Contacts", custom: "Custom",
};

function StatusBadge({ status }: { status: Broadcast["status"] }) {
  const map: Record<string, { color: "green" | "blue" | "yellow" | "gray" | "red"; label: string; icon: React.ReactNode }> = {
    sent:      { color: "green",  label: "Sent",      icon: <CheckCircle className="w-3 h-3" /> },
    scheduled: { color: "blue",   label: "Scheduled", icon: <Clock className="w-3 h-3" /> },
    sending:   { color: "yellow", label: "Sending…",  icon: <Send className="w-3 h-3" /> },
    draft:     { color: "gray",   label: "Draft",     icon: <FileText className="w-3 h-3" /> },
    cancelled: { color: "red",    label: "Cancelled", icon: <XCircle className="w-3 h-3" /> },
  };
  const { color, label, icon } = map[status];
  return <Badge color={color}><span className="mr-1">{icon}</span>{label}</Badge>;
}

function BroadcastCard({ b }: { b: Broadcast }) {
  const delivRate = b.total_recipients ? Math.round((b.delivered_count / b.total_recipients) * 100) : 0;
  return (
    <Link href={`/broadcasts/${b.id}`}>
      <div className="p-5 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
              {audienceIcons[b.audience_type]}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{b.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{b.message}</p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <StatusBadge status={b.status} />
            <Badge color="gray">{audienceLabels[b.audience_type]}</Badge>
          </div>
        </div>
        {b.status === "sent" && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            {[
              { label: "Recipients", value: b.total_recipients },
              { label: "Sent",       value: b.sent_count },
              { label: "Delivered",  value: `${delivRate}%` },
              { label: "Failed",     value: b.failed_count, red: b.failed_count > 0 },
            ].map(({ label, value, red }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                <p className={`text-base font-bold ${red ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        )}
        {b.status === "scheduled" && (
          <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Scheduled for {b.scheduled_at ? formatDate(b.scheduled_at) : "—"}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-2">Created {formatDate(b.created_at)}</p>
      </div>
    </Link>
  );
}

// ─── Campaigns view ───────────────────────────────────────────────────────────

function CampaignsView() {
  const [tab, setTab] = useState("all");
  const { broadcasts: broadcastList, setBroadcasts: setBroadcastList, contacts } = useDemoStore();

  const tabs = [
    { id: "all",       label: "All",       count: broadcastList.length },
    { id: "sent",      label: "Sent",      count: broadcastList.filter(b => b.status === "sent").length },
    { id: "scheduled", label: "Scheduled", count: broadcastList.filter(b => b.status === "scheduled").length },
    { id: "draft",     label: "Drafts",    count: broadcastList.filter(b => b.status === "draft").length },
  ];

  const filtered = tab === "all" ? broadcastList : broadcastList.filter(b => b.status === tab);

  const channels = [
    { id: "vip",           label: "VIP Customers", icon: <Star className="w-5 h-5" />,       color: "purple", count: contacts.filter(c => c.tags.includes("vip")).length,     sent: broadcastList.filter(b => b.audience_type === "vip").length },
    { id: "new_customers", label: "New Customers",  icon: <Users className="w-5 h-5" />,      color: "green",  count: contacts.filter(c => c.tags.includes("new")).length,     sent: broadcastList.filter(b => b.audience_type === "new_customers").length },
    { id: "winback",       label: "Win-back",       icon: <RotateCcw className="w-5 h-5" />,  color: "orange", count: contacts.filter(c => c.tags.includes("winback")).length, sent: broadcastList.filter(b => b.audience_type === "winback").length },
    { id: "all",           label: "All Contacts",   icon: <Radio className="w-5 h-5" />,      color: "blue",   count: contacts.length,                                         sent: broadcastList.filter(b => b.audience_type === "all").length },
  ];

  const colorMap: Record<string, string> = {
    purple: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
    green:  "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    blue:   "bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400",
  };

  return (
    <div className="space-y-6">
      {/* Audience Channels */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Audience Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {channels.map((ch) => (
            <Card key={ch.id} className="flex flex-col gap-3 cursor-pointer hover:shadow-md transition">
              <div className={`p-2.5 rounded-xl w-fit ${colorMap[ch.color]}`}>{ch.icon}</div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{ch.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{ch.count} contacts · {ch.sent} campaigns</p>
              </div>
              <Link href={`/broadcasts/new?audience=${ch.id}`}>
                <Button variant="secondary" size="sm" className="w-full">Send Campaign</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Campaign list */}
      <div>
        <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Campaign History</h2>
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Radio className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No campaigns in this category</p>
            </div>
          ) : (
            filtered.map(b => <BroadcastCard key={b.id} b={b} />)
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Templates view ───────────────────────────────────────────────────────────

function TemplatesView() {
  const [showToast, toastNode] = useToast();
  const { templates, setTemplates } = useDemoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: "", body: "" });
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const openNew = () => {
    setEditTemplate(null);
    setForm({ name: "", body: "" });
    setModalOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditTemplate(t);
    setForm({ name: t.name, body: t.body });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editTemplate) {
      setTemplates(ts => ts.map(t => t.id === editTemplate.id ? { ...t, ...form } : t));
      showToast(`"${form.name}" updated.`);
    } else {
      setTemplates(ts => [...ts, { id: `t${Date.now()}`, ...form, created_at: new Date().toISOString().slice(0, 10) }]);
      showToast(`"${form.name}" created.`);
    }
    setModalOpen(false);
  };

  const handleDelete = (t: Template) => {
    setTemplates(ts => ts.filter(x => x.id !== t.id));
    setDeleteTarget(null);
    showToast(`"${t.name}" deleted.`);
  };

  const copyToClipboard = async (body: string, name: string) => {
    try {
      await navigator.clipboard.writeText(body);
      showToast(`"${name}" copied to clipboard.`);
    } catch {
      showToast("Copy failed — please copy manually.", "error");
    }
  };

  return (
    <>
      {toastNode}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{templates.length} saved templates</p>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /> New Template</Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
          <FileText className="w-10 h-10 opacity-40" />
          <p className="text-sm">No templates yet</p>
          <Button size="sm" onClick={openNew}>Create your first template</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((t) => {
            const { len, segments } = smsCharCount(t.body);
            return (
              <Card key={t.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-50 dark:bg-brand-950/40 rounded-xl">
                      <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</p>
                      <p className="text-xs text-slate-400">Created {formatDate(t.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => copyToClipboard(t.body, t.name)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 leading-relaxed">{t.body}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">{len} chars · {segments} segment{segments > 1 ? "s" : ""}</p>
                  <Button size="sm" variant="secondary" onClick={() => copyToClipboard(t.body, t.name)}>
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTemplate ? "Edit Template" : "New Template"} size="md">
        <div className="space-y-4">
          <Input label="Template Name" placeholder="e.g. Welcome New Member" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <Textarea label="Message Body" rows={5} placeholder="Use {{first_name}}, {{business_name}} as placeholders..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
            <p className="text-xs text-slate-400 mt-1">{form.body.length}/160 chars</p>
          </div>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.body}>
              {editTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => deleteTarget && handleDelete(deleteTarget)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TOP_TABS = [
  { id: "campaigns", label: "Campaigns" },
  { id: "templates", label: "Templates" },
];

export default function CampaignsPage() {
  const [view, setView] = useState("campaigns");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Campaigns"
        subtitle="SMS campaigns & message templates"
        actions={
          view === "campaigns" ? (
            <Link href="/broadcasts/new">
              <Button size="sm"><Plus className="w-4 h-4" /> New Campaign</Button>
            </Link>
          ) : undefined
        }
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Top-level view switcher */}
        <Tabs tabs={TOP_TABS} active={view} onChange={setView} className="w-fit" />

        {view === "campaigns" && <CampaignsView />}
        {view === "templates" && <TemplatesView />}
      </main>
    </div>
  );
}
