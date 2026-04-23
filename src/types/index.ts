/*
 * TYPES — Single source of truth for all TypeScript interfaces.
 * Maps 1:1 to the Supabase database schema.
 *
 * BACKEND DEV NOTES:
 *   - All `id` fields are UUIDs (gen_random_uuid() in Postgres).
 *   - All `*_at` fields are ISO-8601 strings (timestamptz in Postgres → JSON string in API).
 *   - Every table has an `org_id` foreign key for multi-tenancy (RLS enforces it).
 *     The API layer strips org_id from responses — the frontend never sends it, the
 *     backend injects it from the authenticated session.
 *
 * DB TABLE → INTERFACE MAP:
 *   organizations  → Organization
 *   contacts       → Contact
 *   messages       → Message
 *   conversations  → Conversation  (view or join of contacts + messages)
 *   broadcasts     → Broadcast
 *   templates      → Template
 *   team_members   → TeamMember
 *   support_tickets         → Ticket
 *   support_ticket_messages → TicketMessage
 */

// ---------------------------------------------------------------------------
// Scalar / union types
// ---------------------------------------------------------------------------

/** organizations.plan column */
export type Plan = "trial" | "starter" | "growth" | "pro" | "enterprise";

/**
 * contacts.consent_status — CASL-critical field.
 *   "given"     → contact explicitly opted in. Safe to message.
 *   "pending"   → consent not yet confirmed. CANNOT send marketing SMS.
 *   "opted_out" → contact replied STOP. LEGALLY SUPPRESSED — never message again.
 *
 * The UI shows separate sections and banners for each state.
 * The broadcast system must filter to consent_status = "given" only.
 */
export type ConsentStatus = "given" | "pending" | "opted_out";

/** broadcasts.status — lifecycle of a campaign */
export type BroadcastStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";

/**
 * messages.status — Twilio delivery pipeline:
 *   queued → sent → delivered → read
 *   queued → sent → failed  (on Twilio error)
 */
export type MessageStatus = "queued" | "sent" | "delivered" | "failed" | "read";

/** messages.direction — inbound = from contact, outbound = from business */
export type MessageDirection = "inbound" | "outbound";

/**
 * contacts.tags (array column in Postgres: text[])
 * Used to define broadcast audiences:
 *   "vip"      → VIP customers  (broadcast audience_type: "vip")
 *   "new"      → New customers  (broadcast audience_type: "new_customers")
 *   "winback"  → Win-back list  (broadcast audience_type: "winback")
 *   "regular"  → No special tag (included in audience_type: "all")
 */
export type ContactTag = "vip" | "new" | "winback" | "regular";

/** support_tickets.status */
export type TicketStatus = "open" | "in_progress" | "resolved";

/** support_tickets.priority */
export type TicketPriority = "low" | "medium" | "high";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/**
 * DB table: organizations
 * Returned by: GET /api/org (current org) · GET /api/admin/organizations (all orgs)
 */
export interface Organization {
  id: string;                          // uuid PK
  name: string;                        // display name
  slug: string;                        // URL identifier (unique, immutable)
  plan: Plan;                          // billing plan
  sms_number: string;                  // Twilio long-code number e.g. "+16471234567"
  status: "active" | "suspended" | "trial";
  messages_used: number;               // SMS sent this billing cycle
  messages_limit: number;              // plan cap (reset monthly by cron)
  contacts_count: number;              // denormalized count — keep in sync on contact CRUD
  created_at: string;                  // ISO-8601
}

/**
 * DB table: contacts
 * Returned by: GET /api/contacts
 *
 * CASL fields:
 *   consent_status    → drives UI sections and message eligibility
 *   consent_given_at  → timestamp of opt-in (log for compliance audit)
 *   consent_source    → how they opted in: "import", "web_form", "manual", "sms_keyword"
 *   opted_out_at      → timestamp of STOP reply (log for compliance audit)
 */
export interface Contact {
  id: string;                          // uuid PK
  name: string;
  phone: string;                       // E.164 format e.g. "+14161234567"
  email?: string;
  tags: ContactTag[];                  // Postgres text[] — stored as array
  consent_status: ConsentStatus;
  consent_given_at?: string;           // ISO-8601 · null if pending/opted_out
  consent_source?: string;             // e.g. "manual", "csv_import", "web_form"
  opted_out_at?: string;               // ISO-8601 · null unless opted_out
  last_message_at?: string;            // ISO-8601 · denormalized for sorting inbox
  created_at: string;                  // ISO-8601
}

/**
 * DB table: messages
 * Child of conversations. Each SMS = one row.
 * Twilio webhook updates `status` as delivery progresses.
 *
 * Returned by: GET /api/conversations/:id/messages
 */
export interface Message {
  id: string;                          // uuid PK
  contact_id: string;                  // FK → contacts.id
  contact_name: string;                // denormalized for display
  contact_phone: string;               // E.164
  direction: MessageDirection;
  body: string;                        // SMS text content
  status: MessageStatus;               // updated by Twilio status callback webhook
  sent_at: string;                     // ISO-8601
}

/**
 * DB view / joined query: conversations
 * One conversation per contact — groups all messages with that contact.
 * `messages` array is loaded lazily (only when thread is opened).
 *
 * Returned by: GET /api/conversations · GET /api/conversations/:id
 */
export interface Conversation {
  id: string;                          // uuid (can use contact_id as conversation id)
  contact: Contact;                    // full contact object (joined)
  last_message: string;                // body of most recent message (denormalized)
  last_message_at: string;            // ISO-8601 (for inbox sort order)
  unread_count: number;               // inbound messages not yet read by business user
  status: "open" | "resolved";
  messages: Message[];                 // full thread — [] until thread is opened
}

/**
 * DB table: broadcasts
 * A mass SMS campaign sent to a tagged audience segment.
 *
 * audience_type drives which contacts receive the message:
 *   "vip"           → contacts WHERE "vip" = ANY(tags) AND consent_status = "given"
 *   "new_customers" → contacts WHERE "new" = ANY(tags) AND consent_status = "given"
 *   "winback"       → contacts WHERE "winback" = ANY(tags) AND consent_status = "given"
 *   "all"           → all contacts WHERE consent_status = "given"
 *   "custom"        → manually selected contact IDs (stored in broadcast_recipients table)
 *
 * Delivery counts updated by Twilio status callbacks as messages process.
 *
 * Returned by: GET /api/broadcasts · GET /api/broadcasts/:id
 */
export interface Broadcast {
  id: string;                          // uuid PK
  name: string;                        // internal campaign name
  message: string;                     // SMS body (max 160 chars for 1 segment)
  audience_type: "vip" | "new_customers" | "winback" | "all" | "custom";
  status: BroadcastStatus;
  scheduled_at?: string;               // ISO-8601 · null if sent immediately
  sent_at?: string;                    // ISO-8601 · null if draft/scheduled
  total_recipients: number;            // count at time of send
  sent_count: number;                  // Twilio accepted
  delivered_count: number;             // Twilio confirmed delivered
  failed_count: number;                // Twilio reported failed
  created_at: string;                  // ISO-8601
}

/**
 * DB table: templates
 * Reusable SMS message snippets. No audience — just text.
 *
 * Returned by: GET /api/templates
 */
export interface Template {
  id: string;                          // uuid PK
  name: string;                        // display label
  body: string;                        // SMS text content
  created_at: string;                  // ISO-8601
}

/**
 * DB table: team_members (or Clerk organization membership)
 * If using Clerk Organizations, `role` maps to Clerk's org role.
 *
 * Roles:
 *   "owner"   → full access, cannot be removed
 *   "manager" → can manage contacts, broadcasts, templates
 *   "agent"   → inbox/messaging only
 *
 * Returned by: GET /api/team
 */
export interface TeamMember {
  id: string;                          // uuid PK (or Clerk userId)
  name: string;
  email: string;
  role: "owner" | "manager" | "agent";
  avatar?: string;                     // URL to profile image
}

/**
 * DB table: support_ticket_messages
 * Individual chat message within a support ticket thread.
 *
 * screenshot_url: URL to uploaded image in Supabase Storage bucket "ticket-screenshots".
 * Sent as multipart/form-data via POST /api/tickets/:id/reply.
 */
export interface TicketMessage {
  id: string;                          // uuid PK
  sender_name: string;                 // display name of sender
  sender_role: "business" | "admin";  // drives chat bubble alignment in UI
  body: string;                        // message text
  screenshot_url?: string;            // Supabase Storage public URL · null if no attachment
  sent_at: string;                     // ISO-8601
}

/**
 * DB table: support_tickets
 * Support ticket submitted by a business to WOYS admins.
 * `messages` contains the full conversation thread.
 *
 * Returned by:
 *   Business: GET /api/tickets (own org only)
 *   Admin:    GET /api/admin/tickets (all orgs)
 */
export interface Ticket {
  id: string;                          // uuid PK
  org_name: string;                    // denormalized from organizations.name
  subject: string;                     // ticket title
  body: string;                        // initial message body
  status: TicketStatus;
  priority: TicketPriority;
  assigned_admin?: string;            // display name of WOYS admin handling it
  created_at: string;                  // ISO-8601
  messages: TicketMessage[];           // full thread (loaded with ticket)
}

/**
 * AI promo suggestion — returned by GET /api/ai/suggestions
 * Generated server-side (OpenAI or Claude) based on date/season context.
 * Not persisted to DB — generate on demand, optionally cache in Redis.
 */
export interface AiPromoSuggestion {
  title: string;   // short label e.g. "Mother's Day Special"
  body: string;    // ready-to-send SMS text
  reason: string;  // why this promo is relevant right now
}
