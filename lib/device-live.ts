import { DeviceTelemetry, LiveSessionState } from "@/lib/types";
import { formatDuration } from "@/lib/session-utils";

const sections = ["Launch", "Tempo Climb", "Technical Descent", "Final Push"];
const zones = ["Z2 Base", "Z3 Tempo", "Z4 Threshold", "Z5 Attack"];

let kickrSessionBaselineM: number | null = null;

export function resetKickrCourseProgressTracking() {
  kickrSessionBaselineM = null;
}

export function hasKickrTelemetry(telemetry: DeviceTelemetry | null): boolean {
  if (!telemetry) return false;
  return (
    telemetry.connected ||
    Boolean(telemetry.deviceName) ||
    telemetry.totalDistanceM != null ||
    telemetry.speedMs > 0 ||
    telemetry.powerW > 0 ||
    (telemetry.cadenceRpm ?? 0) > 0
  );
}

export function shouldUseKickrProgress(
  telemetry: DeviceTelemetry | null,
  useDeviceDataFlag: boolean,
): boolean {
  return Boolean(telemetry) && (useDeviceDataFlag || hasKickrTelemetry(telemetry));
}

export function kickrDistanceCompletedKm(telemetry: DeviceTelemetry, integratedKm: number): number {
  if (telemetry.totalDistanceM != null) {
    if (kickrSessionBaselineM === null) {
      kickrSessionBaselineM = telemetry.totalDistanceM;
    }
    return Math.max(0, (telemetry.totalDistanceM - kickrSessionBaselineM) / 1000);
  }
  return integratedKm;
}

export interface KickrLiveMetrics {
  progressPct: number;
  distanceCompletedKm: number;
  speed: number;
  power: number;
  cadence: number;
  heartRateBpm: number | null;
  currentLap: number;
  projectedFinish: string;
  sectionLabel: string;
  effortZone: string;
}

export function msToKmh(speedMs: number): number {
  return Number((speedMs * 3.6).toFixed(1));
}

export function deriveCurrentLap(distanceCompletedKm: number, totalDistanceKm: number, laps: number): number {
  const lapDistance = totalDistanceKm / Math.max(laps, 1);
  return Math.min(laps, Math.max(1, Math.ceil(distanceCompletedKm / lapDistance)));
}

export function deriveSectionLabel(progress: number): string {
  const sectionIndex = Math.min(sections.length - 1, Math.floor(progress * sections.length));
  return sections[sectionIndex];
}

export function deriveEffortZone(power: number, targetPower: number): string {
  if (power > targetPower + 40) return zones[3];
  if (power > targetPower) return zones[2];
  if (power > targetPower - 35) return zones[1];
  return zones[0];
}

export function deriveProjectedFinish(elapsedSec: number, progress: number): string {
  const projectedSec = elapsedSec > 8 ? Math.round(elapsedSec / Math.max(progress, 0.01)) : 2400;
  return formatDuration(projectedSec);
}

export function applyDeviceTelemetry(
  prev: LiveSessionState,
  device: DeviceTelemetry,
  laps: number,
): LiveSessionState {
  if (!prev.isActive || prev.isPaused) return prev;

  const speed = msToKmh(device.speedMs);
  const power = Math.round(device.powerW);
  const cadence = Math.round(device.cadenceRpm ?? prev.cadence);
  const heartRate = Math.round(device.heartRateBpm ?? prev.heartRate);

  const elapsedSec = prev.elapsedSec + 1;
  const distanceCompletedKm = Math.min(
    prev.totalDistanceKm,
    kickrDistanceCompletedKm(device, prev.distanceCompletedKm + speed / 3600),
  );

  const progress = Math.min(1, distanceCompletedKm / Math.max(prev.totalDistanceKm, 0.001));
  const currentLap = deriveCurrentLap(distanceCompletedKm, prev.totalDistanceKm, laps);

  const metricsTimeline = [
    ...prev.metricsTimeline,
    { t: elapsedSec, speed, power, cadence, heartRate },
  ].slice(-300);

  return {
    ...prev,
    elapsedSec,
    distanceCompletedKm,
    currentLap,
    speed,
    power,
    cadence,
    heartRate,
    projectedFinish: deriveProjectedFinish(elapsedSec, progress),
    sectionLabel: deriveSectionLabel(progress),
    effortZone: deriveEffortZone(power, prev.targetPower),
    metricsTimeline,
  };
}

export const USE_DEVICE_DATA_KEY = "racesim_use_device_data";

export function readUseDeviceDataFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(USE_DEVICE_DATA_KEY) === "true";
}

export function writeUseDeviceDataFlag(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) {
    window.sessionStorage.setItem(USE_DEVICE_DATA_KEY, "true");
  } else {
    window.sessionStorage.removeItem(USE_DEVICE_DATA_KEY);
  }
}
