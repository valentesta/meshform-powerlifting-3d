import { BAR } from '../objects/barbellSpecs'
import { createPlate, PLATE_WEIGHTS, type PlateWeight } from '../objects/createPlate'
import type { AutoloadItem, LoadedCollar, LoadedPlate, Side, Vec3 } from './types'

export { stockCollarPosition, stockPlatePosition, stockRotation } from './positions'

export const COLLAR_THICKNESS = 0.06
export const COLLAR_RADIUS = 0.033
export const PLATE_GAP = 0.002
export const PLATE_INNER_EDGE = BAR.shaftLength / 2
export const SLEEVE_OUTER_EDGE = PLATE_INNER_EDGE + BAR.sleeveLength

// Rapier's cylinder axis is Y, so loading guides rotate it to the bar's X axis.
export const LOADED_ROTATION: [number, number, number, number] = [
  0,
  0,
  Math.SQRT1_2,
  Math.SQRT1_2,
]
function plateCursor(side: Side, plates: LoadedPlate[]): number {
  return plates
    .filter((plate) => plate.side === side)
    .reduce((cursor, plate) => cursor + plate.thickness + PLATE_GAP, PLATE_INNER_EDGE + PLATE_GAP)
}

export function nextPlateX(side: Side, plates: LoadedPlate[], kg: PlateWeight): number | null {
  const thickness = createPlate(kg).thickness
  const cursor = plateCursor(side, plates)
  const outerEdge = cursor + thickness + PLATE_GAP
  const limit = SLEEVE_OUTER_EDGE - COLLAR_THICKNESS - PLATE_GAP

  if (outerEdge > limit) return null

  const x = cursor + thickness / 2

  return side === 'right' ? x : -x
}

export function nextCollarX(
  side: Side,
  plates: LoadedPlate[],
  collars: LoadedCollar[],
): number | null {
  if (collars.some((collar) => collar.side === side)) return null

  const x = plateCursor(side, plates) + COLLAR_THICKNESS / 2

  if (x + COLLAR_THICKNESS / 2 > SLEEVE_OUTER_EDGE + 0.001) return null

  return side === 'right' ? x : -x
}

// Collars always sit outside the plates. Whenever plates change, recalculate
// collar positions so a collar loaded first never overlaps a plate added later.
export function reflowCollars(
  plates: LoadedPlate[],
  collars: LoadedCollar[],
): LoadedCollar[] {
  const seen = new Set<Side>()

  return collars.map((collar) => {
    if (seen.has(collar.side)) return collar

    seen.add(collar.side)
    const x = nextCollarX(collar.side, plates, [])

    return x === null ? collar : { ...collar, x }
  })
}

export function loadedWorldPosition(x: number, barPosition: Vec3): Vec3 {
  return [barPosition[0] + x, barPosition[1], barPosition[2]]
}

// Target = bar + collars + plates. Split the plate weight symmetrically and
// fill each sleeve from the heaviest disc down.
export function computeAutoload(targetKg: number): AutoloadItem[] {
  const plateTotal = Math.round((targetKg - BAR.barMass - 2 * BAR.collarMass) * 100) / 100

  if (plateTotal <= 0) return []

  const perSide: Record<Side, AutoloadItem[]> = { left: [], right: [] }
  let valid = true

  for (const side of ['left', 'right'] as Side[]) {
    let remaining = plateTotal / 2

    for (const kg of [...PLATE_WEIGHTS].sort((a, b) => b - a)) {
      while (remaining + 0.0001 >= kg) {
        perSide[side].push({ kind: 'plate', side, kg })
        remaining = Math.round((remaining - kg) * 100) / 100
      }
    }

    if (remaining > 0.0001) valid = false
  }

  if (!valid) return []

  const items: AutoloadItem[] = []

  for (let index = 0; index < perSide.left.length; index += 1) {
    items.push(perSide.left[index])
    if (perSide.right[index]) items.push(perSide.right[index])
  }

  items.push({ kind: 'collar', side: 'left' }, { kind: 'collar', side: 'right' })

  return items
}
