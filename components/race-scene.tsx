"use client";

import { motion } from "framer-motion";

export function RaceScene({ progress }: { progress: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950">
      <div className="absolute inset-0 opacity-60">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.35),transparent_30%)]"
          animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-[38%] w-[300%] bg-[linear-gradient(90deg,transparent_0,rgba(148,163,184,0.06)_20%,rgba(148,163,184,0.2)_22%,rgba(148,163,184,0.08)_24%,transparent_40%)]"
        animate={{ x: ["-40%", "0%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />

      <svg viewBox="0 0 1200 420" className="h-[420px] w-full">
        <defs>
          <linearGradient id="track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <path
          d="M40,310 C180,120 360,120 520,260 C640,360 860,330 1160,150"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="26"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40,310 C180,120 360,120 520,260 C640,360 860,330 1160,150"
          stroke="url(#track)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="10 12"
        />
        <circle
          cx={40 + (1120 * progress) / 100}
          cy={310 - (165 * progress) / 100}
          r="14"
          fill="#22d3ee"
          stroke="#fff"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
