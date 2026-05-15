"use client";
/*
 * AUTH — Mock authentication layer.
 * Currently uses localStorage to simulate a logged-in session.
 *
 * ─── HOW TO REPLACE WITH CLERK ───────────────────────────────────────────────
 *
 * 1. Install Clerk:
 *      npm install @clerk/nextjs
 *
 * 2. Add env vars (.env.local):
 *      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
 *      CLERK_SECRET_KEY=sk_...
 *      NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
 *      NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
 *
 * 3. Wrap root layout with <ClerkProvider> in src/app/layout.tsx.
 *
 * 4. Replace `mockLogin()` calls in login pages with Clerk's <SignIn /> component
 *    or `useSignIn()` hook. Clerk handles session storage automatically.
 *
 * 5. Replace `getUser()` calls in components with Clerk's `useUser()` hook:
 *      import { useUser } from "@clerk/nextjs";
 *      const { user } = useUser();
 *      // user.publicMetadata.role → "admin" | "owner" | "manager" | "agent"
 *
 * 6. Replace `mockLogout()` calls with Clerk's `useClerk().signOut()`.
 *
 * 7. In api.ts → request() helper, attach Clerk session token to every request:
 *      import { auth } from "@clerk/nextjs/server";
 *      const { getToken } = auth();
 *      const token = await getToken();
 *      headers: { Authorization: `Bearer ${token}` }
 *
 * 8. Protect admin routes server-side:
 *      import { auth, currentUser } from "@clerk/nextjs/server";
 *      const user = await currentUser();
 *      if (user?.publicMetadata?.role !== "super_admin") redirect("/login");
 *
 * ─── ROLES ───────────────────────────────────────────────────────────────────
 *   "admin"   → WOYS super-admin. Access to /admin/* portal only.
 *   "owner"   → Business owner. Full access to business portal.
 *   "manager" → Business staff. Can manage contacts, broadcasts, templates.
 *   "agent"   → Business staff. Inbox + messaging only.
 *
 *   Store role in Clerk publicMetadata.role (set via Clerk dashboard or backend API).
 *
 * ─── DEMO CREDENTIALS (mock only — remove before production) ─────────────────
 *   Business: arash@billiardbar.ca / demo123
 *   Admin:    admin@woys.ca / admin123
 * ─────────────────────────────────────────────────────────────────────────────
 */

type MockUser = {
  role: "admin" | "owner" | "manager" | "agent";
  name: string;
  email: string;
  org?: string;
};

let memoryUser: MockUser | null = null;

function storageAvailable(type: "localStorage" | "sessionStorage" = "localStorage"): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "__woys_storage_test__";
    window[type].setItem(key, "1");
    window[type].removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function saveUser(user: MockUser, session = false) {
  memoryUser = user;
  if (typeof window === "undefined") return;
  try {
    if (session && storageAvailable("sessionStorage")) {
      window.sessionStorage.setItem("woys_user", JSON.stringify(user));
    } else if (!session && storageAvailable("localStorage")) {
      window.localStorage.setItem("woys_user", JSON.stringify(user));
    }
  } catch {
    // Keep in-memory fallback.
  }
}

/**
 * MOCK ONLY — simulates login by writing user object to localStorage when available.
 * Replace with Clerk <SignIn /> or useSignIn() hook.
 */
export function mockLogin(email: string, password: string, role: "business" | "admin"): boolean {
  if (role === "admin" && email === "admin@woys.ca" && password === "admin123") {
    saveUser({ role: "admin", name: "Woys Admin", email });
    return true;
  }
  if (role === "business" && email === "arash@billiardbar.ca" && password === "demo123") {
    saveUser({ role: "owner", name: "Arash Karimi", email, org: "Billiard Bar & Club" });
    return true;
  }
  return false;
}

/**
 * DEMO — creates a tab-scoped session (sessionStorage) for beta showcase.
 * Session is destroyed when the browser tab is closed.
 * No password needed — just a name and business name.
 */
export function mockDemoLogin(name: string, businessName: string, email: string): void {
  saveUser({ role: "owner", name: name.trim(), email: email.trim(), org: businessName.trim() }, true);
}

/**
 * MOCK ONLY — clears localStorage session.
 * Replace with Clerk's useClerk().signOut().
 */
export function mockLogout() {
  memoryUser = null;
  if (typeof window === "undefined") return;
  try {
    if (storageAvailable("localStorage")) window.localStorage.removeItem("woys_user");
    if (storageAvailable("sessionStorage")) window.sessionStorage.removeItem("woys_user");
  } catch {
    // No-op.
  }
}

/**
 * MOCK ONLY — reads user from localStorage.
 * Replace with Clerk's useUser() hook in client components,
 * or currentUser() in server components / route handlers.
 *
 * Returns null on server (typeof window === "undefined" guard).
 */
export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    // sessionStorage takes priority (demo/tab-scoped users)
    if (storageAvailable("sessionStorage")) {
      const session = window.sessionStorage.getItem("woys_user");
      if (session) return JSON.parse(session) as MockUser;
    }
    if (storageAvailable("localStorage")) {
      const local = window.localStorage.getItem("woys_user");
      if (local) return JSON.parse(local) as MockUser;
    }
  } catch {
    // fall through
  }
  return memoryUser;
}

/** True when current session was created via mockDemoLogin (sessionStorage only). */
export function isDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return storageAvailable("sessionStorage") && !!window.sessionStorage.getItem("woys_user");
  } catch {
    return false;
  }
}
