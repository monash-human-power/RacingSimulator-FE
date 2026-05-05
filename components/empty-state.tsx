import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-10 text-center">
      <p className="text-xl font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-slate-400">{description}</p>
      <Link
        href={ctaHref}
        className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
      >
        <PlusCircle size={16} />
        {ctaLabel}
      </Link>
    </div>
  );
}
