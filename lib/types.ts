export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Pro";

export type BikeMode = "Road Bike" | "TT Bike" | "Triathlon Rig";

export type RaceMode = "Endurance" | "Time Trial" | "Sprint Intervals";

export interface Rider {
  id: string;
  firstName: string;
  lastName: string;
  weightKg: number;
  experience: ExperienceLevel;
  notes: string;
  createdAt?: string;
}

export interface Course {
  id: string;
  name: string;
  lengthKm: number;
  terrain: string;
  difficulty: "Low" | "Medium" | "High";
  elevationGainM?: number;
  defaultLaps?: number;
}

export interface ClimateProfile {
  temperatureC: number;
  humidity: number;
  windKmh: number;
}

export interface SessionMetric {
  t: number;
  speed: number;
  power: number;
  cadence: number;
  heartRate: number;
}

export interface SessionSummary {
  id: string;
  riderId: string;
  riderName: string;
  courseName: string;
  mode: RaceMode;
  finalTime: string;
  finalTimeSec: number;
  avgPower: number;
  avgSpeed: number;
  avgHeartRate: number;
  efficiency: number;
  lapTimes: string[];
  lapTimesSec?: number[];
  createdAt: string;
}

export interface SetupConfig {
  riderId: string;
  bikeMode: BikeMode;
  courseId: string;
  raceMode: RaceMode;
  laps: number;
  distanceKm: number;
  climate: ClimateProfile;
  skipDeviceChecks: boolean;
  raceSetupId?: string;
}

export interface LiveSessionState {
  isActive: boolean;
  isPaused: boolean;
  elapsedSec: number;
  totalDistanceKm: number;
  distanceCompletedKm: number;
  currentLap: number;
  speed: number;
  power: number;
  cadence: number;
  heartRate: number;
  projectedFinish: string;
  sectionLabel: string;
  effortZone: string;
  targetPower: number;
  metricsTimeline: SessionMetric[];
}

export interface UserIdentity {
  id: string;
  email: string | null;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  units: "Metric" | "Imperial";
  showMapOverlay: boolean;
  showPerformanceDelta: boolean;
  defaultRaceMode: RaceMode;
}

export interface ScannedDevice {
  name: string;
  address: string;
  isTrainer: boolean;
}

export interface DeviceTelemetry {
  speedMs: number;
  powerW: number;
  cadenceRpm: number | null;
  heartRateBpm: number | null;
  resistanceLevel: number | null;
  averagePowerW: number | null;
  totalDistanceM: number | null;
  connected: boolean;
  deviceName: string | null;
  receivedAt: number;
}

export interface DeviceState {
  connected: boolean;
  ble: {
    connected?: boolean;
    device_name?: string | null;
    device_address?: string | null;
    bike?: Record<string, unknown>;
  } | null;
  engine: Record<string, unknown> | null;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  riderName: string;
  courseName: string;
  raceMode: RaceMode;
  finalTimeSec: number;
  finalTime: string;
  efficiency: number;
  bestLapSec: number;
  bestLap: string;
  avgPower: number;
  avgSpeed: number;
  avgHeartRate: number;
  createdAt: string;
}
