"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HistoryList } from "@/features/history/components/history-list";

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="p-6">
        <HistoryList />
      </div>
    </AppShell>
  );
}
