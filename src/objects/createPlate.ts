export type PlateWeight = 25 | 20 | 15 | 10 | 5 | 2.5 | 2 | 1.5 | 1 | 0.5

export type PlateSpec = {
  kg: PlateWeight
  diameter: number
  radius: number
  thickness: number
  holeRadius: number
  color: string
  label: string
  fractional: boolean
}

type PlateDefinition = {
  kg: PlateWeight
  diameter: number
  thickness: number
  color: string
}

// IPF calibrated steel discs really do change size with weight. Diameters and
// thicknesses follow the ATX/Eleiko IPF competition spec (25/20 = 450 mm,
// 15 = 400 mm, 10 = 325 mm, 5 = 227 mm); the small change plates shrink further.
// Source checked 2026-11-23: ATX calibrated plates size chart and IPF rules.
const DEFINITIONS: PlateDefinition[] = [
  { kg: 25, diameter: 0.45, thickness: 0.0231, color: '#d1122b' },
  { kg: 20, diameter: 0.45, thickness: 0.0192, color: '#1e4fd8' },
  { kg: 15, diameter: 0.4, thickness: 0.0184, color: '#e3b505' },
  { kg: 10, diameter: 0.325, thickness: 0.0184, color: '#167a3d' },
  { kg: 5, diameter: 0.227, thickness: 0.0188, color: '#dfe3e8' },
  { kg: 2.5, diameter: 0.21, thickness: 0.014, color: '#c9162d' },
  { kg: 2, diameter: 0.195, thickness: 0.012, color: '#1d4bbd' },
  { kg: 1.5, diameter: 0.18, thickness: 0.011, color: '#d9ad12' },
  { kg: 1, diameter: 0.16, thickness: 0.009, color: '#176f39' },
  { kg: 0.5, diameter: 0.135, thickness: 0.007, color: '#d7dce2' },
]

const HOLE_DIAMETER = 0.0525
const MIN_THICKNESS = 0.006

export const PLATE_WEIGHTS: PlateWeight[] = DEFINITIONS.map((definition) => definition.kg)

export function createPlate(kg: PlateWeight): PlateSpec {
  const definition = DEFINITIONS.find((entry) => entry.kg === kg)

  if (!definition) {
    throw new Error(`Unsupported plate weight: ${kg}`)
  }

  return {
    kg: definition.kg,
    diameter: definition.diameter,
    radius: definition.diameter / 2,
    thickness: Math.max(MIN_THICKNESS, definition.thickness),
    holeRadius: HOLE_DIAMETER / 2,
    color: definition.color,
    label: String(definition.kg),
    fractional: definition.kg < 5,
  }
}
