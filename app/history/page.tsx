"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useAppContext } from "@/lib/app-context";

export default function HistoryPage() {
  const { sessionHistory } = useAppContext();

  return (
    <AppShell title="Session History" subtitle="Review previously completed training sessions.">
      {sessionHistory.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          description="Once rides are completed, session history will appear here with quick actions."
          ctaHref="/setup"
          ctaLabel="Start first ride"
        />
      ) : (
        <div className="grid gap-3">
          {sessionHistory.map((session) => (
            <div key={session.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{`${session.riderName} • ${session.courseName}`}</p>
                  <p className="text-sm text-slate-400">
                    {session.mode} • {session.createdAt}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <p>Time: {session.finalTime}</p>
                  <p>Power: {session.avgPower}W</p>
                  <p>Speed: {session.avgSpeed}km/h</p>
                  <p>HR: {session.avgHeartRate}bpm</p>
                  <Link href="/session/review" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                    Open Analysis
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
