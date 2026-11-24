"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      const reason = error.code ?? `status ${error.status ?? "unknown"}`;
      setMessage(
        error.status === 429
          ? `Too many tries. Please wait a few minutes and try again. (Reason: ${reason})`
          : `We could not send the code. Check the email address and try again. (Reason: ${reason})`
      );
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) {
      setMessage("That code did not work. Check it, or go back and ask for a new one.");
      return;
    }
    router.replace("/app");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="text-3xl font-semibold">Clinic Copilot</h1>
      <p className="mt-2 text-base text-gray-600">Staff sign in</p>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-8 flex flex-col gap-4">
          <label htmlFor="email" className="text-base font-medium">Your email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-lg border border-gray-400 px-4 text-base"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-12 rounded-lg bg-black px-4 text-base font-medium text-white disabled:opacity-50"
          >
            {busy ? "Sending..." : "Send me a code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-8 flex flex-col gap-4">
          <p className="text-base">We sent a code to {email}. Enter it below.</p>
          <label htmlFor="code" className="text-base font-medium">Code</label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={10}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-12 rounded-lg border border-gray-400 px-4 text-xl tracking-widest"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-12 rounded-lg bg-black px-4 text-base font-medium text-white disabled:opacity-50"
          >
            {busy ? "Checking..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("email"); setCode(""); setMessage(null); }}
            className="h-12 rounded-lg border border-gray-400 px-4 text-base"
          >
            Use a different email
          </button>
        </form>
      )}

      {message && <p role="alert" className="mt-4 text-base text-red-700">{message}</p>}
    </main>
  );
}
