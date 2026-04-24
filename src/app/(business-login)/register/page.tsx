"use client";
/*
 * PAGE: Register — Get Started with WOYS (/register)
 * Public-facing inquiry form. No auth required.
 *
 * STEPS:
 *   1. Choose tier (Self-Employed / Enterprise)
 *   2. Your info (business name, industry, country, contact details, website, notes)
 *   3. Thank you — agent will contact within 1 business day
 *
 * DATA (currently mock — swap when backend is ready):
 *   submit → POST /api/leads  (submitLead in api.ts)
 *   Body:  { tier, business_name, industry, country,
 *             first_name, last_name, email, phone, website, notes }
 *
 * HOW TO CONNECT:
 *   import { submitLead } from "@/lib/api";
 *   On finish: submitLead(formData).then(() => setStep(2))
 */
import { useState } from "react";
import { Zap, Check, ChevronRight, Users, Building2, ArrowLeft, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Link from "next/link";

const TIERS = [
  {
    id: "self_employed",
    name: "Self-Employed",
    tagline: "Perfect for solo operators & small teams",
    sms: "Up to a few hundred SMS/mo",
    contacts: "Small contact list",
    features: [
      "Two-way messaging",
      "Contact management",
      "Basic broadcasts",
      "Analytics dashboard",
      "Email support",
    ],
    icon: <Users className="w-6 h-6" />,
    color: "blue",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Built for growing businesses & large teams",
    sms: "High-volume SMS sending",
    contacts: "Large contact lists",
    features: [
      "Everything in Self-Employed",
      "AI campaign suggestions",
      "Automation flows",
      "MMS (image messages)",
      "CSV bulk import",
      "Dedicated account manager",
      "White-glove onboarding",
      "Custom integrations",
    ],
    icon: <Building2 className="w-6 h-6" />,
    color: "brand",
    featured: true,
  },
];

const INDUSTRIES = [
  "Restaurant / Bar", "Retail", "Fitness / Gym", "Beauty / Salon",
  "Entertainment", "Professional Services", "Healthcare", "Real Estate",
  "E-commerce", "Education", "Hospitality", "Other",
];

const STEPS = ["Choose Plan", "Your Information", "Done"];

const tierBorder: Record<string, string> = {
  blue:  "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20",
  brand: "border-brand-500 dark:border-brand-500 bg-brand-50 dark:bg-brand-950/30",
};

export default function RegisterPage() {
  const [step, setStep]               = useState(0);
  const [tier, setTier]               = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry]       = useState("");
  const [country, setCountry]         = useState("Canada");
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [website, setWebsite]         = useState("");
  const [notes, setNotes]             = useState("");
  const [agreed, setAgreed]           = useState(false);
  const [loading, setLoading]         = useState(false);

  const selectedTier = TIERS.find(t => t.id === tier);

  const step1Valid =
    businessName.trim() && industry && firstName.trim() &&
    lastName.trim() && email.trim() && phone.trim() && agreed;

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: await submitLead({ tier, business_name: businessName, industry, country,
    //   first_name: firstName, last_name: lastName, email, phone, website, notes });
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
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

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header + step indicator */}
        {step < 2 && (
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Get Started with WOYS</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Tell us about your business — a WOYS agent will reach out within 1 business day.</p>

            <div className="flex items-center justify-center gap-2 mt-6">
              {STEPS.slice(0, 2).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 text-sm font-medium transition-all ${i === step ? "text-brand-600 dark:text-brand-400" : i < step ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? "bg-emerald-500 border-emerald-500 text-white" : i === step ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400"}`}>
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="hidden sm:inline">{s}</span>
                  </div>
                  {i < 1 && <div className={`h-px w-12 transition-colors ${i < step ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 0: Choose tier */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md ${tier === t.id ? tierBorder[t.color] : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"}`}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold bg-brand-600 text-white px-3 py-0.5 rounded-full whitespace-nowrap">Most Popular</span>
                  )}

                  {/* Icon + name */}
                  <div className={`p-2.5 rounded-xl w-fit mb-4 ${tier === t.id ? "bg-white/70 dark:bg-slate-900/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                    {t.icon}
                  </div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xl">{t.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-1">{t.tagline}</p>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-4">{t.sms} · {t.contacts}</p>

                  <ul className="space-y-1.5">
                    {t.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing note */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 italic">Pricing discussed with your WOYS agent — no surprises.</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <Button disabled={!tier} onClick={() => setStep(1)} size="md">
                Continue with {selectedTier?.name ?? "selected plan"} <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-slate-400 mt-3">No credit card required · A WOYS agent will reach out to discuss pricing</p>
            </div>
          </div>
        )}

        {/* STEP 1: Your information */}
        {step === 1 && (
          <div className="max-w-xl mx-auto space-y-5">

            {/* Tier badge */}
            <div className="p-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 rounded-2xl text-sm text-brand-700 dark:text-brand-300 font-medium flex items-center gap-2">
              {selectedTier?.icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{selectedTier.icon}</span>}
              {selectedTier?.name} — {selectedTier?.tagline}
            </div>

            {/* Business info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Business</p>

            <Input
              label="Business Name"
              placeholder="e.g. Billiard Bar & Club"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Industry</label>
              <div className="grid grid-cols-3 gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`p-2 rounded-xl border-2 text-xs font-medium transition-all text-center ${industry === ind ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"}`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
              <div className="grid grid-cols-2 gap-3">
                {["Canada", "United States"].map(c => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${country === c ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"}`}
                  >
                    {c === "Canada" ? "🇨🇦 Canada" : "🇺🇸 United States"}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-2">Your Contact Info</p>

            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Last Name" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>

            <Input
              label="Business Email"
              type="email"
              placeholder="jane@yourbusiness.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (416) 555-0100"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">A WOYS agent will call or text to confirm your account.</p>
            </div>

            {/* Optional extra info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-2">Additional Info <span className="normal-case font-normal">(optional)</span></p>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Website
              </label>
              <Input
                placeholder="https://yourbusiness.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">Helps our team understand your brand before reaching out.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Notes / Additional Information
              </label>
              <Textarea
                rows={4}
                placeholder="Tell us more — e.g. current marketing tools, number of locations, specific features you need, expected contact list size, or anything else you'd like us to know before we call."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                hint="The more context you give, the better prepared your agent will be."
              />
            </div>

            {/* CASL / TCPA compliance */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl space-y-2">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Compliance Notice</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                By registering, you confirm that all contacts you import to WOYS have provided valid express consent to receive SMS marketing messages, as required by <strong>CASL</strong> (Canada) and <strong>TCPA</strong> (United States). You are legally responsible for your contact list compliance.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-600" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                I agree to the WOYS{" "}
                <span className="text-brand-600 dark:text-brand-400 underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-brand-600 dark:text-brand-400 underline cursor-pointer">Privacy Policy</span>.
                I understand my obligations under CASL and TCPA.
              </span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!step1Valid}
                loading={loading}
                onClick={handleSubmit}
              >
                Submit — We'll Be in Touch 🚀
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Thank you */}
        {step === 2 && (
          <div className="max-w-lg mx-auto text-center space-y-6 py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">You're on the list! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Thanks, <strong>{firstName}</strong>! Your inquiry for <strong>{businessName}</strong> has been received.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left space-y-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">What happens next:</p>
              {[
                { n: "1", text: `A WOYS agent will contact you at ${email} within 1 business day.` },
                { n: "2", text: "We'll walk you through pricing, features, and account setup together." },
                { n: "3", text: "Your SMS number gets provisioned and you start sending — usually same day." },
              ].map(item => (
                <div key={item.n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.n}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 rounded-2xl text-sm text-brand-700 dark:text-brand-300">
              <strong>{selectedTier?.name}</strong> tier · {country}
              {website && <span> · <a href={website} target="_blank" rel="noopener noreferrer" className="underline">{website}</a></span>}
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button variant="outline" className="w-full">Sign in to existing account →</Button>
              </Link>
              <p className="text-xs text-slate-400">
                Questions? Email us at{" "}
                <span className="text-brand-600 dark:text-brand-400">hello@woys.ca</span>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
