"use client";
import { useState } from "react";
import { Check, Zap, Star, Building2, ChevronDown } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDemoStore } from "@/lib/demo-store";
import { useToast } from "@/components/ui/Toast";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: <Zap className="w-5 h-5" />,
    monthlyPrice: 29,
    yearlyPrice: 23,
    sms: "1,000",
    contacts: "500",
    color: "blue",
    features: ["1,000 SMS/month", "500 contacts", "Basic campaigns", "Email support", "CASL compliance tools"],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    icon: <Star className="w-5 h-5" />,
    monthlyPrice: 79,
    yearlyPrice: 63,
    sms: "5,000",
    contacts: "2,000",
    color: "brand",
    features: ["5,000 SMS/month", "2,000 contacts", "Advanced campaigns", "Automation flows", "Priority support", "Analytics dashboard", "CSV import"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    icon: <Star className="w-5 h-5" />,
    monthlyPrice: 199,
    yearlyPrice: 159,
    sms: "15,000",
    contacts: "10,000",
    color: "purple",
    features: ["15,000 SMS/month", "10,000 contacts", "MMS support", "AI campaign suggestions", "Dedicated number", "API access", "White-label option", "Phone support"],
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: <Building2 className="w-5 h-5" />,
    monthlyPrice: 0,
    yearlyPrice: 0,
    sms: "Unlimited",
    contacts: "Unlimited",
    color: "slate",
    features: ["Unlimited SMS", "Unlimited contacts", "Custom integrations", "Dedicated account manager", "SLA guarantee", "Custom onboarding", "SSO/SAML", "Multi-location"],
    popular: false,
  },
];

const FAQS = [
  { q: "Can I change plans anytime?", a: "Yes. Upgrades take effect immediately. Downgrades apply at the end of your billing period." },
  { q: "What happens when I hit my SMS limit?", a: "We notify you at 80% usage. You can upgrade instantly or purchase top-up credits. We never cut off mid-campaign." },
  { q: "Is there a free trial?", a: "Yes — all new accounts get a 14-day free trial on the Growth plan. No credit card required." },
  { q: "Do unused SMS roll over?", a: "SMS credits reset monthly. They do not roll over, but you can purchase additional credits at any time." },
  { q: "What is CASL compliance?", a: "CASL (Canadian Anti-Spam Legislation) requires express consent before sending marketing SMS. WOYS tracks consent status for every contact automatically." },
];

const colorMap: Record<string, { border: string; bg: string; badge: string; btn: string }> = {
  blue:   { border: "border-blue-200 dark:border-blue-800",     bg: "bg-blue-50 dark:bg-blue-950/30",     badge: "bg-blue-600",   btn: "bg-blue-600 hover:bg-blue-700 text-white" },
  brand:  { border: "border-brand-400 dark:border-brand-600",   bg: "bg-brand-50 dark:bg-brand-950/30",   badge: "bg-brand-600",  btn: "bg-brand-600 hover:bg-brand-700 text-white" },
  purple: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-950/30", badge: "bg-violet-600", btn: "bg-violet-600 hover:bg-violet-700 text-white" },
  slate:  { border: "border-slate-200 dark:border-slate-700",   bg: "bg-slate-50 dark:bg-slate-900",      badge: "bg-slate-600",  btn: "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white" },
};

export default function SubscriptionPage() {
  const [showToast, toastNode] = useToast();
  const { currentPlan, setCurrentPlan, setMessagesLimit } = useDemoStore();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const PLAN_LIMITS: Record<string, number> = { starter: 1000, growth: 5000, pro: 15000, enterprise: 100000 };

  const handleSelect = async (planId: string) => {
    if (planId === currentPlan) return;
    setLoading(planId);
    await new Promise(r => setTimeout(r, 900));
    setCurrentPlan(planId);
    setMessagesLimit(PLAN_LIMITS[planId] ?? 5000);
    setLoading(null);
    const plan = PLANS.find(p => p.id === planId);
    showToast(`Switched to ${plan?.name} plan.`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toastNode}
      <Topbar title="Subscription" subtitle="Manage your plan and usage" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">

        {/* Toggle */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Simple, transparent pricing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Switch plans anytime. Cancel anytime.</p>
          <div className="flex items-center gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!yearly ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500"}`}
            >Monthly</button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${yearly ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500"}`}
            >
              Yearly
              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map(plan => {
            const colors = colorMap[plan.color];
            const isCurrent = plan.id === currentPlan;
            const price = plan.monthlyPrice === 0 ? null : yearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all ${colors.border} ${colors.bg} ${isCurrent ? "ring-2 ring-offset-2 ring-brand-400 dark:ring-offset-slate-950" : ""}`}
              >
                {plan.popular && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white ${colors.badge}`}>
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold text-white bg-emerald-500">
                    Current Plan
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl text-white ${colors.badge}`}>{plan.icon}</div>
                  <p className="font-bold text-slate-900 dark:text-white">{plan.name}</p>
                </div>
                <div>
                  {price !== null ? (
                    <>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">${price}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                      {yearly && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Billed ${price * 12}/year</p>}
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">Custom</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.sms} SMS · {plan.contacts} contacts</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => plan.monthlyPrice === 0 ? showToast("Enterprise: contact sales@woys.ca") : handleSelect(plan.id)}
                  disabled={isCurrent || loading === plan.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${colors.btn} ${isCurrent ? "opacity-50 cursor-default" : "hover:scale-[1.02] active:scale-[0.98]"}`}
                >
                  {loading === plan.id ? "Switching…" : isCurrent ? "Current Plan" : plan.monthlyPrice === 0 ? "Contact Sales" : "Switch Plan"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ROI Calculator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-brand-950/50 to-slate-900 p-6">
          <h3 className="text-lg font-bold text-white mb-1">ROI Calculator</h3>
          <p className="text-sm text-slate-400 mb-5">See your estimated monthly revenue from SMS campaigns.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Average order value", value: "$85", sub: "per customer" },
              { label: "SMS open rate", value: "98%", sub: "vs 20% email" },
              { label: "Estimated monthly ROI", value: "12.4×", sub: "return on plan cost" },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-brand-400">{item.value}</p>
                <p className="text-xs text-white font-medium mt-1">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Frequently asked questions</h3>
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
              >
                {faq.q}
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="rounded-2xl bg-slate-950 dark:bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-lg">Need an Enterprise plan?</p>
            <p className="text-sm text-slate-400 mt-0.5">Custom volumes, SLAs, dedicated support, and white-labeling available.</p>
          </div>
          <button
            onClick={() => showToast("Enterprise inquiry sent. We'll be in touch within 1 business day.")}
            className="shrink-0 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
          >
            Contact Sales →
          </button>
        </div>

      </main>
    </div>
  );
}
