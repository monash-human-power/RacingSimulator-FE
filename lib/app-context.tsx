"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDuration, secondsToLapLabel } from "@/lib/session-utils";
import { deviceApi } from "@/lib/api/devices";
import { useEngineWebSocket } from "@/lib/hooks/use-engine-websocket";
import {
  Course,
  DeviceState,
  DeviceTelemetry,
  LeaderboardEntry,
  LiveSessionState,
  Preferences,
  Rider,
  SessionSummary,
  SetupConfig,
  UserIdentity,
  UserProfile,
} from "@/lib/types";

const defaultSetupConfig: SetupConfig = {
  riderId: "",
  bikeMode: "Road Bike",
  courseId: "",
  raceMode: "Endurance",
  laps: 4,
  distanceKm: 10,
  climate: { temperatureC: 23, humidity: 52, windKmh: 16 },
  skipDeviceChecks: false,
};

const defaultPreferences: Preferences = {
  units: "Metric",
  showMapOverlay: true,
  showPerformanceDelta: true,
  defaultRaceMode: "Endurance",
};

interface AppContextValue {
  user: UserIdentity | null;
  profile: UserProfile | null;
  authLoading: boolean;
  isBootstrapping: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (displayName: string) => Promise<{ error: string | null }>;
  refreshAllData: () => Promise<void>;
  riders: Rider[];
  createRider: (rider: Omit<Rider, "id">) => Promise<{ error: string | null }>;
  updateRider: (id: string, rider: Omit<Rider, "id">) => Promise<{ error: string | null }>;
  deleteRider: (id: string) => Promise<{ error: string | null }>;
  courses: Course[];
  setupConfig: SetupConfig;
  setSetupConfig: React.Dispatch<React.SetStateAction<SetupConfig>>;
  saveSetupConfig: (nextConfig?: SetupConfig, status?: "draft" | "active" | "completed") => Promise<void>;
  liveSession: LiveSessionState | null;
  setLiveSession: React.Dispatch<React.SetStateAction<LiveSessionState | null>>;
  activeSessionId: string | null;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  sessionHistory: SessionSummary[];
  setSessionHistory: React.Dispatch<React.SetStateAction<SessionSummary[]>>;
  lastSummary: SessionSummary | null;
  setLastSummary: React.Dispatch<React.SetStateAction<SessionSummary | null>>;
  leaderboard: LeaderboardEntry[];
  loadLeaderboard: (params?: { mapId?: string; raceMode?: string; sort?: "time" | "efficiency" | "lap" }) => Promise<void>;
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  savePreferences: (next: Preferences) => Promise<{ error: string | null }>;
  sessionDetailById: Record<string, Awaited<ReturnType<typeof api.getSessionDetail>>>;
  loadSessionDetail: (sessionId: string) => Promise<void>;
  deviceTelemetry: DeviceTelemetry | null;
  deviceWsStatus: string;
  deviceConnected: boolean;
  refreshDeviceState: () => Promise<DeviceState | null>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [setupConfig, setSetupConfig] = useState<SetupConfig>(defaultSetupConfig);
  const [liveSession, setLiveSession] = useState<LiveSessionState | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([]);
  const [lastSummary, setLastSummary] = useState<SessionSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [sessionDetailById, setSessionDetailById] = useState<Record<string, Awaited<ReturnType<typeof api.getSessionDetail>>>>({});
  const { telemetry: deviceTelemetry, status: deviceWsStatus } = useEngineWebSocket(Boolean(user));
  const deviceConnected = Boolean(deviceTelemetry?.connected);

  const refreshAllData = useCallback(async () => {
    if (!user) return;
    const [ridersData, mapsData, sessionsData, prefsData] = await Promise.all([
      api.getRiders(),
      api.getMaps(),
      api.getSessions(50),
      api.getPreferences(),
    ]);
    setRiders(ridersData);
    setCourses(mapsData);
    setSessionHistory(sessionsData);
    setLastSummary(sessionsData[0] ?? null);
    if (prefsData) setPreferences(prefsData);

    setSetupConfig((prev) => ({
      ...prev,
      riderId: prev.riderId || ridersData[0]?.id || "",
      courseId: prev.courseId || mapsData[0]?.id || "",
      laps: prev.laps || mapsData[0]?.defaultLaps || 4,
      distanceKm:
        prev.distanceKm ||
        Number(((mapsData[0]?.lengthKm ?? 5) * (mapsData[0]?.defaultLaps ?? 4)).toFixed(1)),
      raceMode: prefsData?.defaultRaceMode ?? prev.raceMode,
    }));
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setIsBootstrapping(true);
      try {
        api.loadStoredSession();
        const me = await api.me();
        if (!mounted) return;
        setUser(me.user);
        if (me.profile) {
          setProfile({
            userId: me.profile.user_id,
            displayName: me.profile.display_name,
            createdAt: me.profile.created_at,
            updatedAt: me.profile.updated_at,
          });
        }
      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
      if (mounted) setIsBootstrapping(false);
    }
    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const loadLeaderboard = useCallback(
    async (params?: { mapId?: string; raceMode?: string; sort?: "time" | "efficiency" | "lap" }) => {
      try {
        const rows = await api.getLeaderboard(params ?? {});
        setLeaderboard(rows);
      } catch {
        setLeaderboard([]);
      }
    },
    [],
  );

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      void refreshAllData();
      void loadLeaderboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLeaderboard, refreshAllData, user]);

  async function signIn(email: string, password: string) {
    try {
      const data = await api.signIn(email, password);
      if (!data.user) throw new Error("Authentication failed");
      setUser(data.user);
      const me = await api.me();
      setProfile(
        me.profile
          ? {
              userId: me.profile.user_id,
              displayName: me.profile.display_name,
              createdAt: me.profile.created_at,
              updatedAt: me.profile.updated_at,
            }
          : null,
      );
      await refreshAllData();
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to sign in" };
    }
  }

  async function signUp(email: string, password: string, displayName: string) {
    try {
      await api.signUp(email, password, displayName);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to sign up" };
    }
  }

  async function signOut() {
    try {
      await api.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      setRiders([]);
      setSessionHistory([]);
      setLeaderboard([]);
      setLastSummary(null);
      setLiveSession(null);
      setActiveSessionId(null);
    }
  }

  async function resetPassword(email: string) {
    try {
      await api.resetPassword(email, `${window.location.origin}/auth/reset`);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to send reset email" };
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      await api.updatePassword(newPassword);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to update password" };
    }
  }

  async function updateProfile(displayName: string) {
    try {
      const next = await api.updateProfile(displayName);
      setProfile({
        userId: next.user_id,
        displayName: next.display_name,
        createdAt: next.created_at,
        updatedAt: next.updated_at,
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to update profile" };
    }
  }

  async function createRider(rider: Omit<Rider, "id">) {
    try {
      const created = await api.createRider(rider);
      setRiders((prev) => [created, ...prev]);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to create rider" };
    }
  }

  async function updateRider(id: string, rider: Omit<Rider, "id">) {
    try {
      const updated = await api.updateRider(id, rider);
      setRiders((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to update rider" };
    }
  }

  async function deleteRider(id: string) {
    try {
      await api.deleteRider(id);
      setRiders((prev) => prev.filter((item) => item.id !== id));
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to delete rider" };
    }
  }

  async function saveSetupConfig(nextConfig?: SetupConfig, status: "draft" | "active" | "completed" = "draft") {
    const payload = nextConfig ?? setupConfig;
    if (!payload.riderId || !payload.courseId) return;
    if (payload.raceSetupId) {
      await api.updateRaceSetup(payload.raceSetupId, payload, status);
      return;
    }
    const created = await api.createRaceSetup(payload);
    setSetupConfig((prev) => ({ ...prev, raceSetupId: created.id }));
  }

  async function savePreferences(next: Preferences) {
    const previous = preferences;
    setPreferences(next);
    try {
      const saved = await api.savePreferences(next);
      setPreferences(saved);
      return { error: null };
    } catch (error) {
      setPreferences(previous);
      return { error: error instanceof Error ? error.message : "Unable to save preferences" };
    }
  }

  const refreshDeviceState = useCallback(async () => {
    try {
      return await deviceApi.getState();
    } catch {
      return null;
    }
  }, []);

  const loadSessionDetail = useCallback(async (sessionId: string) => {
    const detail = await api.getSessionDetail(sessionId);
    setSessionDetailById((prev) => ({ ...prev, [sessionId]: detail }));
    const session = sessionHistory.find((item) => item.id === sessionId);
    if (!session) return;
    const nextSummary: SessionSummary = {
      ...session,
      lapTimesSec: detail.laps.map((lap) => lap.lap_time_sec),
      lapTimes: detail.laps.map((lap) => secondsToLapLabel(lap.lap_time_sec)),
      finalTime: formatDuration((detail.session.final_time_sec as number | null) ?? session.finalTimeSec),
    };
    setSessionHistory((prev) => prev.map((item) => (item.id === sessionId ? nextSummary : item)));
    setLastSummary(nextSummary);
  }, [sessionHistory]);

  const value: AppContextValue = {
    user,
    profile,
    authLoading,
    isBootstrapping,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshAllData,
    riders,
    createRider,
    updateRider,
    deleteRider,
    courses,
    setupConfig,
    setSetupConfig,
    saveSetupConfig,
    liveSession,
    setLiveSession,
    activeSessionId,
    setActiveSessionId,
    sessionHistory,
    setSessionHistory,
    lastSummary,
    setLastSummary,
    leaderboard,
    loadLeaderboard,
    preferences,
    setPreferences,
    savePreferences,
    sessionDetailById,
    loadSessionDetail,
    deviceTelemetry,
    deviceWsStatus,
    deviceConnected,
    refreshDeviceState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
