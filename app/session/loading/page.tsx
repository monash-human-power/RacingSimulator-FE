"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

const checks = ["Power Meter", "Smart Trainer", "Heart Rate Monitor", "Rig Calibration"];

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const didNavigateRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return prev;
        return Math.min(100, prev + 3);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100 || didNavigateRef.current) return;
    didNavigateRef.current = true;
    const timeout = setTimeout(() => router.replace("/session/live"), 600);
    return () => clearTimeout(timeout);
  }, [progress, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/35 p-7 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Session Preparation</p>
        <h1 className="mt-2 text-3xl font-semibold">Connecting Your Training Rig</h1>
        <p className="mt-2 text-slate-400">Verifying all mocked devices before race launch.</p>

        <div className="mt-6 space-y-3">
          {checks.map((check, idx) => {
            const completeThreshold = ((idx + 1) / checks.length) * 100;
            const ready = progress >= completeThreshold;
            return (
              <div key={check} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span>{check}</span>
                <span className={`text-sm ${ready ? "text-emerald-300" : "text-slate-400"}`}>
                  {ready ? "Connected" : "Waiting"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-full bg-slate-800 p-1">
          <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">{progress}% complete</span>
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="animate-spin" size={15} />
            Initializing scene
          </span>
        </div>
      </div>
    </div>
  );
}
