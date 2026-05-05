"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/lib/app-context";
import { BikeMode, RaceMode } from "@/lib/types";

const bikeModes: BikeMode[] = ["Road Bike", "TT Bike", "Triathlon Rig"];
const raceModes: RaceMode[] = ["Endurance", "Time Trial", "Sprint Intervals"];

export default function SetupPage() {
  const { riders, courses, setupConfig, setSetupConfig } = useAppContext();
  const [step, setStep] = useState(1);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === setupConfig.courseId) ?? courses[0],
    [courses, setupConfig.courseId],
  );

  const canProceed = riders.length > 0 && Boolean(setupConfig.riderId) && Boolean(setupConfig.courseId);

  return (
    <AppShell title="Ride Setup" subtitle="Configure rider, mode, course, and simulation conditions.">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm">Setup Progress</p>
          <p className="text-xs text-slate-400">Step {step} / 5</p>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {step === 1 ? (
            <>
              <p className="text-sm font-semibold">1. Select Rider</p>
              <div className="mt-3 space-y-2">
                {riders.map((rider) => (
                  <button
                    key={rider.id}
                    onClick={() => setSetupConfig((prev) => ({ ...prev, riderId: rider.id }))}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      setupConfig.riderId === rider.id
                        ? "border-cyan-300/80 bg-cyan-400/20"
                        : "border-white/10 bg-slate-900/60 hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold">{`${rider.firstName} ${rider.lastName}`}</p>
                    <p className="text-sm text-slate-400">{rider.experience}</p>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-sm font-semibold">2. Bike + Race Mode</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Bike / Rig</p>
                  <div className="space-y-2">
                    {bikeModes.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSetupConfig((prev) => ({ ...prev, bikeMode: mode }))}
                        className={`w-full rounded-xl border p-3 text-left ${
                          setupConfig.bikeMode === mode ? "border-cyan-300 bg-cyan-400/20" : "border-white/10"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Race Mode</p>
                  <div className="space-y-2">
                    {raceModes.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSetupConfig((prev) => ({ ...prev, raceMode: mode }))}
                        className={`w-full rounded-xl border p-3 text-left ${
                          setupConfig.raceMode === mode ? "border-indigo-300 bg-indigo-400/20" : "border-white/10"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="text-sm font-semibold">3. Course + Laps</p>
              <div className="mt-3 grid gap-3">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() =>
                      setSetupConfig((prev) => ({
                        ...prev,
                        courseId: course.id,
                        distanceKm: Number((course.lengthKm * prev.laps).toFixed(1)),
                      }))
                    }
                    className={`rounded-xl border p-3 text-left ${
                      setupConfig.courseId === course.id
                        ? "border-cyan-300 bg-cyan-400/20"
                        : "border-white/10 bg-slate-900/60"
                    }`}
                  >
                    <p className="font-semibold">{course.name}</p>
                    <p className="text-sm text-slate-400">
                      {course.lengthKm} km • {course.terrain} • {course.difficulty}
                    </p>
                  </button>
                ))}
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm">
                    Lap Count
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={setupConfig.laps}
                      onChange={(e) =>
                        setSetupConfig((prev) => {
                          const laps = Number(e.target.value);
                          return {
                            ...prev,
                            laps,
                            distanceKm: Number((selectedCourse.lengthKm * laps).toFixed(1)),
                          };
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
                    />
                  </label>
                  <label className="text-sm">
                    Total Distance (km)
                    <input
                      value={setupConfig.distanceKm}
                      onChange={(e) =>
                        setSetupConfig((prev) => ({ ...prev, distanceKm: Number(e.target.value) || prev.distanceKm }))
                      }
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
                    />
                  </label>
                </div>
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <p className="text-sm font-semibold">4. Climate Profile</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="text-sm">
                  Temperature (C)
                  <input
                    type="number"
                    value={setupConfig.climate.temperatureC}
                    onChange={(e) =>
                      setSetupConfig((prev) => ({
                        ...prev,
                        climate: { ...prev.climate, temperatureC: Number(e.target.value) },
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
                  />
                </label>
                <label className="text-sm">
                  Humidity (%)
                  <input
                    type="number"
                    value={setupConfig.climate.humidity}
                    onChange={(e) =>
                      setSetupConfig((prev) => ({
                        ...prev,
                        climate: { ...prev.climate, humidity: Number(e.target.value) },
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
                  />
                </label>
                <label className="text-sm">
                  Wind (km/h)
                  <input
                    type="number"
                    value={setupConfig.climate.windKmh}
                    onChange={(e) =>
                      setSetupConfig((prev) => ({
                        ...prev,
                        climate: { ...prev.climate, windKmh: Number(e.target.value) },
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
                  />
                </label>
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="text-sm font-semibold">5. Device Checks</p>
              <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <label className="flex items-center justify-between">
                  <span>Skip device checks (mock only)</span>
                  <input
                    type="checkbox"
                    checked={setupConfig.skipDeviceChecks}
                    onChange={(e) =>
                      setSetupConfig((prev) => ({ ...prev, skipDeviceChecks: e.target.checked }))
                    }
                  />
                </label>
                <p className="mt-3 text-sm text-slate-400">
                  If checks are enabled, a loading sequence will simulate trainer, power meter, and heart-rate monitor
                  connections before race view starts.
                </p>
              </div>
              <Link
                href={setupConfig.skipDeviceChecks ? "/session/live" : "/session/loading"}
                className="mt-5 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
              >
                Start Session
              </Link>
            </>
          ) : null}

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Back
            </button>
            <button
              onClick={() => setStep((prev) => Math.min(5, prev + 1))}
              disabled={!canProceed}
              className="rounded-xl bg-indigo-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Configuration Summary</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>Rider ID: {setupConfig.riderId || "Not selected"}</p>
            <p>Bike: {setupConfig.bikeMode}</p>
            <p>Course: {selectedCourse.name}</p>
            <p>Laps: {setupConfig.laps}</p>
            <p>Distance: {setupConfig.distanceKm.toFixed(1)} km</p>
            <p>Mode: {setupConfig.raceMode}</p>
            <p>
              Climate: {setupConfig.climate.temperatureC}C / {setupConfig.climate.humidity}% /{" "}
              {setupConfig.climate.windKmh} km/h
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
