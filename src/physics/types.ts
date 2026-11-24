import type { PlateWeight } from '../objects/createPlate'

export type Side = 'left' | 'right'
export type Vec3 = [number, number, number]
export type Quat = [number, number, number, number]

export type LoadedPlate = {
  id: string
  side: Side
  kg: PlateWeight
  x: number
  thickness: number
}

export type LoadedCollar = {
  id: string
  side: Side
  x: number
}

export type AutoloadItem = {
  kind: 'plate' | 'collar'
  side: Side
  kg?: PlateWeight
}
