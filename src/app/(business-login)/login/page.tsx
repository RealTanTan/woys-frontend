"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockLogin, mockDemoLogin } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // --- existing login ---
  const [email, setEmail] = useState("arash@billiardbar.ca");
  const [password, setPassword] = useState("demo123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- demo login ---
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [demoBiz, setDemoBiz] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = mockLogin(email, password, "business");
    if (ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleDemoStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoError("");
    if (!demoName.trim() || !demoBiz.trim() || !demoEmail.trim()) {
      setDemoError("All fields are required.");
      return;
    }
    if (!demoEmail.includes("@")) {
      setDemoError("Enter a valid email address.");
      return;
    }
    setDemoLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    mockDemoLogin(demoName, demoBiz, demoEmail);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200 dark:shadow-brand-950 mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">WOYS</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">SMS Platform for Canadian Businesses</p>
        </div>

        {!demoOpen ? (
          <>
            {/* Sign-in card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Sign in to your account</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.ca"
                  required
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
                <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                  Sign in
                </Button>
              </form>

              {/* Demo hint */}
              <div className="mt-6 p-3 bg-brand-50 dark:bg-brand-950/30 rounded-xl border border-brand-100 dark:border-brand-900/50">
                <p className="text-xs text-brand-700 dark:text-brand-400 font-medium mb-1">Demo credentials</p>
                <p className="text-xs text-brand-600 dark:text-brand-500">arash@billiardbar.ca / demo123</p>
              </div>
            </div>

            {/* Try Demo CTA */}
            <div className="mt-4 bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-5 text-white shadow-lg shadow-brand-200 dark:shadow-brand-950">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <p className="font-semibold text-sm">Want to explore first?</p>
              </div>
              <p className="text-xs text-brand-100 mb-3">
                Start an instant demo with your own business name — no password needed. Session ends when you close the tab.
              </p>
              <button
                onClick={() => setDemoOpen(true)}
                className="w-full bg-white text-brand-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-brand-50 transition-colors"
              >
                Try the Demo →
              </button>
            </div>
          </>
        ) : (
          /* Demo sign-up card */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-brand-100 dark:bg-brand-950/50 rounded-lg">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Start your demo</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              No password, no credit card. Full platform access for this browser session.
            </p>
            <form onSubmit={handleDemoStart} className="space-y-4">
              <Input
                label="Your Name"
                placeholder="Jane Doe"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                required
              />
              <Input
                label="Business Name"
                placeholder="e.g. Maple Coffee Co."
                value={demoBiz}
                onChange={(e) => setDemoBiz(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@mybusiness.ca"
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                required
              />
              {demoError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{demoError}</p>}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Demo data is session-only — it disappears when you close this tab. Nothing is sent, stored, or billed.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setDemoOpen(false)} type="button">
                  Back
                </Button>
                <Button type="submit" className="flex-1" loading={demoLoading}>
                  Launch Demo
                </Button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Woys admin?{" "}
          <Link href="/admin/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
            Admin portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
