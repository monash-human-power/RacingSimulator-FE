"use client";

import Link from "next/link";
import { Suspense } from "react";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/lib/app-context";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { resetPassword, updatePassword } = useAppContext();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const isUpdateMode = useMemo(
    () => searchParams.get("type") === "recovery" || searchParams.has("access_token"),
    [searchParams],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ error: null, success: null });

    const result = isUpdateMode ? await updatePassword(newPassword) : await resetPassword(email);
    if (result.error) {
      setStatus({ error: result.error, success: null });
    } else {
      setStatus({
        error: null,
        success: isUpdateMode ? "Password updated. You can sign in now." : "Password reset email sent.",
      });
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-6">
      <main className="w-full max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">{isUpdateMode ? "Set New Password" : "Reset Password"}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isUpdateMode
            ? "Choose a new secure password for your account."
            : "Enter your email and we will send a reset link."}
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {isUpdateMode ? (
            <input
              type="password"
              minLength={8}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            />
          ) : (
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            />
          )}
          {status.error ? <p className="text-sm text-rose-300">{status.error}</p> : null}
          {status.success ? <p className="text-sm text-emerald-300">{status.success}</p> : null}
          <button
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
          >
            {submitting ? "Please wait..." : isUpdateMode ? "Update password" : "Send reset email"}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-400">
          <Link href="/auth" className="hover:text-slate-200">
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
