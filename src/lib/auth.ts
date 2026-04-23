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

/**
 * MOCK ONLY — simulates login by writing user object to localStorage.
 * Replace with Clerk <SignIn /> or useSignIn() hook.
 */
export function mockLogin(email: string, password: string, role: "business" | "admin"): boolean {
  if (role === "admin" && email === "admin@woys.ca" && password === "admin123") {
    localStorage.setItem("woys_user", JSON.stringify({ role: "admin", name: "Woys Admin", email }));
    return true;
  }
  if (role === "business" && email === "arash@billiardbar.ca" && password === "demo123") {
    localStorage.setItem("woys_user", JSON.stringify({ role: "owner", name: "Arash Karimi", email, org: "Billiard Bar & Club" }));
    return true;
  }
  return false;
}

/**
 * MOCK ONLY — clears localStorage session.
 * Replace with Clerk's useClerk().signOut().
 */
export function mockLogout() {
  localStorage.removeItem("woys_user");
}

/**
 * MOCK ONLY — reads user from localStorage.
 * Replace with Clerk's useUser() hook in client components,
 * or currentUser() in server components / route handlers.
 *
 * Returns null on server (typeof window === "undefined" guard).
 */
export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("woys_user");
  return raw ? JSON.parse(raw) : null;
}
