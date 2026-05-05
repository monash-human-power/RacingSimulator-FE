"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useAppContext } from "@/lib/app-context";

export default function LeaderboardPage() {
  const { leaderboard, loadLeaderboard, courses } = useAppContext();
  const [filter, setFilter] = useState<"time" | "efficiency" | "lap">("time");
  const [courseId, setCourseId] = useState<string>("");
  const [mode, setMode] = useState<string>("");

  useEffect(() => {
    void loadLeaderboard({
      sort: filter,
      mapId: courseId || undefined,
      raceMode: mode || undefined,
    });
  }, [courseId, filter, loadLeaderboard, mode]);

  return (
    <AppShell title="Leaderboard" subtitle="Rank riders by time, efficiency, or lap performance.">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Global Rankings</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "time", label: "By Time" },
              { id: "efficiency", label: "By Efficiency" },
              { id: "lap", label: "By Best Lap" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as "time" | "efficiency" | "lap")}
                className={`rounded-lg px-3 py-1.5 text-xs ${
                  filter === item.id ? "bg-cyan-400 text-slate-900" : "border border-white/20"
                }`}
              >
                {item.label}
              </button>
            ))}
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="rounded-lg border border-white/20 bg-transparent px-2 py-1 text-xs"
            >
              <option value="" className="bg-slate-900">
                All Courses
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-slate-900">
                  {course.name}
                </option>
              ))}
            </select>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className="rounded-lg border border-white/20 bg-transparent px-2 py-1 text-xs"
            >
              <option value="" className="bg-slate-900">
                All Modes
              </option>
              <option value="Endurance" className="bg-slate-900">
                Endurance
              </option>
              <option value="Time Trial" className="bg-slate-900">
                Time Trial
              </option>
              <option value="Sprint Intervals" className="bg-slate-900">
                Sprint Intervals
              </option>
            </select>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <EmptyState
            title="No leaderboard entries"
            description="Finish at least one session to generate ranking data."
            ctaHref="/setup"
            ctaLabel="Run a session"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Rider</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Efficiency</th>
                  <th className="pb-3">Best Lap</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, idx) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="py-3">#{idx + 1}</td>
                    <td>{row.riderName}</td>
                    <td>{row.courseName}</td>
                    <td>{row.finalTime}</td>
                    <td>{row.efficiency}%</td>
                    <td>{row.bestLap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
