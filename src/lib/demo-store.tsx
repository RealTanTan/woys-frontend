"use client";
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
  isDemo: boolean;
  orgName: string;
  orgEmail: string;
  orgSlug: string;
  smsNumber: string;
  currentPlan: string;
  setCurrentPlan: (plan: string) => void;
  messagesUsed: number;
  setMessagesUsed: React.Dispatch<React.SetStateAction<number>>;
  messagesLimit: number;
  setMessagesLimit: React.Dispatch<React.SetStateAction<number>>;
  cancelDate: string | null;           // ISO date string when set
  setCancelDate: React.Dispatch<React.SetStateAction<string | null>>;

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

const StoreCtx = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const isDemo = typeof window !== "undefined" && isDemoSession();
  const user   = typeof window !== "undefined" ? getUser() : null;

  const orgName  = isDemo ? (user?.org   ?? "My Business")                         : currentOrg.name;
  const orgEmail = isDemo ? (user?.email ?? "")                                    : "hello@billiardbar.ca";
  const orgSlug  = isDemo ? orgName.toLowerCase().replace(/\s+/g, "-")             : "billiard-bar";
  const smsNumber = isDemo ? "+1 (XXX) XXX-XXXX"                                   : currentOrg.sms_number;

  const [currentPlan,   setCurrentPlanRaw] = useState<string>(isDemo ? "growth" : currentOrg.plan);
  const setCurrentPlan = (plan: string) => setCurrentPlanRaw(plan);
  const [messagesUsed,  setMessagesUsed]  = useState(isDemo ? 0                         : currentOrg.messages_used);
  const [messagesLimit, setMessagesLimit] = useState(isDemo ? 5000                      : currentOrg.messages_limit);
  const [cancelDate,    setCancelDate]    = useState<string | null>(null);

  const [contacts,      setContacts]      = useState<Contact[]>     (isDemo ? [] : mockContacts);
  const [broadcasts,    setBroadcasts]    = useState<Broadcast[]>   (isDemo ? [] : mockBroadcasts);
  const [templates,     setTemplates]     = useState<Template[]>    (isDemo ? [] : mockTemplates);
  const [flows,         setFlows]         = useState<Flow[]>        (isDemo ? [] : mockFlows);
  const [conversations, setConversations] = useState<Conversation[]>(isDemo ? [] : mockConversations);
  const [team,          setTeam]          = useState<TeamMember[]>  (isDemo ? [] : mockTeam);

  return (
    <StoreCtx.Provider value={{
      isDemo, orgName, orgEmail, orgSlug, smsNumber,
      currentPlan, setCurrentPlan,
      messagesUsed, setMessagesUsed,
      messagesLimit, setMessagesLimit,
      cancelDate, setCancelDate,
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

export function useDemoStore(): DemoStore {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}
