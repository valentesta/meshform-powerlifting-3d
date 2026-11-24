export const PLATFORM_SIZE = 3.2
export const PLATFORM_HEIGHT = 0.06

// Wide competition deck: a central lifting area plus lower loader wings.
// The full assembly is ~5.2 m wide, close to the Eleiko IPF platform.
export const LOADER_WING_WIDTH = 1.35
export const LOADER_WING_HEIGHT = 0.025
export const LOADER_WING_DEPTH = 2.6

// Competition plate trees stand on the floor at each side of the platform,
// running front-to-back in a straight line. The pegs point inward, toward the
// bar, so the discs are seen in profile from the audience camera.
export const RACK_CENTER_X = 2.75
export const RACK_CENTER_Z = 0.15
export const RACK_YAW: Record<'left' | 'right', number> = {
  left: Math.PI / 2,
  right: -Math.PI / 2,
}
// Real competition trees keep the full-size discs on the low pegs and the
// small change plates on a separate high row. A single row made the 450 mm
// discs overlap the 210 mm ones. Each row has one peg per denomination.
export const RACK_BIG_SPACING = 0.5
export const RACK_SMALL_SPACING = 0.28
export const RACK_BIG_CENTER_Y = 0.32
export const RACK_SMALL_CENTER_Y = 0.92
export const RACK_COLLAR_X = 1.22
export const RACK_COLLAR_Y = 0.92
export const RACK_DEPTH = 0.42
export const RACK_HALF_WIDTH = 1.3
export const RACK_HEIGHT = 1.12
