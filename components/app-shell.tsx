"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Bluetooth, Flag, Gauge, LogOut, Medal, Settings, UserRound, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppContext } from "@/lib/app-context";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/setup", label: "Start Ride", icon: Flag },
  { href: "/devices", label: "Devices", icon: Bluetooth },
  { href: "/riders", label: "Riders", icon: Users },
  { href: "/history", label: "History", icon: Activity },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/account", label: "Account", icon: UserRound },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authLoading, signOut, profile } = useAppContext();

  if (!authLoading && !user) {
    router.replace("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1380px] gap-5 px-4 py-6 md:px-8">
        <aside className="hidden w-64 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur lg:block">
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 p-4">
            <p className="text-xs text-slate-300">Race Simulation</p>
            <p className="text-lg font-semibold">Training Console</p>
            <p className="mt-1 text-xs text-slate-300">{profile?.displayName ?? user?.email ?? "Rider"}</p>
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    active ? "bg-cyan-400/20 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => void signOut().then(() => router.replace("/auth"))}
            className="mt-6 flex w-full items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </aside>

        <main className="w-full">
          <header className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Rider Training System</p>
            <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
          </header>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
