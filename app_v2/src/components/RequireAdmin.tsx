"use client";

import { useEffect, useState } from "react";
import { getAuthStatus } from "@/shared/auth/getAuthStatus";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "signed-out" | "denied">("checking");

  useEffect(() => {
    getAuthStatus().then(({ user, isAdmin }) => {
      if (!user) {
        setStatus("signed-out");
        window.location.replace("/auth/login");
        return;
      }
      if (!isAdmin) {
        setStatus("denied");
        return;
      }
      setStatus("ok");
    });
  }, []);

  if (status === "checking") return <div style={{ padding: 24 }}>Checking access...</div>;
  if (status === "signed-out") return <div style={{ padding: 24 }}>Redirecting to login...</div>;
  if (status === "denied") {
    return (
      <div style={{ padding: 24, maxWidth: 520 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Access denied</h2>
        <p style={{ marginTop: 10 }}>You do not have admin access to this page.</p>
        <a href="/home" style={{ fontWeight: 700 }}>Return to Home</a>
      </div>
    );
  }

  return <>{children}</>;
}
