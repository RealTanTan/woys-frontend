"use client";
/*
 * PAGE: Admin — Support Tickets
 * Split-pane view: ticket list on left, full chat thread on right.
 * Admins can reply with text + screenshot attachment. Shows which admin responded.
 * Businesses submit tickets via the floating TicketButton on their portal.
 *
 * DATA (currently mock — swap when backend is ready):
 *   tickets    → GET  /api/admin/tickets          (adminGetTickets in api.ts)
 *   reply      → POST /api/admin/tickets/:id/reply (adminReplyTicket in api.ts)
 *   resolve    → PATCH/api/admin/tickets/:id/resolve (adminResolveTicket in api.ts)
 *
 * HOW TO CONNECT:
 *   import { adminGetTickets, adminReplyTicket, adminResolveTicket } from "@/lib/api";
 *   const [tickets, setTickets] = useState([]);
 *   useEffect(() => { adminGetTickets().then(setTickets); }, []);
 *
 * SCREENSHOTS: sent as multipart/form-data. See adminReplyTicket() in api.ts for the form shape.
 * REALTIME: subscribe to new ticket messages via Supabase Realtime for live updates.
 */
import { useState } from "react";
import { Send, Image as ImageIcon, Paperclip, X, Shield, Building2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { adminTickets } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate, formatTime, formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Ticket, TicketMessage } from "@/types";
import { useRef } from "react";

function TicketBadges({ ticket }: { ticket: Ticket }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge color={ticket.status === "open" ? "red" : ticket.status === "in_progress" ? "yellow" : "green"}>
        {ticket.status.replace("_", " ")}
      </Badge>
      <Badge color={ticket.priority === "high" ? "red" : ticket.priority === "medium" ? "yellow" : "gray"}>
        {ticket.priority}
      </Badge>
    </div>
  );
}

function ChatBubble({ msg }: { msg: TicketMessage }) {
  const isAdmin = msg.sender_role === "admin";
  const [imgOpen, setImgOpen] = useState(false);

  return (
    <div className={cn("flex gap-3", isAdmin ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1",
        isAdmin
          ? "bg-brand-600 text-white"
          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      )}>
        {isAdmin ? <Shield className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1 max-w-[75%]", isAdmin ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{msg.sender_name}</span>
          {isAdmin && (
            <Badge color="blue">Admin</Badge>
          )}
          <span className="text-xs text-slate-400">{formatRelative(msg.sent_at)}</span>
        </div>

        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          isAdmin
            ? "bg-brand-600 text-white rounded-tr-sm"
            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm"
        )}>
          {msg.body}
        </div>

        {/* Screenshot attachment */}
        {msg.screenshot_url && (
          <div className="mt-1">
            <button
              onClick={() => setImgOpen(true)}
              className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={msg.screenshot_url}
                alt="Attached screenshot"
                className="w-48 h-28 object-cover group-hover:opacity-90 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> screenshot.png
              </div>
            </button>
          </div>
        )}

        <span className="text-[10px] text-slate-400">{formatTime(msg.sent_at)}</span>
      </div>

      {/* Lightbox */}
      {imgOpen && msg.screenshot_url && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setImgOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={msg.screenshot_url} alt="Screenshot" className="max-w-full max-h-full rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function TicketThread({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>(ticket.messages);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!reply.trim()) return;
    const newMsg: TicketMessage = {
      id: `tkm-${Date.now()}`,
      sender_name: "Mike T.",
      sender_role: "admin",
      body: reply,
      screenshot_url: screenshotPreview ?? undefined,
      sent_at: new Date().toISOString(),
    };
    setMessages(m => [...m, newMsg]);
    setReply("");
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{ticket.subject}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {ticket.org_name} · Opened {formatDate(ticket.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <TicketBadges ticket={ticket} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {ticket.assigned_admin && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Handled by <span className="font-medium text-slate-700 dark:text-slate-300">{ticket.assigned_admin}</span>
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-slate-950">
        {messages.map(msg => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Reply box */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
        {ticket.status === "resolved" && (
          <div className="text-xs text-slate-400 text-center pb-1">This ticket is resolved. You can still send a follow-up.</div>
        )}
        {screenshotPreview && (
          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotPreview} alt="attach" className="w-full h-full object-cover" />
            <button
              onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition shrink-0"
            title="Attach screenshot"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Reply as admin..."
            rows={2}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!reply.trim()}
            className="shrink-0 mb-1"
            size="sm"
          >
            <Send className="w-4 h-4" /> Send
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-right">⌘ + Enter to send</p>
      </div>
    </div>
  );
}

export default function AdminTicketsPage() {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Ticket | null>(null);

  const tabs = [
    { id: "all",         label: "All",         count: adminTickets.length },
    { id: "open",        label: "Open",        count: adminTickets.filter(t => t.status === "open").length },
    { id: "in_progress", label: "In Progress", count: adminTickets.filter(t => t.status === "in_progress").length },
    { id: "resolved",    label: "Resolved",    count: adminTickets.filter(t => t.status === "resolved").length },
  ];

  const filtered = tab === "all" ? adminTickets : adminTickets.filter(t => t.status === tab);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Ticket list panel */}
      <div className={cn(
        "flex flex-col border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all",
        selected ? "w-72 shrink-0" : "flex-1"
      )}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Support Tickets</h1>
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={cn(
                "w-full text-left p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50",
                selected?.id === t.id && "bg-brand-50 dark:bg-brand-950/30 border-r-2 border-brand-500"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{t.subject}</p>
                <TicketBadges ticket={t} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.org_name} · {formatDate(t.created_at)}</p>
              <p className="text-xs text-slate-400 line-clamp-2">{t.messages[t.messages.length - 1]?.body}</p>
              {t.assigned_admin && (
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-600 flex items-center justify-center">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-[10px] text-slate-400">{t.assigned_admin}</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Paperclip className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                <span className="text-[10px] text-slate-400">
                  {t.messages.filter(m => m.screenshot_url).length > 0
                    ? `${t.messages.filter(m => m.screenshot_url).length} screenshot${t.messages.filter(m => m.screenshot_url).length > 1 ? "s" : ""}`
                    : "No attachments"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread panel */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TicketThread ticket={selected} onClose={() => setSelected(null)} />
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Send className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm">Select a ticket to view the conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
