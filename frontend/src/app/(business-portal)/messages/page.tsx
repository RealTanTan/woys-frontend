"use client";
/*
 * PAGE: Messages (Inbox)
 * Lists all 1-to-1 SMS conversations, split into Open and Resolved.
 * Clicking a conversation opens the full thread (/messages/[id]).
 * "New Message" button lets the business send a one-off SMS to any phone number.
 *
 * DATA (currently mock — swap when backend is ready):
 *   conversations → GET /api/conversations  (getConversations in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getConversations, sendMessage } from "@/lib/api";
 *   const [conversations, setConversations] = useState([]);
 *   useEffect(() => { getConversations().then(setConversations); }, []);
 *
 * REALTIME: wire Supabase Realtime here to push new inbound messages live.
 */
import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { conversations } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatRelative } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsg, setNewMsg] = useState({ phone: "", body: "" });

  const filtered = conversations.filter(c =>
    c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.phone.includes(search)
  );

  const open = filtered.filter(c => c.status === "open");
  const resolved = filtered.filter(c => c.status === "resolved");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Messages"
        subtitle="Individual conversations"
        actions={
          <Button size="sm" onClick={() => setNewMsgOpen(true)}>
            <MessageSquare className="w-4 h-4" /> New Message
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />

        {open.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Open · {open.length}</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
              {open.map((conv) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
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
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-medium", conv.unread_count > 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300")}>
                          {conv.contact.name}
                        </p>
                        {conv.contact.tags.includes("vip") && <Badge color="purple">VIP</Badge>}
                        {conv.contact.tags.includes("new") && <Badge color="green">New</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                    <div className="shrink-0 text-right">
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
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Resolved · {resolved.length}</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800 opacity-70">
              {resolved.map((conv) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold shrink-0">
                      {conv.contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{conv.contact.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">{formatRelative(conv.last_message_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Modal open={newMsgOpen} onClose={() => setNewMsgOpen(false)} title="New Message" size="md">
        <div className="space-y-4">
          <Input label="Phone Number" placeholder="+1 (416) 555-0100" value={newMsg.phone} onChange={e => setNewMsg(m => ({ ...m, phone: e.target.value }))} />
          <Textarea
            label="Message"
            placeholder="Type your message..."
            rows={4}
            value={newMsg.body}
            onChange={e => setNewMsg(m => ({ ...m, body: e.target.value }))}
            hint={`${newMsg.body.length}/160 characters`}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setNewMsgOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => setNewMsgOpen(false)}>Send SMS</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
