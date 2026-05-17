"use client";

import { useCallback, useEffect, useState } from "react";
import { Bluetooth, LoaderCircle, Plug, PlugZap, Radio, RefreshCw, Unplug } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { deviceApi } from "@/lib/api/devices";
import { useAppContext } from "@/lib/app-context";
import { msToKmh, writeUseDeviceDataFlag } from "@/lib/device-live";
import { DeviceState, ScannedDevice } from "@/lib/types";

export default function DevicesPage() {
  const { deviceTelemetry, deviceWsStatus, refreshDeviceState } = useAppContext();
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);
  const [targetPower, setTargetPower] = useState(200);

  const loadState = useCallback(async () => {
    try {
      const state = await deviceApi.getState();
      setDeviceState(state);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load device state");
    }
  }, []);

  const checkEngine = useCallback(async () => {
    try {
      await deviceApi.health();
      setEngineOnline(true);
    } catch {
      setEngineOnline(false);
    }
  }, []);

  useEffect(() => {
    void checkEngine();
    void loadState();
  }, [checkEngine, loadState]);

  useEffect(() => {
    if (deviceTelemetry?.connected) {
      writeUseDeviceDataFlag(true);
    }
  }, [deviceTelemetry?.connected]);

  async function handleScan() {
    setScanning(true);
    setError(null);
    try {
      const found = await deviceApi.scan();
      setDevices(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function handleConnect(address?: string) {
    setConnecting(true);
    setError(null);
    try {
      await deviceApi.connect(address);
      writeUseDeviceDataFlag(true);
      await loadState();
      await refreshDeviceState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    setError(null);
    try {
      await deviceApi.disconnect();
      writeUseDeviceDataFlag(false);
      await loadState();
      await refreshDeviceState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetPower() {
    setBusy(true);
    setError(null);
    try {
      await deviceApi.setTargetPower(targetPower);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set target power");
    } finally {
      setBusy(false);
    }
  }

  const connected = deviceState?.connected ?? deviceTelemetry?.connected ?? false;
  const speedKmh = deviceTelemetry ? msToKmh(deviceTelemetry.speedMs) : 0;

  return (
    <AppShell
      title="Device Lab"
      subtitle="Scan, connect, and test BLE trainers (FTMS / KICKR) with live telemetry."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Service Status</p>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                engineOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {engineOnline === null ? "Checking…" : engineOnline ? "Engine online" : "Engine offline"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void handleScan()}
              disabled={scanning}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              {scanning ? <LoaderCircle className="animate-spin" size={15} /> : <RefreshCw size={15} />}
              Scan BLE
            </button>
            <button
              onClick={() => void handleConnect()}
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300 disabled:opacity-50"
            >
              {connecting ? <LoaderCircle className="animate-spin" size={15} /> : <PlugZap size={15} />}
              Auto-connect KICKR
            </button>
            <button
              onClick={() => void handleDisconnect()}
              disabled={busy || !connected}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"
            >
              <Unplug size={15} />
              Disconnect
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Trainer connection</span>
              <span className={connected ? "text-emerald-300" : "text-slate-400"}>
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <p className="mt-2 text-slate-300">
              {deviceState?.ble?.device_name ?? deviceTelemetry?.deviceName ?? "No device selected"}
            </p>
            <p className="text-xs text-slate-500">
              WebSocket: {deviceWsStatus}
              {deviceState?.ble?.device_address ? ` • ${deviceState.ble.device_address}` : ""}
            </p>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Discovered devices</p>
            {devices.length === 0 ? (
              <p className="text-sm text-slate-500">Run a scan to list nearby BLE devices.</p>
            ) : (
              devices.map((device) => (
                <div
                  key={device.address}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3"
                >
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-xs text-slate-500">{device.address}</p>
                  </div>
                  <button
                    onClick={() => void handleConnect(device.address)}
                    disabled={connecting}
                    className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/50 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50"
                  >
                    <Plug size={13} />
                    {device.isTrainer ? "Connect trainer" : "Connect"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live telemetry</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Speed" value={`${speedKmh} km/h`} />
            <StatCard label="Power" value={`${deviceTelemetry?.powerW ?? 0} W`} />
            <StatCard label="Cadence" value={`${Math.round(deviceTelemetry?.cadenceRpm ?? 0)} rpm`} />
            <StatCard
              label="Heart rate"
              value={deviceTelemetry?.heartRateBpm != null ? `${deviceTelemetry.heartRateBpm} bpm` : "—"}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
            <p className="mb-2 inline-flex items-center gap-2 text-slate-300">
              <Radio size={14} />
              Raw stream
            </p>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed text-slate-300">
              {deviceTelemetry
                ? JSON.stringify(deviceTelemetry, null, 2)
                : "Waiting for WebSocket engine_output messages…"}
            </pre>
          </div>

          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">ERG test control</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-sm">
                Target power (W)
                <input
                  type="number"
                  min={0}
                  max={4000}
                  value={targetPower}
                  onChange={(e) => setTargetPower(Number(e.target.value))}
                  className="mt-1 block w-32 rounded-lg border border-white/20 bg-black/30 px-3 py-2"
                />
              </label>
              <button
                onClick={() => void handleSetPower()}
                disabled={busy || !connected}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
              >
                Set ERG power
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            <Bluetooth size={12} className="mr-1 inline" />
            When connected here, live race sessions use trainer data instead of the mock simulator.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
