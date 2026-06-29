"use client";

import { useEffect, useRef, useState } from "react";
import {
  deriveCurrentLap,
  deriveEffortZone,
  deriveProjectedFinish,
  deriveSectionLabel,
  kickrDistanceCompletedKm,
  KickrLiveMetrics,
  msToKmh,
} from "@/lib/device-live";
import { DeviceTelemetry, LiveSessionState } from "@/lib/types";

export {
  hasKickrTelemetry,
  resetKickrCourseProgressTracking,
  shouldUseKickrProgress,
} from "@/lib/device-live";
export type { KickrLiveMetrics } from "@/lib/device-live";

export function useKickrLiveMetrics(
  live: LiveSessionState | null,
  telemetry: DeviceTelemetry | null,
  laps: number,
  useKickr: boolean,
): KickrLiveMetrics | null {
  const integratedKmRef = useRef(0);
  const lastReceivedAtRef = useRef<number | null>(null);
  const [metrics, setMetrics] = useState<KickrLiveMetrics | null>(null);

  useEffect(() => {
    if (!useKickr || !telemetry || !live) {
      integratedKmRef.current = 0;
      lastReceivedAtRef.current = null;
      setMetrics(null);
      return;
    }

    if (telemetry.totalDistanceM == null && lastReceivedAtRef.current != null) {
      const dtSec = (telemetry.receivedAt - lastReceivedAtRef.current) / 1000;
      if (dtSec > 0 && dtSec < 5) {
        integratedKmRef.current += (telemetry.speedMs * dtSec) / 1000;
      }
    }
    lastReceivedAtRef.current = telemetry.receivedAt;

    const distanceCompletedKm = Math.min(
      live.totalDistanceKm,
      kickrDistanceCompletedKm(telemetry, integratedKmRef.current),
    );
    const progress = Math.min(1, distanceCompletedKm / Math.max(live.totalDistanceKm, 0.001));
    const power = Math.round(telemetry.powerW);

    setMetrics({
      progressPct: progress * 100,
      distanceCompletedKm,
      speed: msToKmh(telemetry.speedMs),
      power,
      cadence: Math.round(telemetry.cadenceRpm ?? live.cadence),
      heartRateBpm: telemetry.heartRateBpm,
      currentLap: deriveCurrentLap(distanceCompletedKm, live.totalDistanceKm, laps),
      projectedFinish: deriveProjectedFinish(live.elapsedSec, progress),
      sectionLabel: deriveSectionLabel(progress),
      effortZone: deriveEffortZone(power, live.targetPower),
    });
  }, [telemetry, useKickr, live, laps]);

  return metrics;
}
