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
    console.error("[getAuthStatus] profile lookup failed:", error.message);
    return { user: { id: data.user.id, email: data.user.email }, isAdmin: false };
  }

  const isAdmin = Boolean(profile?.is_admin) || profile?.role === "admin";
  return { user: { id: data.user.id, email: data.user.email }, isAdmin };
}
