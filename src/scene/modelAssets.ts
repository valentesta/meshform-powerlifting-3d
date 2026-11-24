// FASE 7: optional GLB overrides. The procedural geometry stays the default,
// so the app still works with no binary assets. Drop files in public/models/
// and set VITE_USE_GLB=1 in .env.local to swap a prop for its model.
export const USE_GLB_MODELS = import.meta.env.VITE_USE_GLB === '1'

export const MODEL_PATHS = {
  plateRack: '/models/plate-rack.glb',
  comboRackSquat: '/models/combo-rack-squat.glb',
  comboRackBench: '/models/combo-rack-bench.glb',
} as const

export type ModelKey = keyof typeof MODEL_PATHS
