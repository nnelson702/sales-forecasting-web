"use client";

import { useEffect, useState } from "react";
import { getAuthStatus } from "@/shared/auth/getAdminStatus";

/**
 * RequireAdmin
 *
 * App-level guard for admin-only routes. Checks authentication and admin
 * status via the `profiles` table before rendering children.
 *
 * - Unauthenticated users are redirected to /auth/login.
 * - Authenticated non-admin users see an access-denied message.
 * - Admin users see the page normally.
 *
 * NOTE: This is an app-level guardrail only. Supabase RLS policies must be
 * implemented in a follow-up PR to enforce access at the database level.
 */
export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<
    "checking" | "ok" | "no-auth" | "no-admin"
  >("checking");

  useEffect(() => {
    getAuthStatus().then(({ user, isAdmin }) => {
      if (!user) {
        setStatus("no-auth");
        window.location.replace("/auth/login");
        return;
      }
      if (!isAdmin) {
        setStatus("no-admin");
        return;
      }
      setStatus("ok");
    });
  }, []);

  if (status === "checking") {
    return <div style={{ padding: 24 }}>Checking access…</div>;
  }

  if (status === "no-auth") {
    return <div style={{ padding: 24 }}>Redirecting to login…</div>;
  }

  if (status === "no-admin") {
    return (
      <div style={{ padding: 24, maxWidth: 480 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Access denied</h2>
        <p style={{ marginTop: 10, opacity: 0.85 }}>
          You do not have admin access to this page.
        </p>
        <a href="/home" style={{ fontWeight: 700 }}>
          Return to Home
        </a>
        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
          If you believe this is an error, contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
