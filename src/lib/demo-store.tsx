"use client";
/**
 * DEMO STORE — Global React Context for the business portal.
 *
 * WHY: Next.js page components unmount on navigation, resetting local state.
 * This context lives in the layout, so state (contacts, broadcasts, etc.)
 * survives page-to-page navigation for the entire tab session.
 *
 * For demo sessions (isDemoSession() === true): starts completely empty.
 * For real logins: initialises from mock-data as before.
 *
 * SWAP FOR REAL BACKEND: replace mock initialisers with SWR/React Query fetches.
 * The setter signatures stay identical — pages don't need to change.
 */
import { createContext, useContext, useState, ReactNode } from "react";
import {
  contacts as mockContacts,
  broadcasts as mockBroadcasts,
  templates as mockTemplates,
  flows as mockFlows,
  conversations as mockConversations,
  teamMembers as mockTeam,
  currentOrg,
} from "@/lib/mock-data";
import { isDemoSession, getUser } from "@/lib/auth";
import type {
  Contact, Broadcast, Template, Flow, Conversation, TeamMember,
} from "@/types";

// ─── Store shape ─────────────────────────────────────────────────────────────

export type DemoStore = {
  // Auth / org
  isDemo: boolean;
  orgName: string;
  orgEmail: string;
  orgSlug: string;
  smsNumber: string;
  messagesUsed: number;
  messagesLimit: number;

  // Data collections
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;

  broadcasts: Broadcast[];
  setBroadcasts: React.Dispatch<React.SetStateAction<Broadcast[]>>;

  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;

  flows: Flow[];
  setFlows: React.Dispatch<React.SetStateAction<Flow[]>>;

  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;

  team: TeamMember[];
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const StoreCtx = createContext<DemoStore | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  // Read flags once at mount — runs only on client (layout is client-wrapped)
  const isDemo  = typeof window !== "undefined" && isDemoSession();
  const user    = typeof window !== "undefined" ? getUser() : null;

  // Org metadata
  const orgName     = isDemo ? (user?.org    ?? "My Business")           : currentOrg.name;
  const orgEmail    = isDemo ? (user?.email  ?? "")                      : "hello@billiardbar.ca";
  const orgSlug     = isDemo ? (orgName.toLowerCase().replace(/\s+/g, "-")) : "billiard-bar";
  const smsNumber   = isDemo ? "+1 (XXX) XXX-XXXX"                       : currentOrg.sms_number;
  const messagesUsed  = isDemo ? 0                                        : currentOrg.messages_used;
  const messagesLimit = isDemo ? 5000                                     : currentOrg.messages_limit;

  // Data — empty for demo, mock for real login
  const [contacts,      setContacts]      = useState<Contact[]>     (isDemo ? [] : mockContacts);
  const [broadcasts,    setBroadcasts]    = useState<Broadcast[]>   (isDemo ? [] : mockBroadcasts);
  const [templates,     setTemplates]     = useState<Template[]>    (isDemo ? [] : mockTemplates);
  const [flows,         setFlows]         = useState<Flow[]>        (isDemo ? [] : mockFlows);
  const [conversations, setConversations] = useState<Conversation[]>(isDemo ? [] : mockConversations);
  const [team,          setTeam]          = useState<TeamMember[]>  (isDemo ? [] : mockTeam);

  return (
    <StoreCtx.Provider value={{
      isDemo, orgName, orgEmail, orgSlug, smsNumber, messagesUsed, messagesLimit,
      contacts,      setContacts,
      broadcasts,    setBroadcasts,
      templates,     setTemplates,
      flows,         setFlows,
      conversations, setConversations,
      team,          setTeam,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDemoStore(): DemoStore {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}
