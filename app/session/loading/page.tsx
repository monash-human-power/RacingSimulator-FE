"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { deviceApi } from "@/lib/api/devices";
import { useAppContext } from "@/lib/app-context";
import { writeUseDeviceDataFlag } from "@/lib/device-live";

const checks = [
  { key: "engine", label: "BLE Engine Service" },
  { key: "trainer", label: "Smart Trainer (FTMS)" },
  { key: "stream", label: "Telemetry Stream" },
  { key: "rig", label: "Rig Calibration" },
] as const;

export default function LoadingPage() {
  const router = useRouter();
  const { setupConfig, deviceTelemetry, deviceConnected } = useAppContext();
  const [progress, setProgress] = useState(0);
  const [statusByKey, setStatusByKey] = useState<Record<string, "waiting" | "ok" | "error">>({
    engine: "waiting",
    trainer: "waiting",
    stream: "waiting",
    rig: "waiting",
  });
  const [message, setMessage] = useState("Starting device checks…");
  const didNavigateRef = useRef(false);

  useEffect(() => {
    if (setupConfig.skipDeviceChecks) {
      setMessage("Device checks skipped — using simulator.");
      setStatusByKey({ engine: "ok", trainer: "ok", stream: "ok", rig: "ok" });
      setProgress(100);
      writeUseDeviceDataFlag(false);
      return;
    }

    let cancelled = false;

    async function runChecks() {
      setMessage("Connecting to BLE engine…");
      setProgress(15);

      try {
        await deviceApi.health();
        if (cancelled) return;
        setStatusByKey((prev) => ({ ...prev, engine: "ok" }));
        setProgress(35);

        setMessage("Searching for KICKR / Wahoo trainer…");
        try {
          await deviceApi.connect();
          writeUseDeviceDataFlag(true);
          if (cancelled) return;
          setStatusByKey((prev) => ({ ...prev, trainer: "ok" }));
          setProgress(70);
        } catch {
          setStatusByKey((prev) => ({ ...prev, trainer: "error" }));
          setMessage("Trainer not found — you can connect from Devices or continue with simulator.");
          writeUseDeviceDataFlag(false);
          setProgress(70);
        }

        setMessage("Waiting for live telemetry…");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (cancelled) return;

        const streamOk = deviceConnected || Boolean(deviceTelemetry);
        setStatusByKey((prev) => ({
          ...prev,
          stream: streamOk ? "ok" : "error",
          rig: "ok",
        }));
        setProgress(100);
        setMessage(streamOk ? "Trainer ready." : "No telemetry yet — simulator will be used.");
      } catch {
        if (cancelled) return;
        setStatusByKey({ engine: "error", trainer: "error", stream: "error", rig: "error" });
        setMessage("Engine offline. Start the Python service, or open Devices to retry.");
        writeUseDeviceDataFlag(false);
        setProgress(100);
      }
    }

    void runChecks();
    return () => {
      cancelled = true;
    };
  }, [setupConfig.skipDeviceChecks, deviceConnected, deviceTelemetry]);

  useEffect(() => {
    if (progress < 100 || didNavigateRef.current) return;
    didNavigateRef.current = true;
    const timeout = setTimeout(() => router.replace("/session/live"), 800);
    return () => clearTimeout(timeout);
  }, [progress, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/35 p-7 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Session Preparation</p>
        <h1 className="mt-2 text-3xl font-semibold">Connecting Your Training Rig</h1>
        <p className="mt-2 text-slate-400">{message}</p>

        <div className="mt-6 space-y-3">
          {checks.map((check) => {
            const status = statusByKey[check.key];
            return (
              <div
                key={check.key}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <span>{check.label}</span>
                <span
                  className={`text-sm ${
                    status === "ok"
                      ? "text-emerald-300"
                      : status === "error"
                        ? "text-amber-300"
                        : "text-slate-400"
                  }`}
                >
                  {status === "ok" ? "Connected" : status === "error" ? "Unavailable" : "Waiting"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-full bg-slate-800 p-1">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">{progress}% complete</span>
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="animate-spin" size={15} />
            {progress >= 100 ? "Launching session" : "Checking devices"}
          </span>
        </div>

        <Link href="/devices" className="mt-4 inline-block text-sm text-cyan-300 hover:text-cyan-200">
          Open Device Lab for manual testing
        </Link>
      </div>
    </div>
  );
}
