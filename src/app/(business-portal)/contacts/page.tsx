"use client";
/*
 * PAGE: Contacts
 * Lists all contacts with tabs: All / Active (consented) / Pending Consent / Opted Out.
 * Supports search, manual add, CSV import, and sending CASL consent requests.
 *
 * DATA (currently mock — swap when backend is ready):
 *   contacts → GET /api/contacts  (getContacts in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getContacts, createContact, sendConsentRequest, importContactsCSV } from "@/lib/api";
 *   const [contacts, setContacts] = useState<Contact[]>([]);
 *   useEffect(() => { getContacts().then(setContacts); }, []);
 *
 * CASL NOTE: contacts.consent_status drives which tab they appear in.
 *   "given"    → Active (safe to message)
 *   "pending"  → Pending (cannot message yet — send consent request first)
 *   "opted_out"→ Opted Out (suppressed by law — never message)
 */
import { useState } from "react";
import { Plus, Upload, Search, Phone, Mail, Tag, CheckCircle, Clock, XCircle, User } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { contacts as allContacts } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate } from "@/lib/utils";
import type { Contact, ContactTag, ConsentStatus } from "@/types";

const tagColors: Record<ContactTag, "blue" | "green" | "orange" | "purple"> = {
  vip: "purple", new: "green", winback: "orange", regular: "blue",
};

const tagLabels: Record<ContactTag, string> = {
  vip: "VIP", new: "New", winback: "Win-back", regular: "Regular",
};

function ConsentBadge({ status }: { status: ConsentStatus }) {
  if (status === "given") return <Badge color="green"><CheckCircle className="w-3 h-3 mr-1" />Consented</Badge>;
  if (status === "pending") return <Badge color="yellow"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  return <Badge color="red"><XCircle className="w-3 h-3 mr-1" />Opted Out</Badge>;
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm shrink-0">
        {contact.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contact.name}</p>
          {contact.tags.map(tag => (
            <Badge key={tag} color={tagColors[tag]}>{tagLabels[tag]}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>
          {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <ConsentBadge status={contact.consent_status} />
        <p className="text-xs text-slate-400 mt-1">
          {contact.consent_status === "opted_out" && contact.opted_out_at
            ? `Opted out ${formatDate(contact.opted_out_at)}`
            : contact.consent_status === "given" && contact.consent_given_at
            ? `Consented ${formatDate(contact.consent_given_at)}`
            : `Added ${formatDate(contact.created_at)}`}
        </p>
      </div>
    </div>
  );
}

function AddContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", tag: "regular" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Add Contact" size="md">
      <div className="space-y-4">
        <Input label="Full Name" placeholder="Jane Doe" value={form.name} onChange={set("name")} />
        <Input label="Phone Number" placeholder="+1 (416) 555-0100" value={form.phone} onChange={set("phone")} />
        <Input label="Email (optional)" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tag</label>
          <select
            value={form.tag}
            onChange={set("tag")}
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
          <p className="text-xs text-amber-600 dark:text-amber-500">
            Under Canadian law, you must have express consent before sending marketing SMS. A consent request will be sent automatically.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={onClose}>Add Contact</Button>
        </div>
      </div>
    </Modal>
  );
}

function SendConsentModal({ open, onClose, contact }: { open: boolean; onClose: () => void; contact: Contact | null }) {
  return (
    <Modal open={open} onClose={onClose} title="Send Consent Request" size="md">
      {contact && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contact.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{contact.phone}</p>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Message Preview</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Hi {contact.name.split(" ")[0]}! Billiard Bar & Club would like to send you exclusive offers and updates by SMS. Reply <strong>YES</strong> to subscribe or <strong>STOP</strong> to decline. Msg & data rates may apply.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={onClose}>Send Request</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function ContactsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [consentContact, setConsentContact] = useState<Contact | null>(null);

  const given = allContacts.filter(c => c.consent_status === "given");
  const pending = allContacts.filter(c => c.consent_status === "pending");
  const optedOut = allContacts.filter(c => c.consent_status === "opted_out");

  const sourceList = tab === "all" ? allContacts : tab === "pending" ? pending : tab === "optedout" ? optedOut : given;
  const filtered = sourceList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const tabs = [
    { id: "all", label: "All Contacts", count: allContacts.length },
    { id: "active", label: "Active", count: given.length },
    { id: "pending", label: "Pending Consent", count: pending.length },
    { id: "optedout", label: "Opted Out", count: optedOut.length },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Contacts"
        subtitle={`${allContacts.length} total contacts`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Upload className="w-4 h-4" /> Import CSV</Button>
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Contact</Button>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
          <div className="flex-1 min-w-48 max-w-sm">
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Info banners */}
        {tab === "pending" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">CASL Compliance: Pending Consent</p>
            <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">
              These contacts have not yet given express consent. You cannot send them marketing messages until they do. Send a consent request below.
            </p>
          </div>
        )}
        {tab === "optedout" && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Opted-Out Contacts</p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">
              These contacts replied STOP or withdrew consent. Under CASL, you must not send them any further marketing messages. They are automatically suppressed from all broadcasts.
            </p>
          </div>
        )}

        <Card padding={false}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <User className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            <>
              {filtered.map((contact) => (
                <div key={contact.id} className="group relative">
                  <ContactRow contact={contact} />
                  {contact.consent_status === "pending" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                      <Button size="sm" variant="secondary" onClick={() => setConsentContact(contact)}>
                        Send Consent
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </Card>
      </main>

      <AddContactModal open={addOpen} onClose={() => setAddOpen(false)} />
      <SendConsentModal open={!!consentContact} onClose={() => setConsentContact(null)} contact={consentContact} />
    </div>
  );
}
