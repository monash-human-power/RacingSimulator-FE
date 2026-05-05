"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/app-context";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, authLoading, user } = useAppContext();
  const [mode, setMode] = useState<Mode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const heading = useMemo(() => (mode === "signin" ? "Sign In" : "Create Account"), [mode]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ error: null, success: null });

    if (mode === "signin") {
      const result = await signIn(email, password);
      if (result.error) {
        setStatus({ error: result.error, success: null });
      } else {
        router.push("/dashboard");
      }
    } else {
      const result = await signUp(email, password, displayName.trim() || "Rider");
      if (result.error) {
        setStatus({ error: result.error, success: null });
      } else {
        setStatus({
          error: null,
          success: "Account created. Sign in to continue.",
        });
        setMode("signin");
      }
    }

    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-6">
      <main className="w-full max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Race Simulation Platform</p>
        <h1 className="mt-2 text-2xl font-semibold">{heading}</h1>
        <p className="mt-1 text-sm text-slate-400">Secure account login with persisted riders, sessions, and settings.</p>

        <div className="mt-5 grid grid-cols-2 rounded-xl border border-white/10 bg-slate-900/70 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg px-3 py-2 text-sm ${mode === "signin" ? "bg-cyan-400 text-slate-950" : "text-slate-300"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg px-3 py-2 text-sm ${mode === "signup" ? "bg-cyan-400 text-slate-950" : "text-slate-300"}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === "signup" ? (
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
          />
          {status.error ? <p className="text-sm text-rose-300">{status.error}</p> : null}
          {status.success ? <p className="text-sm text-emerald-300">{status.success}</p> : null}
          <button
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-indigo-300 disabled:opacity-60"
          >
            {submitting ? "Please wait..." : heading}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <Link href="/auth/reset" className="hover:text-slate-200">
            Forgot password?
          </Link>
          <Link href="/" className="hover:text-slate-200">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
