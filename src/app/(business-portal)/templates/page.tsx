"use client";
/*
 * PAGE: Templates
 * CRUD for saved SMS message templates.
 *
 * DATA (currently mock — swap when backend is ready):
 *   list   → GET    /api/templates       (getTemplates in api.ts)
 *   create → POST   /api/templates       (createTemplate in api.ts)
 *   update → PATCH  /api/templates/:id   (updateTemplate in api.ts)
 *   delete → DELETE /api/templates/:id   (deleteTemplate in api.ts)
 */
import { useState } from "react";
import { Plus, FileText, Copy, Trash2, Edit } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { templates as initialTemplates } from "@/lib/mock-data";
import { formatDate, smsCharCount } from "@/lib/utils";
import type { Template } from "@/types";

export default function TemplatesPage() {
  const [showToast, toastNode] = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
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
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
      <Topbar
        title="Templates"
        subtitle={`${templates.length} saved templates`}
        actions={<Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /> New Template</Button>}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
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
                      <button onClick={() => copyToClipboard(t.body, t.name)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition" title="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 leading-relaxed">
                    {t.body}
                  </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">{len} chars · {segments} SMS segment{segments > 1 ? "s" : ""}</p>
                    <Button size="sm" variant="secondary" onClick={() => copyToClipboard(t.body, t.name)}>
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTemplate ? "Edit Template" : "New Template"} size="md">
        <div className="space-y-4">
          <Input label="Template Name" placeholder="e.g. Welcome New Member" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <Textarea
              label="Message Body"
              rows={5}
              placeholder="Use {{first_name}}, {{business_name}} as placeholders..."
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            />
            <p className="text-xs text-slate-400 mt-1">{form.body.length}/160 chars · Use {"{{variable}}"} for personalization</p>
          </div>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.body}>
              {editTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => deleteTarget && handleDelete(deleteTarget)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
