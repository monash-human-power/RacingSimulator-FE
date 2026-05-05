"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useAppContext } from "@/lib/app-context";

export default function LeaderboardPage() {
  const { sessionHistory } = useAppContext();
  const [filter, setFilter] = useState<"time" | "efficiency" | "lap">("time");

  const rows = useMemo(() => {
    const copied = [...sessionHistory];
    if (filter === "efficiency") {
      copied.sort((a, b) => b.efficiency - a.efficiency);
    } else if (filter === "lap") {
      copied.sort((a, b) => a.lapTimes[0].localeCompare(b.lapTimes[0]));
    } else {
      copied.sort((a, b) => a.finalTime.localeCompare(b.finalTime));
    }
    return copied;
  }, [filter, sessionHistory]);

  return (
    <AppShell title="Leaderboard" subtitle="Rank riders by time, efficiency, or lap performance.">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Global Rankings</p>
          <div className="flex gap-2">
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
          </div>
        </div>

        {rows.length === 0 ? (
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
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="py-3">#{idx + 1}</td>
                    <td>{row.riderName}</td>
                    <td>{row.courseName}</td>
                    <td>{row.finalTime}</td>
                    <td>{row.efficiency}%</td>
                    <td>{row.lapTimes[0]}</td>
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
