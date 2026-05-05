"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/lib/app-context";

export default function SettingsPage() {
  const { preferences, setPreferences, savePreferences } = useAppContext();
  const [status, setStatus] = useState<string | null>(null);

  return (
    <AppShell title="Settings & Preferences" subtitle="Basic rider display preferences and race defaults.">
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Units + Display</p>
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">
              Units
              <select
                value={preferences.units}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, units: e.target.value as "Metric" | "Imperial" }))
                }
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3"
              >
                <option className="bg-slate-900">Metric</option>
                <option className="bg-slate-900">Imperial</option>
              </select>
            </label>
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-3">
              Show map overlay
              <input
                type="checkbox"
                checked={preferences.showMapOverlay}
                onChange={(e) => setPreferences((prev) => ({ ...prev, showMapOverlay: e.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-3">
              Show optimal vs actual delta
              <input
                type="checkbox"
                checked={preferences.showPerformanceDelta}
                onChange={(e) => setPreferences((prev) => ({ ...prev, showPerformanceDelta: e.target.checked }))}
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Race Defaults</p>
          <label className="mt-4 block text-sm">
            Default race mode
            <select
              value={preferences.defaultRaceMode}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  defaultRaceMode: e.target.value as "Endurance" | "Time Trial" | "Sprint Intervals",
                }))
              }
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3"
            >
              <option className="bg-slate-900">Endurance</option>
              <option className="bg-slate-900">Time Trial</option>
              <option className="bg-slate-900">Sprint Intervals</option>
            </select>
          </label>
          <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-sm text-slate-300">
            Preferences are persisted to your account and loaded on app initialization.
          </div>
          <button
            onClick={async () => {
              const result = await savePreferences(preferences);
              setStatus(result.error ?? "Preferences saved.");
            }}
            className="mt-5 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
          >
            Save Preferences
          </button>
          {status ? <p className="mt-3 text-sm text-cyan-200">{status}</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
