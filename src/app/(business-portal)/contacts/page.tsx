"use client";
/*
 * PAGE: Contacts
 * Lists all contacts with tabs: All / Active (consented) / Pending Consent / Opted Out.
 * Supports search, manual add, CSV import, and sending CASL consent requests.
 *
 * DATA (currently mock — swap when backend is ready):
 *   contacts → GET /api/contacts  (getContacts in api.ts)
 */
import { useEffect, useState, useRef } from "react";
import { Plus, Upload, Search, Phone, Mail, CheckCircle, Clock, XCircle, User, Pencil } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/demo-store";
import { formatDate } from "@/lib/utils";
import type { Contact, ContactTag, ConsentStatus } from "@/types";

const tagColors: Record<ContactTag, "blue" | "green" | "orange" | "purple"> = {
  vip: "purple", new: "green", winback: "orange", regular: "blue",
};
const tagLabels: Record<ContactTag, string> = {
  vip: "VIP", new: "New", winback: "Win-back", regular: "Regular",
};

function ConsentBadge({ status }: { status: ConsentStatus }) {
  if (status === "given")   return <Badge color="green"><CheckCircle className="w-3 h-3 mr-1" />Consented</Badge>;
  if (status === "pending") return <Badge color="yellow"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  return <Badge color="red"><XCircle className="w-3 h-3 mr-1" />Opted Out</Badge>;
}

function ContactRow({ contact, onEdit, onConsent }: { contact: Contact; onEdit: () => void; onConsent: () => void }) {
  return (
    <div className="border-b border-slate-50 p-4 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm shrink-0">
          {contact.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contact.name}</p>
            {contact.tags.map(tag => (
              <Badge key={tag} color={tagColors[tag]}>{tagLabels[tag]}</Badge>
            ))}
          </div>
          <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:gap-3">
            <span className="flex min-w-0 items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{contact.phone}</span>
            {contact.email && <span className="flex min-w-0 items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" />{contact.email}</span>}
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <ConsentBadge status={contact.consent_status} />
          <p className="text-xs text-slate-400 mt-1">
            {contact.consent_status === "opted_out" && contact.opted_out_at
              ? `Opted out ${formatDate(contact.opted_out_at)}`
              : contact.consent_status === "given" && contact.consent_given_at
              ? `Consented ${formatDate(contact.consent_given_at)}`
              : `Added ${formatDate(contact.created_at)}`}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {contact.consent_status === "pending" && (
            <Button size="sm" variant="secondary" onClick={onConsent}>
              Send Consent
            </Button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600 hover:border-brand-300 dark:hover:border-brand-600 shadow-sm transition"
            title="Edit contact"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
        <ConsentBadge status={contact.consent_status} />
        <div className="flex items-center gap-2">
          {contact.consent_status === "pending" && (
            <Button size="sm" variant="secondary" onClick={onConsent}>
              Consent
            </Button>
          )}
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600 hover:border-brand-300 dark:hover:border-brand-600 shadow-sm transition"
            aria-label={`Edit ${contact.name}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [showToast, toastNode] = useToast();
  const { contacts, setContacts } = useDemoStore();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [consentContact, setConsentContact] = useState<Contact | null>(null);
  const [addForm, setAddForm] = useState({ name: "", phone: "", email: "", tag: "regular" });
  const [addLoading, setAddLoading] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", tag: "regular" });
  const [editLoading, setEditLoading] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "add") {
      setAddOpen(true);
    }
  }, []);

  const given    = contacts.filter(c => c.consent_status === "given");
  const pending  = contacts.filter(c => c.consent_status === "pending");
  const optedOut = contacts.filter(c => c.consent_status === "opted_out");

  const sourceList = tab === "all" ? contacts : tab === "pending" ? pending : tab === "optedout" ? optedOut : given;
  const filtered = sourceList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const tabs = [
    { id: "all",      label: "All Contacts",   count: contacts.length },
    { id: "active",   label: "Active",          count: given.length },
    { id: "pending",  label: "Pending Consent", count: pending.length },
    { id: "optedout", label: "Opted Out",        count: optedOut.length },
  ];

  const handleAddContact = async () => {
    if (!addForm.name.trim() || !addForm.phone.trim()) return;
    setAddLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const newContact: Contact = {
      id: `c${Date.now()}`,
      name: addForm.name.trim(),
      phone: addForm.phone.trim(),
      email: addForm.email.trim() || undefined,
      tags: [addForm.tag as ContactTag],
      consent_status: "pending",
      created_at: new Date().toISOString().slice(0, 10),
    };
    setContacts(cs => [...cs, newContact]);
    setAddLoading(false);
    setAddOpen(false);
    setAddForm({ name: "", phone: "", email: "", tag: "regular" });
    showToast(`${addForm.name} added — consent request pending.`);
  };

  const handleSendConsent = async () => {
    if (!consentContact) return;
    setConsentLoading(true);
    const name = consentContact.name;
    const id   = consentContact.id;
    // Simulate sending delay
    await new Promise(r => setTimeout(r, 900));
    setConsentContact(null);
    setConsentLoading(false);
    showToast(`Consent request sent to ${name}. Waiting for reply…`);
    // Simulate customer reply after 2–4 seconds (random accept/decline)
    const delay = 2000 + Math.random() * 2000;
    const accepted = Math.random() > 0.35; // 65% accept rate
    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      setContacts(cs => cs.map(c =>
        c.id === id
          ? accepted
            ? { ...c, consent_status: "given",     consent_given_at: today, opted_out_at: undefined }
            : { ...c, consent_status: "opted_out",  opted_out_at: today,    consent_given_at: undefined }
          : c
      ));
      showToast(
        accepted
          ? `✓ ${name} replied YES — consent granted!`
          : `${name} declined — opted out.`,
        accepted ? "success" : "error"
      );
    }, delay);
  };

  const openEdit = (c: Contact) => {
    setEditContact(c);
    setEditForm({
      name: c.name,
      phone: c.phone,
      email: c.email ?? "",
      tag: c.tags[0] ?? "regular",
    });
  };

  const handleEditContact = async () => {
    if (!editContact || !editForm.name.trim() || !editForm.phone.trim()) return;
    setEditLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setContacts(cs => cs.map(c =>
      c.id === editContact.id
        ? { ...c, name: editForm.name.trim(), phone: editForm.phone.trim(), email: editForm.email.trim() || undefined, tags: [editForm.tag as ContactTag] }
        : c
    ));
    showToast(`${editForm.name} updated.`);
    setEditLoading(false);
    setEditContact(null);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Mock: pretend we imported some contacts
    const mockImported: Contact[] = [
      { id: `csv-${Date.now()}-1`, name: "CSV Import 1", phone: "+14165550201", tags: ["new"], consent_status: "pending", created_at: new Date().toISOString().slice(0, 10) },
      { id: `csv-${Date.now()}-2`, name: "CSV Import 2", phone: "+14165550202", tags: ["regular"], consent_status: "pending", created_at: new Date().toISOString().slice(0, 10) },
    ];
    setContacts(cs => [...cs, ...mockImported]);
    showToast(`Imported ${mockImported.length} contacts from ${file.name}.`);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
      <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
      <Topbar
        title="Contacts"
        subtitle={`${contacts.length} customers saved. Only consented customers receive campaigns.`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => csvRef.current?.click()}>
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" /> Add Customer
            </Button>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
          <div className="flex-1 min-w-48 max-w-sm">
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {tab === "pending" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">These customers have not opted in yet.</p>
            <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">
              Send a simple consent request before including them in campaigns.
            </p>
          </div>
        )}
        {tab === "optedout" && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">These customers opted out.</p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">
              WOYS automatically keeps them out of campaign sends.
            </p>
          </div>
        )}

        <Card padding={false}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <User className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No customers match that search.</p>
            </div>
          ) : (
            filtered.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onEdit={() => openEdit(contact)}
                onConsent={() => setConsentContact(contact)}
              />
            ))
          )}
        </Card>
      </main>

      {/* Add Contact Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Contact" size="md">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Jane Doe" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Phone Number" placeholder="+1 (416) 555-0100" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Email (optional)" type="email" placeholder="jane@example.com" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tag</label>
            <select
              value={addForm.tag}
              onChange={e => setAddForm(f => ({ ...f, tag: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="new">New Customer</option>
              <option value="winback">Win-back</option>
            </select>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">CASL Consent Required</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Contact will be added with pending consent status. A consent request will be queued automatically.</p>
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={addLoading}
              disabled={!addForm.name.trim() || !addForm.phone.trim()}
              onClick={handleAddContact}
            >
              Add Contact
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal open={!!editContact} onClose={() => setEditContact(null)} title="Edit Contact" size="md">
        {editContact && (
          <div className="space-y-4">
            <Input label="Full Name" placeholder="Jane Doe" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Phone Number" placeholder="+1 (416) 555-0100" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Email (optional)" type="email" placeholder="jane@example.com" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tag</label>
              <select
                value={editForm.tag}
                onChange={e => setEditForm(f => ({ ...f, tag: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
                <option value="new">New Customer</option>
                <option value="winback">Win-back</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => setEditContact(null)}>Cancel</Button>
              <Button
                className="flex-1"
                loading={editLoading}
                disabled={!editForm.name.trim() || !editForm.phone.trim()}
                onClick={handleEditContact}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Send Consent Modal */}
      <Modal open={!!consentContact} onClose={() => setConsentContact(null)} title="Send Consent Request" size="md">
        {consentContact && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{consentContact.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{consentContact.phone}</p>
            </div>
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Message Preview</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Hi {consentContact.name.split(" ")[0]}! Billiard Bar & Club would like to send you exclusive offers by SMS. Reply <strong>YES</strong> to subscribe or <strong>STOP</strong> to decline. Msg & data rates may apply.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => setConsentContact(null)}>Cancel</Button>
              <Button className="flex-1" loading={consentLoading} onClick={handleSendConsent}>Send Request</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
