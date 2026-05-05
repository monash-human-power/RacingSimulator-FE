import { Course, LeaderboardEntry, Preferences, Rider, SessionSummary } from "@/lib/types";
import { formatDuration } from "@/lib/session-utils";

export function mapRider(row: {
  id: string;
  first_name: string;
  last_name: string;
  weight_kg: number;
  experience: Rider["experience"];
  notes: string;
  created_at?: string;
}): Rider {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    weightKg: Number(row.weight_kg),
    experience: row.experience,
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}

export function mapCourse(row: {
  id: string;
  name: string;
  length_km: number;
  terrain: string;
  difficulty: Course["difficulty"];
  elevation_gain_m?: number;
  default_laps?: number;
}): Course {
  return {
    id: row.id,
    name: row.name,
    lengthKm: Number(row.length_km),
    terrain: row.terrain,
    difficulty: row.difficulty,
    elevationGainM: row.elevation_gain_m,
    defaultLaps: row.default_laps,
  };
}

export function mapPreferences(row: {
  units: Preferences["units"];
  show_map_overlay: boolean;
  show_performance_delta: boolean;
  default_race_mode: Preferences["defaultRaceMode"];
}): Preferences {
  return {
    units: row.units,
    showMapOverlay: row.show_map_overlay,
    showPerformanceDelta: row.show_performance_delta,
    defaultRaceMode: row.default_race_mode,
  };
}

export function mapSessionSummary(row: {
  id: string;
  rider_id: string;
  race_mode: SessionSummary["mode"];
  final_time_sec: number | null;
  avg_power: number | null;
  avg_speed: number | null;
  avg_heart_rate: number | null;
  efficiency: number | null;
  created_at: string;
  riders?: { first_name: string; last_name: string } | null;
  maps?: { name: string } | null;
}): SessionSummary {
  const finalTimeSec = row.final_time_sec ?? 0;
  return {
    id: row.id,
    riderId: row.rider_id,
    riderName: row.riders ? `${row.riders.first_name} ${row.riders.last_name}` : "Unknown Rider",
    courseName: row.maps?.name ?? "Unknown Course",
    mode: row.race_mode,
    finalTime: formatDuration(finalTimeSec),
    finalTimeSec,
    avgPower: Math.round(row.avg_power ?? 0),
    avgSpeed: Number((row.avg_speed ?? 0).toFixed(1)),
    avgHeartRate: Math.round(row.avg_heart_rate ?? 0),
    efficiency: Math.round(row.efficiency ?? 0),
    lapTimes: [],
    createdAt: new Date(row.created_at).toLocaleString(),
  };
}

export function mapLeaderboardEntry(row: {
  id: string;
  user_id: string;
  race_mode: LeaderboardEntry["raceMode"];
  final_time_sec: number;
  efficiency: number;
  best_lap_sec: number;
  avg_power: number;
  avg_speed: number;
  avg_heart_rate: number;
  created_at: string;
  maps?: { name: string } | null;
  profiles?: { display_name: string } | null;
}): LeaderboardEntry {
  return {
    id: row.id,
    userId: row.user_id,
    riderName: row.profiles?.display_name ?? "Rider",
    courseName: row.maps?.name ?? "Course",
    raceMode: row.race_mode,
    finalTimeSec: row.final_time_sec,
    finalTime: formatDuration(row.final_time_sec),
    efficiency: Math.round(row.efficiency),
    bestLapSec: row.best_lap_sec,
    bestLap: formatDuration(row.best_lap_sec).slice(3),
    avgPower: Math.round(row.avg_power),
    avgSpeed: Number(row.avg_speed.toFixed(1)),
    avgHeartRate: Math.round(row.avg_heart_rate),
    createdAt: new Date(row.created_at).toLocaleString(),
  };
}
