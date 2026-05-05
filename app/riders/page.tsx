"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useAppContext } from "@/lib/app-context";
import { ExperienceLevel, Rider } from "@/lib/types";

const levelOptions: ExperienceLevel[] = ["Beginner", "Intermediate", "Advanced", "Pro"];

const emptyForm: Omit<Rider, "id"> = {
  firstName: "",
  lastName: "",
  weightKg: 68,
  experience: "Intermediate",
  notes: "",
};

export default function RidersPage() {
  const { riders, createRider, updateRider, deleteRider } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Rider, "id">>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const editingRider = useMemo(
    () => riders.find((rider) => rider.id === editingId) ?? null,
    [editingId, riders],
  );

  async function submitForm(e: FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSubmitting(true);
    setStatus(null);

    if (editingRider) {
      const result = await updateRider(editingRider.id, { ...form, weightKg: Number(form.weightKg) });
      if (result.error) {
        setStatus(result.error);
        setSubmitting(false);
        return;
      }
    } else {
      const result = await createRider({ ...form, weightKg: Number(form.weightKg) });
      if (result.error) {
        setStatus(result.error);
        setSubmitting(false);
        return;
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    setSubmitting(false);
    setStatus(editingRider ? "Rider updated." : "Rider created.");
  }

  function startEdit(rider: Rider) {
    setEditingId(rider.id);
    setForm({
      firstName: rider.firstName,
      lastName: rider.lastName,
      weightKg: rider.weightKg,
      experience: rider.experience,
      notes: rider.notes,
    });
  }

  return (
    <AppShell title="Rider Management" subtitle="Create, edit, and organize rider profiles quickly.">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-3">
          {riders.length === 0 ? (
            <EmptyState
              title="No riders yet"
              description="Create your first rider profile to begin configuring training sessions."
              ctaHref="/riders"
              ctaLabel="Create Rider"
            />
          ) : (
            riders.map((rider) => (
              <div
                key={rider.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{`${rider.firstName} ${rider.lastName}`}</p>
                    <p className="text-sm text-slate-400">
                      {rider.weightKg} kg • {rider.experience}
                    </p>
                  </div>
                  <button
                    onClick={() => startEdit(rider)}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-300">{rider.notes}</p>
                <button
                  onClick={() => void deleteRider(rider.id)}
                  className="mt-3 rounded-lg border border-rose-300/40 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/10"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submitForm} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">{editingRider ? "Edit Rider" : "Create Rider"}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
              className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            />
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
              className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            />
            <input
              type="number"
              min={35}
              max={120}
              value={form.weightKg}
              onChange={(e) => setForm((prev) => ({ ...prev, weightKg: Number(e.target.value) }))}
              placeholder="Weight (kg)"
              className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            />
            <select
              value={form.experience}
              onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value as ExperienceLevel }))}
              className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level} className="bg-slate-900">
                  {level}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Training notes"
            className="mt-3 min-h-28 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
          />
          <div className="mt-4 flex gap-2">
            <button
              disabled={submitting}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
            >
              {submitting ? "Saving..." : editingRider ? "Save Changes" : "Create Rider"}
            </button>
            {editingRider ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            ) : null}
          </div>
          {status ? <p className="mt-3 text-sm text-cyan-200">{status}</p> : null}
        </form>
      </section>
    </AppShell>
  );
}
