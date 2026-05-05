import { Course, Rider, SessionSummary, SetupConfig } from "@/lib/types";

export const mockRiders: Rider[] = [
  {
    id: "r1",
    firstName: "Aisha",
    lastName: "Carter",
    weightKg: 64,
    experience: "Advanced",
    notes: "Strong climbing profile. Focus on pacing consistency.",
  },
  {
    id: "r2",
    firstName: "Liam",
    lastName: "Reid",
    weightKg: 71,
    experience: "Intermediate",
    notes: "Improving cadence efficiency in final laps.",
  },
  {
    id: "r3",
    firstName: "Maya",
    lastName: "Singh",
    weightKg: 58,
    experience: "Pro",
    notes: "Excellent sprint power. Keep heart rate below threshold early.",
  },
];

export const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Alpine Circuit",
    lengthKm: 5.6,
    terrain: "Rolling Hills",
    difficulty: "High",
  },
  {
    id: "c2",
    name: "Coastal Sprint Loop",
    lengthKm: 3.2,
    terrain: "Flat / Windy",
    difficulty: "Medium",
  },
  {
    id: "c3",
    name: "City Tempo Ring",
    lengthKm: 4.4,
    terrain: "Urban Mixed",
    difficulty: "Low",
  },
];

export const mockSessionHistory: SessionSummary[] = [
  {
    id: "s1",
    riderId: "r1",
    riderName: "Aisha Carter",
    courseName: "Alpine Circuit",
    mode: "Time Trial",
    finalTime: "00:32:41",
    finalTimeSec: 1961,
    avgPower: 282,
    avgSpeed: 31.8,
    avgHeartRate: 163,
    efficiency: 92,
    lapTimes: ["08:12", "08:05", "08:14", "08:10"],
    createdAt: "Today",
  },
  {
    id: "s2",
    riderId: "r2",
    riderName: "Liam Reid",
    courseName: "Coastal Sprint Loop",
    mode: "Sprint Intervals",
    finalTime: "00:18:22",
    finalTimeSec: 1102,
    avgPower: 255,
    avgSpeed: 34.2,
    avgHeartRate: 157,
    efficiency: 88,
    lapTimes: ["06:09", "06:04", "06:09"],
    createdAt: "Yesterday",
  },
];

export const defaultSetupConfig: SetupConfig = {
  riderId: mockRiders[0].id,
  bikeMode: "Road Bike",
  courseId: mockCourses[0].id,
  raceMode: "Endurance",
  laps: 4,
  distanceKm: mockCourses[0].lengthKm * 4,
  climate: { temperatureC: 23, humidity: 52, windKmh: 16 },
  skipDeviceChecks: false,
};
