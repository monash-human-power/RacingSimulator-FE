"use client";

import { apiClient, clearSessionTokens, loadStoredSession, saveSessionTokens, getAccessToken } from "@/lib/api/client";
import { mapCourse, mapLeaderboardEntry, mapPreferences, mapRider, mapSessionSummary } from "@/lib/api/mappers";
import { Preferences, SetupConfig } from "@/lib/types";

export const api = {
  loadStoredSession,
  clearSessionTokens,
  getAccessToken,
  async signIn(email: string, password: string) {
    const data = await apiClient.post<{
      user: { id: string; email: string | null } | null;
      session: { access_token: string; refresh_token: string } | null;
    }>("/api/auth/sign-in", { email, password });
    if (data.session) {
      saveSessionTokens(data.session.access_token, data.session.refresh_token);
    }
    return data;
  },
  async signUp(email: string, password: string, displayName: string) {
    return apiClient.post("/api/auth/sign-up", { email, password, displayName });
  },
  async signOut() {
    const token = getAccessToken();
    await apiClient.post("/api/auth/sign-out", { accessToken: token ?? undefined });
    clearSessionTokens();
  },
  async resetPassword(email: string, redirectTo?: string) {
    return apiClient.post("/api/auth/reset-password", { email, redirectTo });
  },
  async updatePassword(newPassword: string) {
    return apiClient.post("/api/auth/update-password", { newPassword });
  },
  async me() {
    return apiClient.get<{
      user: { id: string; email: string | null };
      profile: { user_id: string; display_name: string; created_at: string; updated_at: string } | null;
    }>("/api/auth/me");
  },
  async updateProfile(displayName: string) {
    return apiClient.patch<{
      user_id: string;
      display_name: string;
      created_at: string;
      updated_at: string;
    }>("/api/auth/profile", { displayName });
  },
  async getRiders() {
    const rows = await apiClient.get<
      Array<{
        id: string;
        first_name: string;
        last_name: string;
        weight_kg: number;
        experience: "Beginner" | "Intermediate" | "Advanced" | "Pro";
        notes: string;
        created_at: string;
      }>
    >("/api/riders");
    return rows.map(mapRider);
  },
  async createRider(payload: {
    firstName: string;
    lastName: string;
    weightKg: number;
    experience: "Beginner" | "Intermediate" | "Advanced" | "Pro";
    notes: string;
  }) {
    const row = await apiClient.post<{
      id: string;
      first_name: string;
      last_name: string;
      weight_kg: number;
      experience: "Beginner" | "Intermediate" | "Advanced" | "Pro";
      notes: string;
      created_at: string;
    }>("/api/riders", payload);
    return mapRider(row);
  },
  async updateRider(
    id: string,
    payload: {
      firstName: string;
      lastName: string;
      weightKg: number;
      experience: "Beginner" | "Intermediate" | "Advanced" | "Pro";
      notes: string;
    },
  ) {
    const row = await apiClient.put<{
      id: string;
      first_name: string;
      last_name: string;
      weight_kg: number;
      experience: "Beginner" | "Intermediate" | "Advanced" | "Pro";
      notes: string;
      created_at: string;
    }>(`/api/riders/${id}`, payload);
    return mapRider(row);
  },
  async deleteRider(id: string) {
    return apiClient.delete<{ success: boolean }>(`/api/riders/${id}`);
  },
  async getMaps() {
    const rows = await apiClient.get<
      Array<{
        id: string;
        name: string;
        length_km: number;
        terrain: string;
        difficulty: "Low" | "Medium" | "High";
        elevation_gain_m: number;
        default_laps: number;
      }>
    >("/api/maps");
    return rows.map(mapCourse);
  },
  async getPreferences() {
    const row = await apiClient.get<{
      units: Preferences["units"];
      show_map_overlay: boolean;
      show_performance_delta: boolean;
      default_race_mode: Preferences["defaultRaceMode"];
    } | null>("/api/preferences");
    return row ? mapPreferences(row) : null;
  },
  async savePreferences(payload: Preferences) {
    const row = await apiClient.put<{
      units: Preferences["units"];
      show_map_overlay: boolean;
      show_performance_delta: boolean;
      default_race_mode: Preferences["defaultRaceMode"];
    }>("/api/preferences", payload);
    return mapPreferences(row);
  },
  async createRaceSetup(payload: SetupConfig) {
    return apiClient.post<{ id: string }>("/api/race-setups", {
      riderId: payload.riderId,
      bikeMode: payload.bikeMode,
      mapId: payload.courseId,
      raceMode: payload.raceMode,
      laps: payload.laps,
      distanceKm: payload.distanceKm,
      climate: payload.climate,
      skipDeviceChecks: payload.skipDeviceChecks,
      status: "draft",
    });
  },
  async updateRaceSetup(id: string, payload: SetupConfig, status: "draft" | "active" | "completed" = "draft") {
    return apiClient.put<{ id: string }>(`/api/race-setups/${id}`, {
      riderId: payload.riderId,
      bikeMode: payload.bikeMode,
      mapId: payload.courseId,
      raceMode: payload.raceMode,
      laps: payload.laps,
      distanceKm: payload.distanceKm,
      climate: payload.climate,
      skipDeviceChecks: payload.skipDeviceChecks,
      status,
    });
  },
  async startSession(payload: SetupConfig) {
    return apiClient.post<{ id: string }>("/api/sessions/start", {
      raceSetupId: payload.raceSetupId,
      riderId: payload.riderId,
      mapId: payload.courseId,
      raceMode: payload.raceMode,
      bikeMode: payload.bikeMode,
      laps: payload.laps,
      distanceKm: payload.distanceKm,
      climate: payload.climate,
      skipDeviceChecks: payload.skipDeviceChecks,
    });
  },
  async completeSession(
    sessionId: string,
    payload: {
      finalTimeSec: number;
      avgPower: number;
      avgSpeed: number;
      avgHeartRate: number;
      efficiency: number;
      lapTimesSec: number[];
      metricsTimeline: Array<{ t: number; speed: number; power: number; cadence: number; heartRate: number }>;
      analysisSummary: {
        peakOutputNote: string;
        dropZoneNote: string;
        keyMomentNote: string;
        insight: string;
        actualVsTarget: { powerTarget: number; speedTarget: number; hrCap: number };
      };
    },
  ) {
    return apiClient.post<{ success: boolean }>(`/api/sessions/${sessionId}/complete`, payload);
  },
  async getSessions(limit = 50) {
    const rows = await apiClient.get<
      Array<{
        id: string;
        rider_id: string;
        race_mode: "Endurance" | "Time Trial" | "Sprint Intervals";
        final_time_sec: number | null;
        avg_power: number | null;
        avg_speed: number | null;
        avg_heart_rate: number | null;
        efficiency: number | null;
        created_at: string;
        riders: { first_name: string; last_name: string } | null;
        maps: { name: string } | null;
      }>
    >(`/api/sessions?limit=${limit}`);
    return rows.map(mapSessionSummary);
  },
  async getSessionDetail(id: string) {
    return apiClient.get<{
      session: Record<string, unknown>;
      laps: Array<{ lap_number: number; lap_time_sec: number }>;
      metricsTimeline: Array<{ t: number; speed: number; power: number; cadence: number; heart_rate: number }>;
      analysis: {
        peak_output_note: string;
        drop_zone_note: string;
        key_moment_note: string;
        insight: string;
        actual_vs_target: { powerTarget: number; speedTarget: number; hrCap: number };
      } | null;
    }>(`/api/sessions/${id}`);
  },
  async getLeaderboard(params: { mapId?: string; raceMode?: string; sort?: "time" | "efficiency" | "lap" }) {
    const search = new URLSearchParams();
    if (params.mapId) search.set("mapId", params.mapId);
    if (params.raceMode) search.set("raceMode", params.raceMode);
    if (params.sort) search.set("sort", params.sort);
    const rows = await apiClient.get<
      Array<{
        id: string;
        user_id: string;
        race_mode: "Endurance" | "Time Trial" | "Sprint Intervals";
        final_time_sec: number;
        efficiency: number;
        best_lap_sec: number;
        avg_power: number;
        avg_speed: number;
        avg_heart_rate: number;
        created_at: string;
        maps: { name: string } | null;
        sessions: { riders: { first_name: string; last_name: string } | null } | null;
      }>
    >(`/api/leaderboard?${search.toString()}`);
    return rows.map(mapLeaderboardEntry);
  },
};
