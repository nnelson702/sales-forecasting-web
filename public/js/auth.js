import { supabase } from "./supabaseClient.js";
import { qs } from "./utils.js";

function getLoginForm() {
  return qs("#authForm") || qs("#login-form");
}

function getEmailInput() {
  return qs("#email") || qs("#login-email");
}

function getPasswordInput() {
  return qs("#password") || qs("#login-password");
}

function setSignedInView(session) {
  const auth = qs("#auth");
  const app = qs("#app");
  const whoami = qs("#whoami");

  if (auth) auth.classList.toggle("hidden", Boolean(session));
  if (app) app.classList.toggle("hidden", !session);
  if (whoami && session?.user?.email) whoami.textContent = session.user.email;
}

export async function bootAuthUI() {
  const existing = await getSession();
  setSignedInView(existing);

  const form = getLoginForm();
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = getEmailInput()?.value?.trim();
    const password = getPasswordInput()?.value;

    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    setSignedInView(data.session);
  });
}

export async function initAuth() {
  return bootAuthUI();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
  setSignedInView(null);
}
