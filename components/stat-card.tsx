import { ArrowDown, ArrowUp } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        {typeof delta === "number" ? (
          <p className={`flex items-center gap-1 text-xs ${delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {delta >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            {Math.abs(delta)}%
          </p>
        ) : null}
      </div>
    </div>
  );
}
