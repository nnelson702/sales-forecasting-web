"use client";

import RequireAuth from "@/components/RequireAuth";

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
