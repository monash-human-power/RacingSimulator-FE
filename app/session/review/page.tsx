"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { LineChart } from "@/components/line-chart";
import { StatCard } from "@/components/stat-card";
import { useAppContext } from "@/lib/app-context";

export default function SessionReviewPage() {
  const { lastSummary } = useAppContext();

  if (!lastSummary) {
    return (
      <AppShell title="Post-Session Analysis" subtitle="No completed sessions yet.">
        <EmptyState
          title="No session data yet"
          description="Complete a session to unlock detailed post-ride analytics and timeline insights."
          ctaHref="/setup"
          ctaLabel="Start a ride"
        />
      </AppShell>
    );
  }

  const chartPoints = Array.from({ length: 60 }).map((_, i) => ({
    x: i + 1,
    speed: lastSummary.avgSpeed + Math.sin(i / 6) * 2 + Math.cos(i / 5) * 0.8,
    power: lastSummary.avgPower + Math.sin(i / 4) * 20 + Math.cos(i / 3) * 6,
  }));

  return (
    <AppShell title="Post-Session Analysis" subtitle="Replay key moments and compare actual versus target output.">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Final Time" value={lastSummary.finalTime} />
        <StatCard label="Avg Power" value={`${lastSummary.avgPower} W`} />
        <StatCard label="Avg Speed" value={`${lastSummary.avgSpeed} km/h`} />
        <StatCard label="Avg HR" value={`${lastSummary.avgHeartRate} bpm`} />
        <StatCard label="Efficiency" value={`${lastSummary.efficiency}%`} />
        <StatCard label="Best Lap" value={lastSummary.lapTimes[0]} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChart
          points={chartPoints.map((p) => ({ x: p.x, y: p.speed }))}
          color="#22d3ee"
          label="Speed over time"
        />
        <LineChart
          points={chartPoints.map((p) => ({ x: p.x, y: p.power }))}
          color="#818cf8"
          label="Power over time"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Session Timeline Scrubber (Mock)</p>
          <input type="range" min={0} max={100} defaultValue={73} className="mt-4 w-full accent-cyan-400" />
          <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3">
              <p className="font-semibold text-emerald-200">Peak Output</p>
              <p className="text-slate-300">Lap 3 sprint sustained +42W over target.</p>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3">
              <p className="font-semibold text-amber-200">Drop Zone</p>
              <p className="text-slate-300">Cadence dip in technical descent section.</p>
            </div>
            <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-3">
              <p className="font-semibold text-cyan-200">Key Moment</p>
              <p className="text-slate-300">Recovered pacing within 22 seconds after surge.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Actual vs Target</p>
          <div className="mt-4 space-y-3 text-sm">
            <ProgressRow label="Power Target" actual={lastSummary.avgPower} target={275} unit="W" />
            <ProgressRow label="Speed Target" actual={lastSummary.avgSpeed} target={33} unit="km/h" />
            <ProgressRow label="HR Cap" actual={lastSummary.avgHeartRate} target={165} unit="bpm" />
          </div>
          <div className="mt-5 rounded-xl border border-indigo-300/25 bg-indigo-400/10 p-4">
            <p className="font-semibold text-indigo-100">Performance Insight</p>
            <p className="mt-1 text-sm text-slate-300">
              Strong mid-session consistency with late fatigue trend. Next target: lift cadence in final 20% while
              maintaining heart-rate control.
            </p>
          </div>
          <Link href="/setup" className="mt-4 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900">
            Start New Session
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function ProgressRow({
  label,
  actual,
  target,
  unit,
}: {
  label: string;
  actual: number;
  target: number;
  unit: string;
}) {
  const ratio = Math.min(1, actual / Math.max(target, 1));
  return (
    <div>
      <div className="flex items-center justify-between text-slate-300">
        <span>{label}</span>
        <span>{`${actual} / ${target} ${unit}`}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
