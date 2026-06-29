import { formatDuration } from "@/lib/session-utils";
import { KickrLiveMetrics } from "@/lib/device-live";
import { LiveSessionState, SetupConfig } from "@/lib/types";

export function LiveOverlays({
  live,
  setup,
  courseName,
  kickrMetrics,
}: {
  live: LiveSessionState;
  setup: SetupConfig;
  courseName: string;
  kickrMetrics?: KickrLiveMetrics | null;
}) {
  const distanceCompletedKm = kickrMetrics?.distanceCompletedKm ?? live.distanceCompletedKm;
  const remaining = Math.max(0, live.totalDistanceKm - distanceCompletedKm);
  const progress =
    kickrMetrics?.progressPct ??
    Math.min(100, (live.distanceCompletedKm / live.totalDistanceKm) * 100);
  const speed = kickrMetrics?.speed ?? live.speed;
  const power = kickrMetrics?.power ?? live.power;
  const cadence = kickrMetrics?.cadence ?? live.cadence;
  const heartRate = kickrMetrics?.heartRateBpm ?? live.heartRate;
  const currentLap = kickrMetrics?.currentLap ?? live.currentLap;
  const projectedFinish = kickrMetrics?.projectedFinish ?? live.projectedFinish;
  const sectionLabel = kickrMetrics?.sectionLabel ?? live.sectionLabel;
  const effortZone = kickrMetrics?.effortZone ?? live.effortZone;
  const targetDelta = power - live.targetPower;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Overlay label="Speed" value={`${speed.toFixed(1)} km/h`} />
      <Overlay
        label="Power"
        value={`${power} W`}
        detail={targetDelta >= 0 ? `+${targetDelta} vs target` : `${targetDelta} vs target`}
      />
      <Overlay label="Cadence" value={`${cadence} rpm`} />
      <Overlay
        label="Heart Rate"
        value={kickrMetrics && kickrMetrics.heartRateBpm == null ? "—" : `${heartRate} bpm`}
      />
      <Overlay label="Distance Left" value={`${remaining.toFixed(1)} km`} />
      <Overlay label="Elapsed" value={formatDuration(live.elapsedSec)} />
      <Overlay label="Lap" value={`${currentLap} / ${setup.laps}`} />
      <Overlay label="Projected Finish" value={projectedFinish} />
      <Overlay label="Mode" value={setup.raceMode} />
      <Overlay label="Course" value={sectionLabel} detail={courseName} />
      <Overlay label="Effort Zone" value={effortZone} />
      <Overlay label="Lap Progress" value={`${progress.toFixed(0)}%`} />
    </div>
  );
}

function Overlay({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/78 p-3 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-600">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {detail ? <p className="text-xs text-slate-600">{detail}</p> : null}
    </div>
  );
}
