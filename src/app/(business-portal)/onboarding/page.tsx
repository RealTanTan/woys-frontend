"use client";
/*
 * PAGE: Onboarding Wizard (UC-05, OB-01 to OB-07)
 * Self-serve onboarding — ≤5 questions, completable in <2 minutes.
 * Collects: business name, industry, timezone, country.
 * AI Brain uses industry to generate relevant suggestions.
 *
 * DATA (currently mock — swap when backend is ready):
 *   submit → POST /api/onboarding  (completeOnboarding in api.ts)
 *
 * HOW TO CONNECT:
 *   import { completeOnboarding } from "@/lib/api";
 *   On finish: completeOnboarding({ business_name, industry, timezone, country })
 *     .then(() => router.push("/dashboard"))
 *
 * TRIGGER: Show this page to users where org.onboarding_complete === false.
 *   After completion, set onboarding_complete = true on the org record.
 */
import { useState } from "react";
import { Zap, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

const industries = [
  "Restaurant / Bar", "Retail", "Fitness / Gym", "Beauty / Salon",
  "Entertainment", "Professional Services", "Healthcare", "Other",
];

const timezones = [
  "America/Toronto (ET)", "America/Winnipeg (CT)", "America/Edmonton (MT)",
  "America/Vancouver (PT)", "America/New_York (ET)", "America/Chicago (CT)",
  "America/Denver (MT)", "America/Los_Angeles (PT)",
];

const steps = ["Business", "Industry", "Location", "Review"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [country, setCountry] = useState("Canada");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    // TODO: await completeOnboarding({ business_name: businessName, industry, timezone, country });
    await new Promise(r => setTimeout(r, 800));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">WOYS</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-brand-600 text-white" : i === step ? "bg-white dark:bg-slate-800 border-2 border-brand-600 text-brand-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to WOYS 👋</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Let's set up your account. It takes under 2 minutes.</p>
              </div>
              <Input
                label="Business Name"
                placeholder="e.g. Billiard Bar & Club"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
              <Button className="w-full" disabled={!businessName.trim()} onClick={() => setStep(1)}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What's your industry?</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Helps our AI suggest relevant campaigns for you.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {industries.map(ind => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${industry === ind ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700"}`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
                <Button className="flex-1" disabled={!industry} onClick={() => setStep(2)}>Continue <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Where are you located?</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Used for quiet-hours enforcement (9PM–8AM local time).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Canada", "United States"].map(c => (
                    <button
                      key={c}
                      onClick={() => setCountry(c)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${country === c ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700"}`}
                    >
                      {c === "Canada" ? "🇨🇦 Canada" : "🇺🇸 United States"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select timezone...</option>
                  {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button className="flex-1" disabled={!timezone} onClick={() => setStep(3)}>Continue <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">You're all set! 🎉</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what we've got. Confirm and launch your account.</p>
              </div>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                {[
                  { label: "Business Name", value: businessName },
                  { label: "Industry", value: industry },
                  { label: "Country", value: country },
                  { label: "Timezone", value: timezone },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 rounded-xl text-xs text-brand-700 dark:text-brand-400">
                ✓ Your AI assistant will start suggesting campaigns based on your industry and upcoming dates.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button className="flex-1" loading={loading} onClick={handleFinish}>
                  Launch My Account 🚀
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">By continuing you agree to WOYS Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}
