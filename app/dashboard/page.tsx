"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { useAppContext } from "@/lib/app-context";

export default function DashboardPage() {
  const { riders, sessionHistory, setupConfig, courses } = useAppContext();
  const rider = riders.find((r) => r.id === setupConfig.riderId) ?? riders[0];
  const course = courses.find((c) => c.id === setupConfig.courseId) ?? courses[0];

  return (
    <AppShell
      title="Performance Dashboard"
      subtitle="Recent sessions, rider overview, and quick launch actions."
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Riders" value={String(riders.length)} />
        <StatCard label="Sessions This Week" value="12" delta={7} />
        <StatCard label="Average Efficiency" value="90%" delta={3} />
        <StatCard label="Best Lap" value="07:54" delta={2} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Primary Actions</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              { href: "/setup", label: "Start Ride", description: "Launch setup wizard" },
              { href: "/riders", label: "Create Rider", description: "Add or update rider profile" },
              { href: "/history", label: "View History", description: "Inspect past training sessions" },
              { href: "/leaderboard", label: "Leaderboard", description: "Compare riders by performance" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-cyan-300/40 hover:bg-slate-900"
              >
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Active Rider</p>
          <p className="mt-3 text-2xl font-semibold">{`${rider.firstName} ${rider.lastName}`}</p>
          <p className="text-sm text-slate-400">{rider.experience} level</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>Weight: {rider.weightKg} kg</p>
            <p>Next Course: {course.name}</p>
            <p>Mode: {setupConfig.raceMode}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold">Recent Sessions</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3">Rider</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Mode</th>
                <th className="pb-3">Final Time</th>
                <th className="pb-3">Avg Power</th>
                <th className="pb-3">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((session) => (
                <tr key={session.id} className="border-t border-white/10">
                  <td className="py-3">{session.riderName}</td>
                  <td>{session.courseName}</td>
                  <td>{session.mode}</td>
                  <td>{session.finalTime}</td>
                  <td>{session.avgPower} W</td>
                  <td>{session.efficiency}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
