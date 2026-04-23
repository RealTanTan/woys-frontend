/**
 * WOYS API Layer
 *
 * Every function here is async and returns typed data.
 * Currently returns mock data so the UI works with no backend.
 *
 * When the backend is ready, replace each function body with a real fetch() call.
 * The shape of every return type must stay the same — the UI won't need to change.
 *
 * Base URL: set NEXT_PUBLIC_API_URL in .env.local
 * Auth:     Clerk session token — pass as Authorization: Bearer <token>
 */

import type {
  Contact, Conversation, Broadcast, Template,
  TeamMember, Organization, Ticket, AiPromoSuggestion,
} from "@/types";

import {
  contacts as mockContacts,
  conversations as mockConversations,
  broadcasts as mockBroadcasts,
  templates as mockTemplates,
  teamMembers as mockTeam,
  currentOrg as mockOrg,
  adminOrganizations as mockAdminOrgs,
  adminTickets as mockTickets,
  getAiSuggestions as mockAiSuggestions,
} from "./mock-data";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ─── Organization ─────────────────────────────────────────────────────────────

/** GET /api/org — current org profile + plan usage */
export async function getOrg(): Promise<Organization> {
  // TODO: return request<Organization>("/api/org");
  return mockOrg;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

/** GET /api/contacts — full contact list for the org */
export async function getContacts(): Promise<Contact[]> {
  // TODO: return request<Contact[]>("/api/contacts");
  return mockContacts;
}

/** POST /api/contacts — add a single contact manually */
export async function createContact(data: {
  name: string;
  phone: string;
  email?: string;
  tag: string;
}): Promise<Contact> {
  // TODO: return request<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(data) });
  return {
    id: `c-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    email: data.email,
    tags: [data.tag as Contact["tags"][number]],
    consent_status: "pending",
    created_at: new Date().toISOString().slice(0, 10),
  };
}

/** POST /api/contacts/import — upload CSV file, returns created count */
export async function importContactsCSV(file: File): Promise<{ created: number; failed: number }> {
  // TODO:
  // const form = new FormData();
  // form.append("file", file);
  // return request<{ created: number; failed: number }>("/api/contacts/import", { method: "POST", body: form });
  return { created: 42, failed: 0 };
}

/** POST /api/contacts/:id/consent — send CASL consent SMS to a contact */
export async function sendConsentRequest(contactId: string): Promise<{ sent: boolean }> {
  // TODO: return request<{ sent: boolean }>(`/api/contacts/${contactId}/consent`, { method: "POST" });
  return { sent: true };
}

// ─── Messages / Conversations ─────────────────────────────────────────────────

/** GET /api/conversations — all conversation threads */
export async function getConversations(): Promise<Conversation[]> {
  // TODO: return request<Conversation[]>("/api/conversations");
  return mockConversations;
}

/** GET /api/conversations/:id — single thread with messages */
export async function getConversation(id: string): Promise<Conversation | undefined> {
  // TODO: return request<Conversation>(`/api/conversations/${id}`);
  return mockConversations.find((c) => c.id === id);
}

/** POST /api/messages — send a one-to-one SMS */
export async function sendMessage(data: {
  phone: string;
  body: string;
  conversationId?: string;
}): Promise<{ messageId: string; status: string }> {
  // TODO: return request<{ messageId: string; status: string }>("/api/messages", { method: "POST", body: JSON.stringify(data) });
  return { messageId: `msg-${Date.now()}`, status: "queued" };
}

// ─── Broadcasts ───────────────────────────────────────────────────────────────

/** GET /api/broadcasts — all broadcast campaigns */
export async function getBroadcasts(): Promise<Broadcast[]> {
  // TODO: return request<Broadcast[]>("/api/broadcasts");
  return mockBroadcasts;
}

/** GET /api/broadcasts/:id — single broadcast with analytics */
export async function getBroadcast(id: string): Promise<Broadcast | undefined> {
  // TODO: return request<Broadcast>(`/api/broadcasts/${id}`);
  return mockBroadcasts.find((b) => b.id === id);
}

/** POST /api/broadcasts — create + send or schedule a broadcast */
export async function createBroadcast(data: {
  name: string;
  message: string;
  audience_type: string;
  scheduled_at?: string;
}): Promise<Broadcast> {
  // TODO: return request<Broadcast>("/api/broadcasts", { method: "POST", body: JSON.stringify(data) });
  return {
    id: `b-${Date.now()}`,
    name: data.name,
    message: data.message,
    audience_type: data.audience_type as Broadcast["audience_type"],
    status: data.scheduled_at ? "scheduled" : "sending",
    scheduled_at: data.scheduled_at,
    total_recipients: 0,
    sent_count: 0,
    delivered_count: 0,
    failed_count: 0,
    created_at: new Date().toISOString().slice(0, 10),
  };
}

/** DELETE /api/broadcasts/:id — cancel a scheduled broadcast */
export async function cancelBroadcast(id: string): Promise<void> {
  // TODO: await request<void>(`/api/broadcasts/${id}`, { method: "DELETE" });
}

// ─── Templates ────────────────────────────────────────────────────────────────

/** GET /api/templates */
export async function getTemplates(): Promise<Template[]> {
  // TODO: return request<Template[]>("/api/templates");
  return mockTemplates;
}

/** POST /api/templates */
export async function createTemplate(data: { name: string; body: string }): Promise<Template> {
  // TODO: return request<Template>("/api/templates", { method: "POST", body: JSON.stringify(data) });
  return { id: `t-${Date.now()}`, ...data, created_at: new Date().toISOString().slice(0, 10) };
}

/** PATCH /api/templates/:id */
export async function updateTemplate(id: string, data: { name: string; body: string }): Promise<Template> {
  // TODO: return request<Template>(`/api/templates/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return { id, ...data, created_at: new Date().toISOString().slice(0, 10) };
}

/** DELETE /api/templates/:id */
export async function deleteTemplate(id: string): Promise<void> {
  // TODO: await request<void>(`/api/templates/${id}`, { method: "DELETE" });
}

// ─── Team ─────────────────────────────────────────────────────────────────────

/** GET /api/team */
export async function getTeam(): Promise<TeamMember[]> {
  // TODO: return request<TeamMember[]>("/api/team");
  return mockTeam;
}

/** POST /api/team/invite */
export async function inviteTeamMember(data: { email: string; role: string }): Promise<void> {
  // TODO: await request<void>("/api/team/invite", { method: "POST", body: JSON.stringify(data) });
}

/** DELETE /api/team/:id */
export async function removeTeamMember(id: string): Promise<void> {
  // TODO: await request<void>(`/api/team/${id}`, { method: "DELETE" });
}

// ─── AI Suggestions ───────────────────────────────────────────────────────────

/** GET /api/ai/suggestions — AI-generated promo ideas for today */
export async function getAiSuggestions(): Promise<AiPromoSuggestion[]> {
  // TODO: return request<AiPromoSuggestion[]>("/api/ai/suggestions");
  return mockAiSuggestions();
}

// ─── Support Tickets (business side) ──────────────────────────────────────────

/** POST /api/tickets — business submits a support ticket */
export async function submitTicket(data: {
  subject: string;
  body: string;
  priority: string;
  screenshot?: File;
}): Promise<{ ticketId: string }> {
  // TODO:
  // const form = new FormData();
  // form.append("subject", data.subject);
  // form.append("body", data.body);
  // form.append("priority", data.priority);
  // if (data.screenshot) form.append("screenshot", data.screenshot);
  // return request<{ ticketId: string }>("/api/tickets", { method: "POST", body: form });
  return { ticketId: `tk-${Date.now()}` };
}

// ─── Admin: Organizations ─────────────────────────────────────────────────────

/** GET /api/admin/organizations */
export async function adminGetOrganizations(): Promise<Organization[]> {
  // TODO: return request<Organization[]>("/api/admin/organizations");
  return mockAdminOrgs;
}

/** GET /api/admin/organizations/:id */
export async function adminGetOrganization(id: string): Promise<Organization | undefined> {
  // TODO: return request<Organization>(`/api/admin/organizations/${id}`);
  return mockAdminOrgs.find((o) => o.id === id);
}

/** PATCH /api/admin/organizations/:id/suspend */
export async function adminSuspendOrg(id: string): Promise<void> {
  // TODO: await request<void>(`/api/admin/organizations/${id}/suspend`, { method: "PATCH" });
}

/** PATCH /api/admin/organizations/:id/plan */
export async function adminUpdatePlan(id: string, plan: string): Promise<void> {
  // TODO: await request<void>(`/api/admin/organizations/${id}/plan`, { method: "PATCH", body: JSON.stringify({ plan }) });
}

// ─── Admin: Tickets ───────────────────────────────────────────────────────────

/** GET /api/admin/tickets */
export async function adminGetTickets(): Promise<Ticket[]> {
  // TODO: return request<Ticket[]>("/api/admin/tickets");
  return mockTickets;
}

/** POST /api/admin/tickets/:id/reply */
export async function adminReplyTicket(id: string, data: {
  body: string;
  screenshot?: File;
}): Promise<void> {
  // TODO:
  // const form = new FormData();
  // form.append("body", data.body);
  // if (data.screenshot) form.append("screenshot", data.screenshot);
  // await request<void>(`/api/admin/tickets/${id}/reply`, { method: "POST", body: form });
}

/** PATCH /api/admin/tickets/:id/resolve */
export async function adminResolveTicket(id: string): Promise<void> {
  // TODO: await request<void>(`/api/admin/tickets/${id}/resolve`, { method: "PATCH" });
}
