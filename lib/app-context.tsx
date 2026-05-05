"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { defaultSetupConfig, mockCourses, mockRiders, mockSessionHistory } from "@/lib/mock-data";
import { Course, LiveSessionState, Rider, SessionSummary, SetupConfig } from "@/lib/types";

interface AppContextValue {
  riders: Rider[];
  setRiders: React.Dispatch<React.SetStateAction<Rider[]>>;
  courses: Course[];
  setupConfig: SetupConfig;
  setSetupConfig: React.Dispatch<React.SetStateAction<SetupConfig>>;
  liveSession: LiveSessionState | null;
  setLiveSession: React.Dispatch<React.SetStateAction<LiveSessionState | null>>;
  sessionHistory: SessionSummary[];
  setSessionHistory: React.Dispatch<React.SetStateAction<SessionSummary[]>>;
  lastSummary: SessionSummary | null;
  setLastSummary: React.Dispatch<React.SetStateAction<SessionSummary | null>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [riders, setRiders] = useState<Rider[]>(mockRiders);
  const [setupConfig, setSetupConfig] = useState<SetupConfig>(defaultSetupConfig);
  const [liveSession, setLiveSession] = useState<LiveSessionState | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>(mockSessionHistory);
  const [lastSummary, setLastSummary] = useState<SessionSummary | null>(mockSessionHistory[0]);

  const value = useMemo(
    () => ({
      riders,
      setRiders,
      courses: mockCourses,
      setupConfig,
      setSetupConfig,
      liveSession,
      setLiveSession,
      sessionHistory,
      setSessionHistory,
      lastSummary,
      setLastSummary,
    }),
    [riders, setupConfig, liveSession, sessionHistory, lastSummary],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
