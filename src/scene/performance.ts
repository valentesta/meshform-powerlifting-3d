type DeviceNavigator = Navigator & { deviceMemory?: number }

// Cheap heuristic used only to pick render settings. It never hides features:
// on small or low-power devices we lower resolution, shadows and particles.
export function isLowPowerDevice(): boolean {
  if (typeof window === 'undefined') return false

  const narrow = window.matchMedia('(max-width: 767px)').matches
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as DeviceNavigator).deviceMemory ?? 8

  return narrow || cores <= 4 || memory <= 4
}
