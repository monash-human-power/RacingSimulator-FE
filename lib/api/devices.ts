"use client";

import { apiClient } from "@/lib/api/client";
import { DeviceState, ScannedDevice } from "@/lib/types";

export const deviceApi = {
  async health() {
    return apiClient.get<{ ok: boolean }>("/api/devices/health");
  },
  async getState() {
    return apiClient.get<DeviceState>("/api/devices/state");
  },
  async scan() {
    return apiClient.get<ScannedDevice[]>("/api/devices/scan");
  },
  async connect(address?: string) {
    return apiClient.post<{ connected: boolean; device: unknown }>("/api/devices/connect", {
      address,
    });
  },
  async disconnect() {
    return apiClient.post<{ connected: boolean }>("/api/devices/disconnect", {});
  },
  async setTargetPower(watts: number) {
    return apiClient.post<{ ok: boolean; targetPowerW: number }>("/api/devices/control/target-power", {
      watts,
    });
  },
  async setTargetResistance(level: number) {
    return apiClient.post<{ ok: boolean; targetResistanceLevel: number }>(
      "/api/devices/control/target-resistance",
      { level },
    );
  },
  async setSimulation(gradePct: number, windSpeedMs = 0) {
    return apiClient.post<{ ok: boolean; gradePct: number }>("/api/devices/control/simulation", {
      gradePct,
      windSpeedMs,
    });
  },
};
