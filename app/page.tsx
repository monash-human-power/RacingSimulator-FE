"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.2),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(129,140,248,0.18),transparent_35%)]"
        animate={{ opacity: [0.7, 1, 0.75] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <main className="relative grid w-full max-w-6xl gap-8 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl lg:grid-cols-[1.3fr_1fr] lg:p-12">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Race Simulation Platform</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Train Like Race Day Is Tonight.
          </h1>
          <p className="mt-5 max-w-xl text-slate-300">
            Immersive rider workflows from setup to post-ride analytics with backend persistence powered by
            Supabase + PostgreSQL APIs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Sign In to Continue
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
            >
              Explore Landing
              <PlayCircle size={16} />
            </Link>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-300">Sign-in Mockup</p>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm" defaultValue="coach@racesim.io" />
            <input className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm" type="password" defaultValue="password123" />
            <button className="w-full rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-indigo-300">
              Sign In
            </button>
          </div>
          <div className="mt-6 rounded-xl bg-slate-900/70 p-4 text-xs text-slate-400">
            Ride simulation and device checks remain mocked, while riders, setups, sessions, leaderboard,
            and preferences are now API-backed.
          </div>
        </section>
      </main>
    </div>
  );
}
