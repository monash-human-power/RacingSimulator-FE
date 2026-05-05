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
}

export interface Course {
  id: string;
  name: string;
  lengthKm: number;
  terrain: string;
  difficulty: "Low" | "Medium" | "High";
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
  avgPower: number;
  avgSpeed: number;
  avgHeartRate: number;
  efficiency: number;
  lapTimes: string[];
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
