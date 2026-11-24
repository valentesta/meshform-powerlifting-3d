import { PLATFORM_HEIGHT } from './dimensions'

export type StationId = 'squat' | 'bench' | 'deadlift'

export type StationConfig = {
  id: StationId
  label: string
  center: [number, number, number]
  camera: [number, number, number]
  target: [number, number, number]
  bar: [number, number, number]
  accent: string
}

export const DEFAULT_STATION: StationId = 'squat'

const PLATE_RADIUS = 0.225

// One competition platform: only the equipment and the bar height change.
export const STATIONS: Record<StationId, StationConfig> = {
  squat: {
    id: 'squat',
    label: 'SQUAT',
    center: [0, 0, 0],
    camera: [0.9, 3, -6.4],
    target: [0, 1.05, 0],
    bar: [0, PLATFORM_HEIGHT + 1.3, 0],
    accent: '#38bdf8',
  },
  bench: {
    id: 'bench',
    label: 'BENCH',
    center: [0, 0, 0],
    camera: [0.9, 2.4, -6.2],
    target: [0, 0.85, 0],
    bar: [0, PLATFORM_HEIGHT + 1.1, 0],
    accent: '#f87171',
  },
  deadlift: {
    id: 'deadlift',
    label: 'DEADLIFT',
    center: [0, 0, 0],
    camera: [0.9, 1.9, -6.2],
    target: [0, 0.5, 0],
    bar: [0, PLATFORM_HEIGHT + PLATE_RADIUS, 0],
    accent: '#fbbf24',
  },
}

export const STATION_LIST: StationConfig[] = Object.values(STATIONS)
