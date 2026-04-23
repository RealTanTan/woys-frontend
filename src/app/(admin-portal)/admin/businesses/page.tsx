"use client";
/*
 * PAGE: Admin — All Businesses
 * Table of every registered organization with plan badge, SMS usage bar, status, and join date.
 *
 * DATA (currently mock — swap when backend is ready):
 *   organizations → GET /api/admin/organizations  (adminGetOrganizations in api.ts)
 *
 * HOW TO CONNECT:
 *   import { adminGetOrganizations } from "@/lib/api";
 *   const [orgs, setOrgs] = useState([]);
 *   useEffect(() => { adminGetOrganizations().then(setOrgs); }, []);
 */
import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminOrganizations } from "@/lib/mock-data"; // ← REMOVE when backend ready
import { formatDate, planLabel } from "@/lib/utils";
import Link from "next/link";

const planColors: Record<string, "gray" | "blue" | "green" | "purple" | "orange"> = {
  trial: "gray", starter: "blue", growth: "green", pro: "purple", enterprise: "orange",
};

export default function AdminBusinessesPage() {
  const [search, setSearch] = useState("");

  const filtered = adminOrganizations.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Businesses" subtitle={`${adminOrganizations.length} registered organizations`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["Business", "Plan", "SMS Usage", "Contacts", "Status", "Joined", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map((org) => {
                  const pct = Math.round((org.messages_used / org.messages_limit) * 100);
                  return (
                    <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{org.name}</p>
                            <p className="text-xs text-slate-400">{org.sms_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge color={planColors[org.plan]}>{planLabel(org.plan)}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-28">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>{org.messages_used.toLocaleString()}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{org.contacts_count}</td>
                      <td className="px-4 py-4">
                        <Badge color={org.status === "active" ? "green" : org.status === "trial" ? "yellow" : "red"}>
                          {org.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{formatDate(org.created_at)}</td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/businesses/${org.id}`}>
                          <Button variant="ghost" size="sm">View →</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
