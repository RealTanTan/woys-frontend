import { Sidebar } from "@/components/layout/Sidebar";
import { TicketButton } from "@/components/features/TicketButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
      <TicketButton />
    </div>
  );
}
