/**
 * getAdminStatus
 *
 * Shared helper that checks authentication and admin status using the
 * `profiles` table (profiles.id = auth.users.id).
 *
 * Admin criteria (short-term): is_admin = true OR role = 'admin'.
 *
 * NOTE: This is an app-level guardrail only. It relies on the Supabase
 * anon client and client-side session state. It is NOT a substitute for
 * database-level Supabase RLS policies.
 *
 * TODO (follow-up PR): Implement RLS policies on monthly_goals, daily_goals,
 * daily_actuals, and historical_daily_sales so the database enforces
 * access control independently of the app layer.
 */

import { supabase } from "@/shared/supabase/client";

export type AuthStatus = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

export async function getAuthStatus(): Promise<AuthStatus> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { user: null, isAdmin: false };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin,role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (error) {
    // If profiles table doesn't exist or query fails, fail closed (not admin).
    console.error("[getAuthStatus] profiles query error:", error.message);
    return { user: data.user, isAdmin: false };
  }

  const isAdmin =
    Boolean(profile?.is_admin) || profile?.role === "admin";

  return { user: { id: data.user.id, email: data.user.email }, isAdmin };
}
