import { DeviceTelemetry, LiveSessionState } from "@/lib/types";
import { formatDuration } from "@/lib/session-utils";

const sections = ["Launch", "Tempo Climb", "Technical Descent", "Final Push"];
const zones = ["Z2 Base", "Z3 Tempo", "Z4 Threshold", "Z5 Attack"];

export function msToKmh(speedMs: number): number {
  return Number((speedMs * 3.6).toFixed(1));
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
  const distanceFromDevice =
    device.totalDistanceM != null ? device.totalDistanceM / 1000 : null;
  const distanceCompletedKm = Math.min(
    prev.totalDistanceKm,
    distanceFromDevice ?? prev.distanceCompletedKm + speed / 3600,
  );

  const progress = Math.min(1, distanceCompletedKm / Math.max(prev.totalDistanceKm, 0.001));
  const lapDistance = prev.totalDistanceKm / Math.max(laps, 1);
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
    speed,
    power,
    cadence,
    heartRate,
    projectedFinish: formatDuration(projectedSec),
    sectionLabel: sections[sectionIndex],
    effortZone,
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
