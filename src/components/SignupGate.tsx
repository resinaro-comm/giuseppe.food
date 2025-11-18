"use client";

import { useState } from "react";

export function SignupGate({ open, onClose, onVerified }: { open: boolean; onClose?: () => void; onVerified?: () => void }) {
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  if (!open) return null;

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to start");
      setDevCode(data?.devCode ?? null);
      setStep("code");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to verify");
      onVerified?.();
    } catch (e: any) {
      setError(e?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Keep using the AI</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-sm">Close</button>
        </div>
        {step === "form" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">After 7 replies, sign up to continue. Enter your email to get a 4‑digit code.</p>
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose} className="text-xs text-slate-600 hover:text-slate-900">Cancel</button>
              <button onClick={start} disabled={loading || !email} className="rounded-full bg-slate-900 text-white text-xs px-4 py-2 disabled:bg-slate-400">
                {loading ? "Sending…" : "Send code"}
              </button>
            </div>
            {devCode && (
              <p className="text-[10px] text-slate-500">Dev only: code is <span className="font-mono">{devCode}</span></p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Enter the 4‑digit code we sent you.</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
              placeholder="1234"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest font-mono text-center"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setStep("form")} className="text-xs text-slate-600 hover:text-slate-900">Back</button>
              <button onClick={verify} disabled={loading || code.length !== 4} className="rounded-full bg-slate-900 text-white text-xs px-4 py-2 disabled:bg-slate-400">
                {loading ? "Checking…" : "Verify"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
