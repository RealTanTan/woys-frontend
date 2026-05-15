"use client";
/*
 * PAGE: Messages (Inbox)
 * Lists all 1-to-1 SMS conversations, split into Open and Resolved.
 * "New Message" button lets the business send a one-off SMS to any phone number.
 *
 * DATA (currently mock — swap when backend is ready):
 *   conversations → GET /api/conversations  (getConversations in api.ts)
 */
import { useEffect, useState } from "react";
import { Search, MessageSquare, CheckCircle, UserCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/demo-store";
import { formatRelative } from "@/lib/utils";
import type { Conversation } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [showToast, toastNode] = useToast();
  const { conversations: convList, setConversations, contacts } = useDemoStore();
  const [search, setSearch] = useState("");
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsg, setNewMsg] = useState({ phone: "", name: "", body: "" });
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const eligibleContacts = contacts.filter(c => c.consent_status === "given");
  const filteredContactPicker = eligibleContacts.filter(c =>
    contactSearch === "" ||
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phone.includes(contactSearch)
  );

  const filtered = convList.filter(c =>
    c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.phone.includes(search)
  );

  const open     = filtered.filter(c => c.status === "open");
  const resolved = filtered.filter(c => c.status === "resolved");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "new") {
      setNewMsgOpen(true);
    }
  }, []);

  const closeNewMsg = () => {
    setNewMsgOpen(false);
    setSent(false);
    setNewMsg({ phone: "", name: "", body: "" });
    setContactSearch("");
    setSelectedContact(null);
  };

  const handleSend = async () => {
    if (!newMsg.phone.trim() || !newMsg.body.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    const contactForConv = selectedContact ?? {
      id: `c-${Date.now()}`,
      name: newMsg.name.trim() || newMsg.phone,
      phone: newMsg.phone,
      tags: [] as typeof contacts[0]["tags"],
      consent_status: "given" as const,
      created_at: new Date().toISOString().slice(0, 10),
    };
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      contact: contactForConv,
      last_message: newMsg.body,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      status: "open",
      messages: [
        { id: `m-${Date.now()}`, contact_id: `c-${Date.now()}`, contact_name: newMsg.phone, contact_phone: newMsg.phone, body: newMsg.body, direction: "outbound" as const, status: "delivered" as const, sent_at: new Date().toISOString() },
      ],
    };
    setConversations(prev => [newConv, ...prev]);
    setSending(false);
    setSent(true);
    setTimeout(() => {
      const displayName = selectedContact?.name || newMsg.name || newMsg.phone;
      closeNewMsg();
      showToast(`Message sent to ${displayName}.`);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
      <Topbar
        title="Inbox"
        subtitle="Read and reply to customer texts."
        actions={
          <Button size="sm" onClick={() => { setNewMsgOpen(true); setSent(false); }}>
            <MessageSquare className="w-4 h-4" /> Send SMS
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <Input
          placeholder="Search customers or phone numbers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />

        {open.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Needs a look · {open.length}</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
              {open.map((conv) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer sm:gap-4 sm:px-5">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold">
                        {conv.contact.name.charAt(0)}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={cn("text-sm font-medium", conv.unread_count > 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300")}>
                          {conv.contact.name}
                        </p>
                        {conv.contact.tags.includes("vip") && <Badge color="purple">VIP</Badge>}
                        {conv.contact.tags.includes("new") && <Badge color="green">New</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-xs text-slate-400">{formatRelative(conv.last_message_at)}</p>
                      <p className="text-xs text-slate-400 mt-1">{conv.contact.phone}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {resolved.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Handled · {resolved.length}</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800 opacity-70">
              {resolved.map((conv) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer sm:gap-4 sm:px-5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold shrink-0">
                      {conv.contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{conv.contact.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                    <p className="hidden text-xs text-slate-400 shrink-0 sm:block">{formatRelative(conv.last_message_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950/70">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="mt-3 text-sm font-medium text-slate-950 dark:text-white">No conversations match that search.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a customer name or phone number.</p>
          </div>
        )}
      </main>

      <Modal open={newMsgOpen} onClose={closeNewMsg} title="Send a text" size="md">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Message is on its way.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sent to {selectedContact?.name || newMsg.name || newMsg.phone}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Contact picker — shown when contacts exist */}
            {eligibleContacts.length > 0 && !selectedContact && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pick a contact</p>
                <Input
                  placeholder="Search contacts…"
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
                <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredContactPicker.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedContact(c); setNewMsg(m => ({ ...m, phone: c.phone, name: c.name })); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                  {filteredContactPicker.length === 0 && (
                    <p className="text-xs text-slate-400 px-3 py-3">No consented contacts match.</p>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">Or enter a number manually below</p>
              </div>
            )}

            {/* Selected contact chip */}
            {selectedContact && (
              <div className="flex items-center gap-2 p-2 bg-brand-50 dark:bg-brand-950/30 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {selectedContact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedContact.name}</p>
                  <p className="text-xs text-slate-400">{selectedContact.phone}</p>
                </div>
                <button onClick={() => { setSelectedContact(null); setNewMsg(m => ({ ...m, phone: "", name: "" })); }} className="text-slate-400 hover:text-slate-600 text-xs px-2">✕</button>
              </div>
            )}

            {/* Manual phone — shown when no contact selected */}
            {!selectedContact && (
              <Input
                label="Phone Number"
                placeholder="+1 (416) 555-0100"
                value={newMsg.phone}
                onChange={e => setNewMsg(m => ({ ...m, phone: e.target.value }))}
              />
            )}

            <Textarea
              label="Message"
              placeholder="Write a short, friendly text…"
              rows={4}
              value={newMsg.body}
              onChange={e => setNewMsg(m => ({ ...m, body: e.target.value }))}
              hint={`${newMsg.body.length}/160 characters`}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={closeNewMsg}>Cancel</Button>
              <Button
                className="flex-1"
                loading={sending}
                disabled={!newMsg.phone.trim() || !newMsg.body.trim()}
                onClick={handleSend}
              >
                <MessageSquare className="w-4 h-4" /> Send Text
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
