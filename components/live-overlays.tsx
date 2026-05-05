import { formatDuration } from "@/lib/session-utils";
import { LiveSessionState, SetupConfig } from "@/lib/types";

export function LiveOverlays({
  live,
  setup,
}: {
  live: LiveSessionState;
  setup: SetupConfig;
}) {
  const remaining = Math.max(0, live.totalDistanceKm - live.distanceCompletedKm);
  const progress = Math.min(100, (live.distanceCompletedKm / live.totalDistanceKm) * 100);
  const targetDelta = live.power - live.targetPower;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Overlay label="Speed" value={`${live.speed.toFixed(1)} km/h`} />
      <Overlay
        label="Power"
        value={`${live.power} W`}
        detail={targetDelta >= 0 ? `+${targetDelta} vs target` : `${targetDelta} vs target`}
      />
      <Overlay label="Cadence" value={`${live.cadence} rpm`} />
      <Overlay label="Heart Rate" value={`${live.heartRate} bpm`} />
      <Overlay label="Distance Left" value={`${remaining.toFixed(1)} km`} />
      <Overlay label="Elapsed" value={formatDuration(live.elapsedSec)} />
      <Overlay label="Lap" value={`${live.currentLap} / ${setup.laps}`} />
      <Overlay label="Projected Finish" value={live.projectedFinish} />
      <Overlay label="Mode" value={setup.raceMode} />
      <Overlay label="Course" value={live.sectionLabel} detail={setup.courseId} />
      <Overlay label="Effort Zone" value={live.effortZone} />
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
    <div className="rounded-xl border border-white/10 bg-black/45 p-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {detail ? <p className="text-xs text-slate-400">{detail}</p> : null}
    </div>
  );
}
