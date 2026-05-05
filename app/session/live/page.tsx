"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Pause, Play, Square } from "lucide-react";
import { LiveOverlays } from "@/components/live-overlays";
import { RaceScene } from "@/components/race-scene";
import { useAppContext } from "@/lib/app-context";
import { buildSessionSummary, generateInitialLiveState, tickLiveState } from "@/lib/session-utils";
import { api } from "@/lib/api";

export default function LiveSessionPage() {
  const {
    riders,
    courses,
    setupConfig,
    saveSetupConfig,
    liveSession,
    setLiveSession,
    activeSessionId,
    setActiveSessionId,
    setSessionHistory,
    setLastSummary,
  } = useAppContext();

  const rider = riders.find((r) => r.id === setupConfig.riderId) ?? riders[0];
  const course = courses.find((c) => c.id === setupConfig.courseId) ?? courses[0];

  useEffect(() => {
    if (!liveSession) {
      setLiveSession(generateInitialLiveState(setupConfig));
    }
  }, [liveSession, setLiveSession, setupConfig]);

  useEffect(() => {
    if (activeSessionId || !setupConfig.riderId || !setupConfig.courseId) return;
    async function start() {
      await saveSetupConfig(setupConfig, "active");
      const created = await api.startSession(setupConfig);
      setActiveSessionId(created.id);
    }
    void start();
  }, [activeSessionId, saveSetupConfig, setActiveSessionId, setupConfig]);

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
    if (!liveSession || !activeSessionId || !rider || !course) return;
    const summary = buildSessionSummary(
      rider.id,
      `${rider.firstName} ${rider.lastName}`,
      course.name,
      setupConfig.raceMode,
      liveSession,
      setupConfig.laps,
    );
    void (async () => {
      await api.completeSession(activeSessionId, {
        finalTimeSec: summary.finalTimeSec,
        avgPower: summary.avgPower,
        avgSpeed: summary.avgSpeed,
        avgHeartRate: summary.avgHeartRate,
        efficiency: summary.efficiency,
        lapTimesSec: summary.lapTimesSec ?? [],
        metricsTimeline: liveSession.metricsTimeline,
        analysisSummary: {
          peakOutputNote: "Lap 3 sprint sustained +42W over target.",
          dropZoneNote: "Cadence dip in technical descent section.",
          keyMomentNote: "Recovered pacing within 22 seconds after surge.",
          insight:
            "Strong mid-session consistency with late fatigue trend. Next target: lift cadence in final 20% while maintaining heart-rate control.",
          actualVsTarget: { powerTarget: 275, speedTarget: 33, hrCap: 165 },
        },
      });
      await saveSetupConfig(setupConfig, "completed");
      setLastSummary(summary);
      setSessionHistory((prev) => [summary, ...prev]);
      setLiveSession(null);
      setActiveSessionId(null);
      window.location.href = "/session/review";
    })();
  }

  if (!liveSession) {
    return <div className="min-h-screen bg-[#070b14]" />;
  }
  if (!rider || !course) {
    return <div className="min-h-screen bg-[#070b14]" />;
  }

  const progress = Math.min(100, (liveSession.distanceCompletedKm / liveSession.totalDistanceKm) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-slate-100 to-slate-200 p-4 text-slate-900 md:p-6">
      <div className="mx-auto w-full max-w-[1450px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300/90 bg-white/80 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.14)] backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Live Session</p>
            <p className="text-xl font-semibold">
              {course.name} • {setupConfig.raceMode}
            </p>
            <p className="text-sm text-slate-600">{`${rider.firstName} ${rider.lastName}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setLiveSession((prev) => (prev ? { ...prev, isPaused: !prev.isPaused } : prev))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
            >
              {liveSession.isPaused ? <Play size={15} /> : <Pause size={15} />}
              {liveSession.isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
            >
              <Square size={14} />
              Finish Session
            </button>
            <Link href="/setup" className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">
              Exit
            </Link>
          </div>
        </div>

        <RaceScene progress={progress} speed={liveSession.speed} paused={liveSession.isPaused} />

        <div className="rounded-2xl border border-slate-300/90 bg-white/80 p-3 shadow-[0_8px_26px_rgba(15,23,42,0.12)]">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>Course Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <LiveOverlays live={liveSession} setup={setupConfig} />
      </div>
    </div>
  );
}
