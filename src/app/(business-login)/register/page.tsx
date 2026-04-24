"use client";
/*
 * PAGE: Register — Get Started with WOYS (/register)
 * Public-facing signup form for new businesses.
 * Not behind auth — anyone can access this page.
 *
 * STEPS:
 *   1. Choose plan (Starter / Growth / Pro / Enterprise)
 *   2. Business details (name, industry, country, timezone) — OB-04
 *   3. Contact info (first name, last name, email, phone)
 *   4. Thank you — agent will contact within 1 business day
 *
 * DATA (currently mock — swap when backend is ready):
 *   submit → POST /api/leads  (submitLead in api.ts)
 *   Body:  { plan, business_name, industry, country, timezone,
 *             contact_first_name, contact_last_name, email, phone }
 *
 * HOW TO CONNECT:
 *   import { submitLead } from "@/lib/api";
 *   On finish: submitLead(formData).then(() => setStep(4))
 *
 * AFTER SUBMISSION:
 *   - WOYS admin receives notification (email/Slack)
 *   - Admin manually provisions account (white-glove) OR
 *   - System auto-creates account and sends welcome SMS (self-serve)
 *   - Stripe checkout link sent to client email for billing (BL-01)
 */
import { useState } from "react";
import { Zap, Check, ChevronRight, Star, Users, BarChart2, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/mo",
    sms: "1,000 SMS/mo",
    contacts: "500 contacts",
    features: ["Two-way messaging", "Contact management", "Basic analytics", "Email support"],
    color: "blue",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$79",
    period: "/mo",
    sms: "5,000 SMS/mo",
    contacts: "2,000 contacts",
    features: ["Everything in Starter", "AI campaign suggestions", "Automation flows", "CSV import", "Priority support"],
    color: "brand",
    icon: <BarChart2 className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$199",
    period: "/mo",
    sms: "15,000 SMS/mo",
    contacts: "10,000 contacts",
    features: ["Everything in Growth", "MMS (image messages)", "A/B testing", "Advanced analytics", "Dedicated account manager"],
    color: "purple",
    icon: <Star className="w-5 h-5" />,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    sms: "Unlimited SMS",
    contacts: "Unlimited contacts",
    features: ["Everything in Pro", "White-glove onboarding", "Custom integrations", "SLA guarantee", "Direct phone support"],
    color: "orange",
    icon: <Building2 className="w-5 h-5" />,
  },
];

const INDUSTRIES = [
  "Restaurant / Bar", "Retail", "Fitness / Gym", "Beauty / Salon",
  "Entertainment", "Professional Services", "Healthcare", "Real Estate", "Other",
];

const TIMEZONES = [
  "America/Toronto (ET)", "America/Winnipeg (CT)", "America/Edmonton (MT)",
  "America/Vancouver (PT)", "America/New_York (ET)", "America/Chicago (CT)",
  "America/Denver (MT)", "America/Los_Angeles (PT)",
];

const STEPS = ["Choose Plan", "Your Business", "Contact Info", "Done"];

const planBorderColor: Record<string, string> = {
  blue:   "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20",
  brand:  "border-brand-500 dark:border-brand-500 bg-brand-50 dark:bg-brand-950/30",
  purple: "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/20",
  orange: "border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/20",
};

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("Canada");
  const [timezone, setTimezone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const selectedPlan = PLANS.find(p => p.id === plan);

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: await submitLead({ plan, business_name: businessName, industry, country, timezone,
    //   contact_first_name: firstName, contact_last_name: lastName, email, phone });
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg">WOYS</span>
        </div>
        <Link href="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
          Already have an account? Sign in →
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Heading */}
        {step < 3 && (
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Get Started with WOYS</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Premium SMS marketing for Canadian & US businesses. Set up in minutes.</p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {STEPS.slice(0, 3).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 text-sm font-medium transition-all ${i === step ? "text-brand-600 dark:text-brand-400" : i < step ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? "bg-emerald-500 border-emerald-500 text-white" : i === step ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400"}`}>
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="hidden sm:inline">{s}</span>
                  </div>
                  {i < 2 && <div className={`h-px w-10 transition-colors ${i < step ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 0: Choose plan */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${plan === p.id ? planBorderColor[p.color] : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"}`}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-brand-600 text-white px-3 py-0.5 rounded-full whitespace-nowrap">Most Popular</span>
                  )}
                  <div className={`p-2 rounded-xl w-fit mb-3 ${plan === p.id ? "bg-white/70 dark:bg-slate-900/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                    {p.icon}
                  </div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{p.name}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {p.price}<span className="text-sm font-normal text-slate-400">{p.period}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">{p.sms} · {p.contacts}</p>
                  <ul className="space-y-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <div className="text-center">
              <Button disabled={!plan} onClick={() => setStep(1)} size="md">
                Continue with {selectedPlan?.name || "selected plan"} <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-slate-400 mt-3">No credit card required to get started · Cancel anytime</p>
            </div>
          </div>
        )}

        {/* STEP 1: Business details */}
        {step === 1 && (
          <div className="max-w-lg mx-auto space-y-5">
            <div className="p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 rounded-2xl text-sm text-brand-700 dark:text-brand-300 font-medium">
              ✓ {selectedPlan?.name} Plan — {selectedPlan?.price}{selectedPlan?.period}
            </div>

            <Input label="Business Name" placeholder="e.g. Billiard Bar & Club" value={businessName} onChange={e => setBusinessName(e.target.value)} />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry</label>
              <div className="grid grid-cols-3 gap-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setIndustry(ind)}
                    className={`p-2 rounded-xl border-2 text-xs font-medium transition-all text-center ${industry === ind ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"}`}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
              <div className="grid grid-cols-2 gap-3">
                {["Canada", "United States"].map(c => (
                  <button key={c} onClick={() => setCountry(c)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${country === c ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"}`}>
                    {c === "Canada" ? "🇨🇦 Canada" : "🇺🇸 United States"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone <span className="text-slate-400 font-normal text-xs">(used for quiet hours enforcement)</span></label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select timezone...</option>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button className="flex-1" disabled={!businessName.trim() || !industry || !timezone} onClick={() => setStep(2)}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Contact info */}
        {step === 2 && (
          <div className="max-w-lg mx-auto space-y-5">
            <div className="p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 rounded-2xl text-sm text-brand-700 dark:text-brand-300">
              <span className="font-medium">✓ {businessName}</span> · {selectedPlan?.name} Plan · {country}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Last Name" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <Input label="Business Email" type="email" placeholder="jane@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} />
            <div>
              <Input label="Phone Number" type="tel" placeholder="+1 (416) 555-0100" value={phone} onChange={e => setPhone(e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">We'll call or text to confirm your account.</p>
            </div>

            {/* CASL / TCPA compliance notice */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl space-y-2">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Compliance Notice</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                By registering, you confirm that all contacts you import to WOYS have provided valid express consent to receive SMS marketing messages, as required by <strong>CASL</strong> (Canada) and <strong>TCPA</strong> (United States). You are legally responsible for your contact list compliance.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-600" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                I agree to the WOYS <span className="text-brand-600 dark:text-brand-400 underline cursor-pointer">Terms of Service</span> and <span className="text-brand-600 dark:text-brand-400 underline cursor-pointer">Privacy Policy</span>. I understand my obligations under CASL and TCPA.
              </span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button
                className="flex-1"
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !agreed}
                loading={loading}
                onClick={handleSubmit}
              >
                Submit Application 🚀
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Thank you */}
        {step === 3 && (
          <div className="max-w-lg mx-auto text-center space-y-6 py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">You're on the list! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Thanks, <strong>{firstName}</strong>! Your application for <strong>{businessName}</strong> has been received.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left space-y-3 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">What happens next:</p>
              {[
                { step: "1", text: "One of our WOYS agents will contact you at " + email + " within 1 business day." },
                { step: "2", text: "We'll walk you through your account setup and SMS number provisioning." },
                { step: "3", text: "Once confirmed, you'll receive a secure payment link for your " + (selectedPlan?.name || "") + " plan." },
                { step: "4", text: "Your account goes live — you can start importing contacts and sending campaigns immediately." },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 rounded-2xl">
              <p className="text-sm text-brand-700 dark:text-brand-300">
                <strong>Selected Plan:</strong> {selectedPlan?.name} · {selectedPlan?.price}{selectedPlan?.period} · {selectedPlan?.sms}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button variant="outline" className="w-full">Sign in to existing account →</Button>
              </Link>
              <p className="text-xs text-slate-400">Questions? Email us at <span className="text-brand-600 dark:text-brand-400">hello@woys.ca</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
