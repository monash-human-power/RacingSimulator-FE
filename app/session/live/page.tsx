"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Pause, Play, Square } from "lucide-react";
import { LiveOverlays } from "@/components/live-overlays";
import { RaceScene } from "@/components/race-scene";
import { useAppContext } from "@/lib/app-context";
import { buildSessionSummary, generateInitialLiveState, tickLiveState } from "@/lib/session-utils";

export default function LiveSessionPage() {
  const { riders, courses, setupConfig, liveSession, setLiveSession, setSessionHistory, setLastSummary } =
    useAppContext();

  const rider = riders.find((r) => r.id === setupConfig.riderId) ?? riders[0];
  const course = courses.find((c) => c.id === setupConfig.courseId) ?? courses[0];

  useEffect(() => {
    if (!liveSession) {
      setLiveSession(generateInitialLiveState(setupConfig));
    }
  }, [liveSession, setLiveSession, setupConfig]);

  useEffect(() => {
    if (!liveSession) return;
    const interval = setInterval(() => {
      setLiveSession((prev) => (prev ? tickLiveState(prev, setupConfig.laps) : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [liveSession, setLiveSession, setupConfig.laps]);

  useEffect(() => {
    if (!liveSession) return;
    if (liveSession.distanceCompletedKm >= liveSession.totalDistanceKm) {
      handleFinish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSession?.distanceCompletedKm]);

  function handleFinish() {
    if (!liveSession) return;
    const summary = buildSessionSummary(
      `${rider.firstName} ${rider.lastName}`,
      course.name,
      setupConfig.raceMode,
      liveSession,
      setupConfig.laps,
    );
    setLastSummary(summary);
    setSessionHistory((prev) => [summary, ...prev]);
    setLiveSession(null);
    window.location.href = "/session/review";
  }

  if (!liveSession) {
    return <div className="min-h-screen bg-[#070b14]" />;
  }

  const progress = Math.min(100, (liveSession.distanceCompletedKm / liveSession.totalDistanceKm) * 100);

  return (
    <div className="min-h-screen bg-[#050912] p-4 text-slate-100 md:p-6">
      <div className="mx-auto w-full max-w-[1450px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live Session</p>
            <p className="text-xl font-semibold">
              {course.name} • {setupConfig.raceMode}
            </p>
            <p className="text-sm text-slate-400">{`${rider.firstName} ${rider.lastName}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setLiveSession((prev) => (prev ? { ...prev, isPaused: !prev.isPaused } : prev))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              {liveSession.isPaused ? <Play size={15} /> : <Pause size={15} />}
              {liveSession.isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-300"
            >
              <Square size={14} />
              Finish Session
            </button>
            <Link href="/setup" className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
              Exit
            </Link>
          </div>
        </div>

        <RaceScene progress={progress} />

        <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Course Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <LiveOverlays live={liveSession} setup={setupConfig} />
      </div>
    </div>
  );
}
