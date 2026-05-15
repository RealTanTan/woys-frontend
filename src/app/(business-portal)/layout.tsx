import { Sidebar } from "@/components/layout/Sidebar";
import { TicketButton } from "@/components/features/TicketButton";
import { DemoStoreWrapper } from "./DemoStoreWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStoreWrapper>
      <div className="flex h-screen bg-transparent overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
        <TicketButton />
      </div>
    </DemoStoreWrapper>
  );
}
