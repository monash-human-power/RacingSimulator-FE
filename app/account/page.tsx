"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/lib/app-context";

export default function AccountPage() {
  const { user, profile, updateProfile } = useAppContext();
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextName = displayName.trim() || profile?.displayName || "Rider";
    const result = await updateProfile(nextName);
    setStatus(result.error ? result.error : "Account profile updated.");
    if (!result.error) setDisplayName(nextName);
  }

  return (
    <AppShell title="Account" subtitle="Manage your identity and account profile details.">
      <section className="grid gap-4 xl:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Profile</p>
          <label className="mt-4 block text-sm">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={profile?.displayName ?? "Display name"}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3"
            />
          </label>
          <button className="mt-4 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300">
            Save profile
          </button>
          {status ? <p className="mt-3 text-sm text-cyan-200">{status}</p> : null}
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold">Account Details</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>Email: {user?.email ?? "Not available"}</p>
            <p>User ID: {user?.id ?? "-"}</p>
            <p>Created: {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "-"}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
