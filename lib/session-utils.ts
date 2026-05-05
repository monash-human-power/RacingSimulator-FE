import { LiveSessionState, SessionSummary, SetupConfig } from "@/lib/types";

const sections = ["Launch", "Tempo Climb", "Technical Descent", "Final Push"];
const zones = ["Z2 Base", "Z3 Tempo", "Z4 Threshold", "Z5 Attack"];

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function generateInitialLiveState(config: SetupConfig): LiveSessionState {
  return {
    isActive: true,
    isPaused: false,
    elapsedSec: 0,
    totalDistanceKm: Number(config.distanceKm.toFixed(1)),
    distanceCompletedKm: 0,
    currentLap: 1,
    speed: 28,
    power: 240,
    cadence: 84,
    heartRate: 132,
    projectedFinish: "00:39:00",
    sectionLabel: sections[0],
    effortZone: zones[0],
    targetPower: 265,
    metricsTimeline: [],
  };
}

export function tickLiveState(prev: LiveSessionState, laps: number): LiveSessionState {
  if (!prev.isActive || prev.isPaused) return prev;

  const elapsedSec = prev.elapsedSec + 1;
  const progress = Math.min(1, prev.distanceCompletedKm / prev.totalDistanceKm);
  const wave = Math.sin(elapsedSec / 8);
  const speed = clamp(27 + wave * 4 + Math.random() * 2.2, 20, 46);
  const power = clamp(255 + Math.sin(elapsedSec / 5) * 40 + Math.random() * 12, 170, 450);
  const cadence = clamp(86 + Math.sin(elapsedSec / 7) * 8 + Math.random() * 3, 65, 118);
  const heartRate = clamp(
    138 + Math.sin(elapsedSec / 15) * 11 + progress * 24 + Math.random() * 2,
    120,
    191,
  );

  const distanceCompletedKm = Math.min(
    prev.totalDistanceKm,
    prev.distanceCompletedKm + speed / 3600,
  );
  const lapDistance = prev.totalDistanceKm / laps;
  const currentLap = Math.min(laps, Math.max(1, Math.ceil(distanceCompletedKm / lapDistance)));
  const sectionIndex = Math.min(sections.length - 1, Math.floor(progress * sections.length));
  const projectedSec = elapsedSec > 8 ? Math.round(elapsedSec / Math.max(progress, 0.01)) : 2400;
  const effortZone =
    power > prev.targetPower + 40
      ? zones[3]
      : power > prev.targetPower
        ? zones[2]
        : power > prev.targetPower - 35
          ? zones[1]
          : zones[0];

  const metricsTimeline = [
    ...prev.metricsTimeline,
    { t: elapsedSec, speed, power, cadence, heartRate },
  ].slice(-300);

  return {
    ...prev,
    elapsedSec,
    distanceCompletedKm,
    currentLap,
    speed: Number(speed.toFixed(1)),
    power: Math.round(power),
    cadence: Math.round(cadence),
    heartRate: Math.round(heartRate),
    projectedFinish: formatDuration(projectedSec),
    sectionLabel: sections[sectionIndex],
    effortZone,
    metricsTimeline,
  };
}

export function buildSessionSummary(
  riderName: string,
  courseName: string,
  mode: SetupConfig["raceMode"],
  liveState: LiveSessionState,
  laps: number,
): SessionSummary {
  const timeline = liveState.metricsTimeline;
  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  const avgPower = avg(timeline.map((m) => m.power));
  const avgSpeed = Number(
    (
      (timeline.reduce((acc, m) => acc + m.speed, 0) || liveState.speed) /
      Math.max(timeline.length, 1)
    ).toFixed(1),
  );
  const avgHeartRate = avg(timeline.map((m) => m.heartRate));
  const efficiency = Math.max(74, Math.min(99, 85 + Math.round((avgPower - 220) / 10)));

  const totalSec = Math.max(1, liveState.elapsedSec);
  const lapSec = Math.round(totalSec / Math.max(laps, 1));
  const lapTimes = Array.from({ length: laps }).map((_, index) =>
    formatDuration(lapSec + Math.round(Math.sin(index) * 9)).slice(3),
  );

  return {
    id: `s-${Date.now()}`,
    riderId: "mock-current",
    riderName,
    courseName,
    mode,
    finalTime: formatDuration(totalSec),
    avgPower,
    avgSpeed,
    avgHeartRate,
    efficiency,
    lapTimes,
    createdAt: "Just now",
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
