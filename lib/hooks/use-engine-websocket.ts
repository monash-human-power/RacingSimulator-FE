"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceTelemetry } from "@/lib/types";

const WS_URL =
  process.env.NEXT_PUBLIC_ENGINE_WS_URL ?? "ws://localhost:8000/ws/engine";

function mapPayload(data: Record<string, unknown>): DeviceTelemetry {
  return {
    speedMs: Number(data.speed_ms ?? 0),
    powerW: Number(data.power_w ?? 0),
    cadenceRpm: data.cadence_rpm != null ? Number(data.cadence_rpm) : null,
    heartRateBpm: data.heart_rate_bpm != null ? Number(data.heart_rate_bpm) : null,
    resistanceLevel: data.resistance_level != null ? Number(data.resistance_level) : null,
    averagePowerW: data.average_power_w != null ? Number(data.average_power_w) : null,
    totalDistanceM: data.total_distance_m != null ? Number(data.total_distance_m) : null,
    connected: Boolean(data.connected),
    deviceName: typeof data.device_name === "string" ? data.device_name : null,
    receivedAt: Date.now(),
  };
}

export function useEngineWebSocket(enabled = true) {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "closed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    setError(null);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setStatus("open");
    ws.onclose = () => {
      setStatus("closed");
      wsRef.current = null;
    };
    ws.onerror = () => {
      setStatus("error");
      setError("WebSocket connection failed");
    };
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type?: string;
          data?: Record<string, unknown>;
        };
        if (message.type === "engine_output" && message.data) {
          setTelemetry(mapPayload(message.data));
        }
      } catch {
        setError("Invalid telemetry payload");
      }
    };
  }, [enabled]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("closed");
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }
    connect();
    return () => disconnect();
  }, [connect, disconnect, enabled]);

  return { telemetry, status, error, connect, disconnect };
}
