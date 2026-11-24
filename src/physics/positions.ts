import { Quaternion, Vector3 } from 'three'
import { PLATE_WEIGHTS, type PlateWeight } from '../objects/createPlate'
import {
  RACK_BIG_CENTER_Y,
  RACK_BIG_SPACING,
  RACK_CENTER_X,
  RACK_CENTER_Z,
  RACK_COLLAR_X,
  RACK_COLLAR_Y,
  RACK_SMALL_CENTER_Y,
  RACK_SMALL_SPACING,
  RACK_YAW,
} from '../scene/dimensions'
import { DEFAULT_STATION, STATIONS, type StationId } from '../scene/stations'
import type { Quat, Side, Vec3 } from './types'

export function getBarPosition(station: StationId): Vec3 {
  return [...STATIONS[station].bar]
}

export const BAR_POSITION: Vec3 = getBarPosition(DEFAULT_STATION)

const SIDE_SIGN: Record<Side, number> = { left: -1, right: 1 }

export function rackX(side: Side): number {
  return SIDE_SIGN[side] * RACK_CENTER_X
}

export function rackYaw(side: Side): number {
  return RACK_YAW[side]
}

function rackWorld(side: Side, localX: number, localY: number, localZ = 0): Vec3 {
  const yaw = rackYaw(side)
  const x = localX * Math.cos(yaw) + localZ * Math.sin(yaw)
  const z = -localX * Math.sin(yaw) + localZ * Math.cos(yaw)

  return [rackX(side) + x, localY, RACK_CENTER_Z + z]
}

// Local slot of each weight: big discs on the low row, change plates above.
export function rackSlot(kg: PlateWeight): { x: number; y: number } {
  const index = PLATE_WEIGHTS.indexOf(kg)

  if (index < 5) {
    return { x: (index - 2) * RACK_BIG_SPACING, y: RACK_BIG_CENTER_Y }
  }

  return {
    x: (index - 7) * RACK_SMALL_SPACING,
    y: RACK_SMALL_CENTER_Y,
  }
}

export function stockPlatePosition(kg: PlateWeight, side: Side): Vec3 {
  const slot = rackSlot(kg)

  return rackWorld(side, slot.x, slot.y)
}

export function stockCollarPosition(side: Side): Vec3 {
  return rackWorld(side, RACK_COLLAR_X, RACK_COLLAR_Y)
}

// Cylinder axis is Y by default. Pitch it forward, then yaw the whole rack.
export function stockRotation(side: Side): Quat {
  const pitch = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
  const yaw = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), rackYaw(side))

  return yaw.multiply(pitch).toArray() as Quat
}
