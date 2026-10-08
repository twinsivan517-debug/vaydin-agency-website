"use server";

export type ContactState = { ok: boolean; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const name = String(form.get("name") ?? "").trim().slice(0, 200);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const message = String(form.get("message") ?? "").trim().slice(0, 5000);
  if (String(form.get("company") ?? "") !== "") return { ok: true, message: "Thank you." };
  if (!name || !EMAIL.test(email) || message.length < 10) {
    return { ok: false, message: "Please give your name, a real email and a few words." };
  }
  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) {
    return { ok: false, message: "This form is not connected yet. Please email us instead." };
  }
  const sent = await fetch(hook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email, message }),
  }).catch(() => null);
  if (!sent?.ok) return { ok: false, message: "That did not send. Please email us instead." };
  return { ok: true, message: "Thank you. We will reply soon." };
}
