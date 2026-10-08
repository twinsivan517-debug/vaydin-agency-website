"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/actions";

const START: ContactState = { ok: false, message: "" };
const FIELD =
  "w-full rounded-lg border border-foreground/40 bg-transparent px-4 py-3 text-base outline-offset-2";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, START);
  if (state.ok) return <p role="status">{state.message}</p>;
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>Name</span>
        <input name="name" required autoComplete="name" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1">
        <span>Message</span>
        <textarea name="message" required minLength={10} rows={5} className={FIELD} />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button
        disabled={pending}
        className="rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background disabled:opacity-60"
      >
        {pending ? "Sending" : "Send"}
      </button>
      <p aria-live="polite" className="min-h-6">{state.message}</p>
    </form>
  );
}
