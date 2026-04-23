"use client";
/*
 * PAGE: Conversation Thread  (/messages/[id])
 * Full SMS thread between the business and one contact.
 * Shows inbound (customer) and outbound (business) bubbles with delivery status icons.
 * Reply box is blocked if the contact has opted out (CASL compliance).
 *
 * DATA (currently mock — swap when backend is ready):
 *   conversation → GET /api/conversations/:id  (getConversation in api.ts)
 *   send reply   → POST /api/messages           (sendMessage in api.ts)
 *
 * HOW TO CONNECT:
 *   import { getConversation, sendMessage } from "@/lib/api";
 *   const [conv, setConv] = useState(null);
 *   useEffect(() => { getConversation(id).then(setConv); }, [id]);
 *
 * REALTIME: subscribe to new messages for this conversation via Supabase Realtime.
 */
import { useState, use } from "react";
import { ArrowLeft, Send, CheckCheck, Check, Clock, AlertCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { conversations } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { MessageStatus } from "@/types";

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === "delivered" || status === "read") return <CheckCheck className="w-3.5 h-3.5 text-brand-500" />;
  if (status === "sent") return <Check className="w-3.5 h-3.5 text-slate-400" />;
  if (status === "failed") return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
  return <Clock className="w-3.5 h-3.5 text-slate-300" />;
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const conv = conversations.find(c => c.id === id);
  const [reply, setReply] = useState("");

  if (!conv) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <p>Conversation not found</p>
        <Link href="/messages" className="text-brand-600 mt-2 text-sm hover:underline">← Back to messages</Link>
      </div>
    );
  }

  const charInfo = `${reply.length}/160`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title={conv.contact.name}
        subtitle={conv.contact.phone}
        actions={
          <Link href="/messages">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        }
      />

      {/* Contact info strip */}
      <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-wrap">
        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm">
          {conv.contact.name.charAt(0)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {conv.contact.tags.map(tag => (
            <Badge key={tag} color={tag === "vip" ? "purple" : tag === "new" ? "green" : tag === "winback" ? "orange" : "blue"}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Badge>
          ))}
          <Badge color={conv.contact.consent_status === "given" ? "green" : conv.contact.consent_status === "pending" ? "yellow" : "red"}>
            {conv.contact.consent_status === "given" ? "CASL Consented" : conv.contact.consent_status === "pending" ? "Consent Pending" : "Opted Out"}
          </Badge>
        </div>
        <div className="ml-auto">
          <Badge color={conv.status === "open" ? "blue" : "gray"}>{conv.status}</Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conv.messages.map((msg) => {
          const isOut = msg.direction === "outbound";
          return (
            <div key={msg.id} className={cn("flex", isOut ? "justify-end" : "justify-start")}>
              {!isOut && (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-semibold mr-2 mt-1 shrink-0">
                  {conv.contact.name.charAt(0)}
                </div>
              )}
              <div className={cn("max-w-xs lg:max-w-md", isOut ? "items-end" : "items-start", "flex flex-col gap-1")}>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm",
                  isOut
                    ? "bg-brand-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                )}>
                  {msg.body}
                </div>
                <div className={cn("flex items-center gap-1 text-xs text-slate-400", isOut && "flex-row-reverse")}>
                  <span>{formatTime(msg.sent_at)}</span>
                  {isOut && <StatusIcon status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {conv.contact.consent_status === "opted_out" ? (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
            This contact opted out — you cannot send further messages (CASL compliance).
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{charInfo}</p>
            </div>
            <Button className="shrink-0 mb-6" disabled={!reply.trim()}>
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
