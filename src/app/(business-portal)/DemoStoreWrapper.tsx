"use client";
import { DemoStoreProvider } from "@/lib/demo-store";

export function DemoStoreWrapper({ children }: { children: React.ReactNode }) {
  return <DemoStoreProvider>{children}</DemoStoreProvider>;
}
