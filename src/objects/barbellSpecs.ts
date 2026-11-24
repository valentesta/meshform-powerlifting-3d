const shaftLength = 1.31
const sleeveLength = 0.445

export const BAR = {
  totalLength: 2.2,
  barMass: 20,
  collarMass: 2.5,
  shaftLength,
  shaftRadius: 0.014,
  sleeveLength,
  sleeveRadius: 0.025,
  sleeveCenter: shaftLength / 2 + sleeveLength / 2,
  gripMarkingOffset: 0.405,
} as const

const shaftVolume = BAR.shaftLength * (BAR.shaftRadius * 2) ** 2
const sleeveVolume = BAR.sleeveLength * (BAR.sleeveRadius * 2) ** 2

// The three cuboid colliders together add up to the real 20 kg bar mass.
export const BAR_COLLIDER_DENSITY = BAR.barMass / (shaftVolume + 2 * sleeveVolume)
