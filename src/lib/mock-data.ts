import type {
  Contact, Conversation, Broadcast, Template,
  TeamMember, Organization, Ticket, AiPromoSuggestion, Message, Flow, FlowStep,
} from "@/types";

// placeholder screenshot (data URI of a tiny grey box — no external URL needed)
const MOCK_SCREENSHOT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAABmJLR0QA/wD/AP+gvaeTAAAAUklEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBxAABHgF4TQAAAABJRU5ErkJggg==";

// ── Current org (business portal) ─────────────────────────────────────────────
export const currentOrg: Organization = {
  id: "org-1",
  name: "Billiard Bar & Club",
  slug: "billiard-bar",
  plan: "growth",
  sms_number: "+1 (416) 555-0192",
  status: "active",
  messages_used: 3_840,
  messages_limit: 5_000,
  contacts_count: 312,
  created_at: "2024-09-01",
};

// ── Contacts ──────────────────────────────────────────────────────────────────
export const contacts: Contact[] = [
  {
    id: "c1", name: "Amir Tehrani", phone: "+14165550101", email: "amir@example.com",
    tags: ["vip"], consent_status: "given", consent_given_at: "2024-10-05",
    consent_source: "sms_keyword", last_message_at: "2025-04-18", created_at: "2024-10-05",
  },
  {
    id: "c2", name: "Sara Kowalski", phone: "+14165550102",
    tags: ["new"], consent_status: "given", consent_given_at: "2025-03-22",
    consent_source: "web_form", last_message_at: "2025-04-20", created_at: "2025-03-22",
  },
  {
    id: "c3", name: "Marcus Bell", phone: "+14165550103",
    tags: ["winback"], consent_status: "given", consent_given_at: "2024-08-14",
    consent_source: "sms_keyword", last_message_at: "2025-01-10", created_at: "2024-08-14",
  },
  {
    id: "c4", name: "Priya Sharma", phone: "+14165550104", email: "priya@example.com",
    tags: ["vip", "regular"], consent_status: "given", consent_given_at: "2024-11-30",
    consent_source: "import", last_message_at: "2025-04-21", created_at: "2024-11-30",
  },
  {
    id: "c5", name: "James Okonkwo", phone: "+14165550105",
    tags: ["regular"], consent_status: "pending",
    created_at: "2025-04-10",
  },
  {
    id: "c6", name: "Lena Müller", phone: "+14165550106",
    tags: [], consent_status: "pending",
    created_at: "2025-04-15",
  },
  {
    id: "c7", name: "David Chen", phone: "+14165550107", email: "david@example.com",
    tags: ["regular"], consent_status: "pending",
    created_at: "2025-04-18",
  },
  {
    id: "c8", name: "Fatima Al-Hassan", phone: "+14165550108",
    tags: ["winback"], consent_status: "opted_out",
    opted_out_at: "2025-02-10", created_at: "2024-07-01",
  },
  {
    id: "c9", name: "Tom Nguyen", phone: "+14165550109",
    tags: ["vip"], consent_status: "opted_out",
    opted_out_at: "2025-03-05", created_at: "2024-09-15",
  },
  {
    id: "c10", name: "Rachel Green", phone: "+14165550110",
    tags: ["new"], consent_status: "opted_out",
    opted_out_at: "2025-04-01", created_at: "2025-01-20",
  },
];

// ── Conversations / Individual Messages ───────────────────────────────────────
const buildMsgs = (contactId: string, contactName: string, phone: string, msgs: Omit<Message, "contact_id" | "contact_name" | "contact_phone">[]): Message[] =>
  msgs.map(m => ({ ...m, contact_id: contactId, contact_name: contactName, contact_phone: phone }));

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    contact: contacts[0],
    last_message: "Thanks! See you tonight 🎱",
    last_message_at: "2025-04-18T20:14:00Z",
    unread_count: 0,
    status: "open",
    messages: buildMsgs("c1", "Amir Tehrani", "+14165550101", [
      { id: "m1", direction: "outbound", body: "Hey Amir! Happy Hour starts at 5 PM tonight — come in for 20% off pool tables.", status: "delivered", sent_at: "2025-04-18T16:00:00Z" },
      { id: "m2", direction: "inbound", body: "Thanks! See you tonight 🎱", status: "read", sent_at: "2025-04-18T20:14:00Z" },
    ]),
  },
  {
    id: "conv-2",
    contact: contacts[1],
    last_message: "Welcome to the club, Sara! Reply STOP anytime to opt out.",
    last_message_at: "2025-04-20T10:30:00Z",
    unread_count: 1,
    status: "open",
    messages: buildMsgs("c2", "Sara Kowalski", "+14165550102", [
      { id: "m3", direction: "outbound", body: "Welcome to the club, Sara! Reply STOP anytime to opt out.", status: "delivered", sent_at: "2025-04-20T10:30:00Z" },
    ]),
  },
  {
    id: "conv-3",
    contact: contacts[3],
    last_message: "Can I book a table for Saturday?",
    last_message_at: "2025-04-21T14:22:00Z",
    unread_count: 2,
    status: "open",
    messages: buildMsgs("c4", "Priya Sharma", "+14165550104", [
      { id: "m5", direction: "outbound", body: "Hi Priya! We miss you. Come back this weekend — first hour free on any table.", status: "delivered", sent_at: "2025-04-21T09:00:00Z" },
      { id: "m6", direction: "inbound", body: "Can I book a table for Saturday?", status: "read", sent_at: "2025-04-21T14:22:00Z" },
    ]),
  },
  {
    id: "conv-4",
    contact: contacts[2],
    last_message: "Don't miss our league night this Thursday!",
    last_message_at: "2025-01-10T18:00:00Z",
    unread_count: 0,
    status: "resolved",
    messages: buildMsgs("c3", "Marcus Bell", "+14165550103", [
      { id: "m7", direction: "outbound", body: "Don't miss our league night this Thursday!", status: "delivered", sent_at: "2025-01-10T18:00:00Z" },
    ]),
  },
];

// ── Broadcasts ────────────────────────────────────────────────────────────────
export const broadcasts: Broadcast[] = [
  {
    id: "b1", name: "Easter Weekend Special",
    message: "🐣 Happy Easter! Enjoy 25% off all pool table bookings this weekend. Show this text at the door. Reply STOP to opt out.",
    audience_type: "all", status: "sent",
    sent_at: "2025-04-18T10:00:00Z",
    total_recipients: 248, sent_count: 248, delivered_count: 241, failed_count: 7,
    created_at: "2025-04-16",
  },
  {
    id: "b2", name: "VIP Friday Night",
    message: "Hey VIP! You're invited to our exclusive Friday night event — open bar 9–11 PM. Show this text at the door.",
    audience_type: "vip", status: "sent",
    sent_at: "2025-04-11T14:00:00Z",
    total_recipients: 45, sent_count: 45, delivered_count: 44, failed_count: 1,
    created_at: "2025-04-09",
  },
  {
    id: "b3", name: "Win-Back: We Miss You",
    message: "It's been a while! Come back this month and get your first hour FREE. Valid until April 30. Reply STOP to opt out.",
    audience_type: "winback", status: "sent",
    sent_at: "2025-04-05T11:00:00Z",
    total_recipients: 68, sent_count: 68, delivered_count: 60, failed_count: 8,
    created_at: "2025-04-03",
  },
  {
    id: "b4", name: "New Member Welcome",
    message: "Welcome to Billiard Bar & Club! 🎱 Show this text for a free game on your first visit. Reply STOP to opt out.",
    audience_type: "new_customers", status: "scheduled",
    scheduled_at: "2025-04-25T10:00:00Z",
    total_recipients: 22, sent_count: 0, delivered_count: 0, failed_count: 0,
    created_at: "2025-04-22",
  },
  {
    id: "b5", name: "May Long Weekend Promo",
    message: "🍻 May Long Weekend is here! Half-price pool tables all day Saturday & Sunday. Bring a friend!",
    audience_type: "all", status: "draft",
    total_recipients: 0, sent_count: 0, delivered_count: 0, failed_count: 0,
    created_at: "2025-04-22",
  },
];

// ── Templates ─────────────────────────────────────────────────────────────────
export const templates: Template[] = [
  { id: "t1", name: "Welcome New Member", body: "Welcome to {{business_name}}! 🎱 Show this text for a free game on your first visit. Reply STOP to opt out.", created_at: "2025-01-15" },
  { id: "t2", name: "Happy Hour Reminder", body: "Hey {{first_name}}! Happy Hour starts at 5 PM today — 20% off all pool tables. See you soon! Reply STOP to opt out.", created_at: "2025-02-01" },
  { id: "t3", name: "Win-Back Offer", body: "It's been a while, {{first_name}}! We miss you. Come back this month and get your first hour FREE. Valid until {{expiry}}. Reply STOP to opt out.", created_at: "2025-02-14" },
  { id: "t4", name: "Event Invite - VIP", body: "Hey VIP! You're invited to our exclusive event on {{date}} — {{event_detail}}. Show this text at the door.", created_at: "2025-03-01" },
  { id: "t5", name: "Holiday Promo", body: "🎉 Happy {{holiday}}! Enjoy {{discount}} off at {{business_name}} this {{period}}. Reply STOP to opt out.", created_at: "2025-03-20" },
];

// ── Team ──────────────────────────────────────────────────────────────────────
export const teamMembers: TeamMember[] = [
  { id: "u1", name: "Arash Karimi", email: "arash@billiardbar.ca", role: "owner" },
  { id: "u2", name: "Jessica Lam", email: "jessica@billiardbar.ca", role: "manager" },
  { id: "u3", name: "Tyler Ross", email: "tyler@billiardbar.ca", role: "agent" },
];

// ── Admin: All organizations ───────────────────────────────────────────────────
export const adminOrganizations: Organization[] = [
  { id: "org-1", name: "Billiard Bar & Club", slug: "billiard-bar", plan: "growth", sms_number: "+1 (416) 555-0192", status: "active", messages_used: 3840, messages_limit: 5000, contacts_count: 312, created_at: "2024-09-01" },
  { id: "org-2", name: "QuickChange FX", slug: "quickchange-fx", plan: "starter", sms_number: "+1 (416) 555-0274", status: "active", messages_used: 720, messages_limit: 1000, contacts_count: 89, created_at: "2024-11-15" },
  { id: "org-3", name: "Urban Barbers", slug: "urban-barbers", plan: "trial", sms_number: "+1 (647) 555-0318", status: "trial", messages_used: 48, messages_limit: 100, contacts_count: 23, created_at: "2025-04-10" },
  { id: "org-4", name: "Maple Leaf Diner", slug: "maple-leaf-diner", plan: "pro", sms_number: "+1 (905) 555-0445", status: "active", messages_used: 9200, messages_limit: 15000, contacts_count: 1204, created_at: "2024-06-20" },
  { id: "org-5", name: "FitZone Gym", slug: "fitzone-gym", plan: "starter", sms_number: "+1 (416) 555-0512", status: "suspended", messages_used: 950, messages_limit: 1000, contacts_count: 145, created_at: "2024-12-01" },
];

// ── Admin: Tickets ─────────────────────────────────────────────────────────────
export const adminTickets: Ticket[] = [
  {
    id: "tk1", org_name: "QuickChange FX", subject: "CSV import not working",
    body: "I tried importing 200 contacts from a CSV file but the import gets stuck at 0%.",
    status: "open", priority: "high", created_at: "2025-04-21",
    messages: [
      { id: "tkm1", sender_name: "QuickChange FX", sender_role: "business", body: "I tried importing 200 contacts from a CSV file but the import gets stuck at 0%. I've attached a screenshot of the error.", screenshot_url: MOCK_SCREENSHOT, sent_at: "2025-04-21T09:15:00Z" },
    ],
  },
  {
    id: "tk2", org_name: "Urban Barbers", subject: "How do I get consent from existing customers?",
    body: "We have a list of phone numbers from our booking app. How do we collect CASL consent?",
    status: "in_progress", priority: "medium", assigned_admin: "Sarah K.", created_at: "2025-04-19",
    messages: [
      { id: "tkm2", sender_name: "Urban Barbers", sender_role: "business", body: "We have a list of phone numbers from our booking app. How do we collect CASL consent before sending any promos?", sent_at: "2025-04-19T11:00:00Z" },
      { id: "tkm3", sender_name: "Sarah K.", sender_role: "admin", body: "Great question! You can send a one-time consent request SMS to each number. In Contacts, hover over a pending contact and click 'Send Consent'. Once they reply YES they're active. You can also use the CSV import to bulk-add and trigger consent requests automatically.", sent_at: "2025-04-19T13:30:00Z" },
      { id: "tkm4", sender_name: "Urban Barbers", sender_role: "business", body: "That helps! What message gets sent to them — can we customize it?", sent_at: "2025-04-19T14:05:00Z" },
      { id: "tkm5", sender_name: "Sarah K.", sender_role: "admin", body: "Yes — go to Settings → SMS & CASL. You'll see the STOP message config there. We'll be adding consent message customization in the next release. I've flagged it as a feature request for you.", sent_at: "2025-04-19T15:00:00Z" },
    ],
  },
  {
    id: "tk3", org_name: "Billiard Bar & Club", subject: "Scheduled broadcast didn't send at the right time",
    body: "The Easter promo was scheduled for 10 AM but it went out at noon.",
    status: "resolved", priority: "high", assigned_admin: "Mike T.", created_at: "2025-04-15",
    messages: [
      { id: "tkm6", sender_name: "Billiard Bar & Club", sender_role: "business", body: "The Easter promo was scheduled for 10 AM but it went out at noon. Here's a screenshot from our broadcasts page.", screenshot_url: MOCK_SCREENSHOT, sent_at: "2025-04-15T13:00:00Z" },
      { id: "tkm7", sender_name: "Mike T.", sender_role: "admin", body: "I'm sorry about that — we identified a timezone offset bug in our scheduler. Your account was set to UTC instead of Eastern Time (ET). I've corrected the timezone to America/Toronto and the broadcast queue is now accurate. All future scheduled broadcasts will fire at your local time.", sent_at: "2025-04-15T14:15:00Z" },
      { id: "tkm8", sender_name: "Billiard Bar & Club", sender_role: "business", body: "Thanks for the quick fix! Good to know.", sent_at: "2025-04-15T14:40:00Z" },
      { id: "tkm9", sender_name: "Mike T.", sender_role: "admin", body: "You're welcome! I'm marking this as resolved. Don't hesitate to reach out if you notice anything else.", sent_at: "2025-04-15T14:45:00Z" },
    ],
  },
  {
    id: "tk4", org_name: "Maple Leaf Diner", subject: "Upgrade to enterprise plan",
    body: "We're growing fast and need to upgrade our plan. Who should I speak to?",
    status: "open", priority: "low", created_at: "2025-04-20",
    messages: [
      { id: "tkm10", sender_name: "Maple Leaf Diner", sender_role: "business", body: "We're growing fast — we hit our monthly limit twice now. We'd like to move to an enterprise plan. Who should I speak to, and is there a custom pricing option?", sent_at: "2025-04-20T10:00:00Z" },
    ],
  },
];

// ── AI Promo Suggestions (mock) ────────────────────────────────────────────────
export function getAiSuggestions(): AiPromoSuggestion[] {
  const today = new Date();
  const month = today.getMonth(); // 0-indexed
  const day = today.getDate();
  const dow = today.getDay(); // 0 = Sunday

  const suggestions: AiPromoSuggestion[] = [];

  // Day-of-week suggestions
  if (dow === 5) { // Friday
    suggestions.push({
      title: "TGIF Happy Hour",
      body: "🍻 It's Friday! Kick off the weekend with 25% off pool tables from 4–7 PM tonight. Show this text at the door. Reply STOP to opt out.",
      reason: "Friday evenings drive 40% more foot traffic — a time-limited offer maximizes urgency.",
    });
  }
  if (dow === 0 || dow === 6) { // Weekend
    suggestions.push({
      title: "Weekend Special",
      body: "🎱 Weekend vibes! Book a table today and get the second hour FREE. Perfect for a crew night out. Reply STOP to opt out.",
      reason: "Weekend promotions perform 2× better on Saturday/Sunday for leisure venues.",
    });
  }
  if (dow === 1) { // Monday
    suggestions.push({
      title: "Beat the Monday Blues",
      body: "Monday got you down? Come unwind tonight — all pool tables $5/hr until 10 PM. Reply STOP to opt out.",
      reason: "Monday specials recover the slowest night of the week and build a loyal mid-week crowd.",
    });
  }

  // Month-based suggestions
  if (month === 3) { // April
    if (day <= 20) {
      suggestions.push({
        title: "Easter Weekend Promo",
        body: "🐣 Happy Easter! Celebrate with 20% off this weekend — bring the family in for a fun game night. Reply STOP to opt out.",
        reason: "Easter weekend is one of the top leisure spending weekends in Ontario.",
      });
    }
    suggestions.push({
      title: "Spring Has Arrived",
      body: "☀️ Spring is here and so are our spring deals! Pool tables 30% off this week. Don't miss it. Reply STOP to opt out.",
      reason: "Spring promotions tap into seasonal optimism and increased social outings.",
    });
  }
  if (month === 4) { // May
    suggestions.push({
      title: "May Long Weekend Blowout",
      body: "🍺 May Long Weekend is here! Half-price tables all Saturday & Sunday. Bring your crew! Reply STOP to opt out.",
      reason: "Victoria Day weekend is the busiest long weekend of the spring in Ontario.",
    });
  }
  if (month === 11) { // December
    suggestions.push({
      title: "Holiday Party Night",
      body: "🎄 Looking for a holiday party spot? Book the full hall for your team — catering + pool tables included. Reply STOP to opt out.",
      reason: "December corporate bookings are 3× higher — target groups for private events.",
    });
  }

  // Universal fallback
  suggestions.push({
    title: "Loyalty Reward Drop",
    body: "Hey VIP! As one of our best customers, enjoy an exclusive 30% discount this week only. You deserve it! Reply STOP to opt out.",
    reason: "VIP-targeted messages have a 60% higher redemption rate than general promotions.",
  });

  return suggestions.slice(0, 3);
}

// ── Automation Flows ──────────────────────────────────────────────────────────
export const flows: Flow[] = [
  {
    id: "fl1",
    name: "Welcome Series",
    trigger_type: "contact_joins",
    is_active: true,
    sent_count: 134,
    replied_count: 28,
    created_at: "2025-01-10",
    steps: [
      { id: "fls1", step_order: 0, delay_hours: 0,  message_body: "Welcome to {{business_name}}! 🎱 We're so glad you joined. Show this text for a free game on your first visit. Reply STOP to opt out." },
      { id: "fls2", step_order: 1, delay_hours: 72, message_body: "Hey {{first_name}}! Just checking in — have you had a chance to come by yet? Your free game offer is still waiting. 🎱" },
      { id: "fls3", step_order: 2, delay_hours: 168, message_body: "Last chance, {{first_name}}! Your welcome offer expires soon. See you at {{business_name}}! Reply STOP to opt out." },
    ],
  },
  {
    id: "fl2",
    name: "Win-Back Campaign",
    trigger_type: "date",
    is_active: true,
    sent_count: 89,
    replied_count: 14,
    created_at: "2025-02-01",
    steps: [
      { id: "fls4", step_order: 0, delay_hours: 0,   message_body: "We miss you, {{first_name}}! It's been a while. Come back this month for 50% off your first hour. Reply STOP to opt out." },
      { id: "fls5", step_order: 1, delay_hours: 120, message_body: "Hey {{first_name}}! Your win-back offer ends in 48 hours. Don't miss out! Reply STOP to opt out." },
    ],
  },
  {
    id: "fl3",
    name: "Abandoned Booking Reminder",
    trigger_type: "custom_event",
    is_active: false,
    sent_count: 0,
    replied_count: 0,
    created_at: "2025-03-15",
    steps: [
      { id: "fls6", step_order: 0, delay_hours: 1,  message_body: "Hi {{first_name}}! You started a booking but didn't finish. Complete it now and get 10% off. Reply STOP to opt out." },
      { id: "fls7", step_order: 1, delay_hours: 24, message_body: "Still thinking about it? Your 10% off code expires tonight. Book now at {{business_name}}. Reply STOP to opt out." },
    ],
  },
];
