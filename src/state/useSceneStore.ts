import { create } from 'zustand'
import { DEFAULT_STATION, type StationId } from '../scene/stations'

type SceneState = {
  activeStation: StationId
  cameraResetToken: number
  physicsResetToken: number
  setStation: (id: StationId) => void
  resetCamera: () => void
  resetPhysics: () => void
}

export const useSceneStore = create<SceneState>((set) => ({
  activeStation: DEFAULT_STATION,
  cameraResetToken: 0,
  physicsResetToken: 0,
  setStation: (id) => set({ activeStation: id }),
  resetCamera: () => set((state) => ({ cameraResetToken: state.cameraResetToken + 1 })),
  resetPhysics: () => set((state) => ({ physicsResetToken: state.physicsResetToken + 1 })),
}))
