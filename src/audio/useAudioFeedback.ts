import { useEffect, useState } from 'react'
import { BAR } from '../objects/barbellSpecs'
import { useLoadingStore } from '../state/useLoadingStore'
import {
  playCheer,
  playCollar,
  playCrowd,
  playPlateLoad,
  playUnload,
  setMuted,
  startAmbience,
  unlockAudio,
} from './audioEngine'

export function useAudioFeedback() {
  const [muted, setMutedState] = useState(false)

  useEffect(() => {
    const unlock = () => {
      unlockAudio()
      startAmbience()
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    let recentPlates = 0
    let lastPlateAt = 0
    let cheered = false
    let bigCheered = false

    return useLoadingStore.subscribe((state, previous) => {
      const now = performance.now()

      if (now - lastPlateAt > 1400) {
        recentPlates = 0
        cheered = false
        bigCheered = false
      }

      const oldPlateIds = new Set(previous.loadedPlates.map((plate) => plate.id))
      const newPlateIds = new Set(state.loadedPlates.map((plate) => plate.id))
      const oldCollarIds = new Set(previous.loadedCollars.map((collar) => collar.id))
      const newCollarIds = new Set(state.loadedCollars.map((collar) => collar.id))

      const addedPlates = state.loadedPlates.filter((plate) => !oldPlateIds.has(plate.id))
      const addedCollars = state.loadedCollars.filter((collar) => !oldCollarIds.has(collar.id))
      const removedPlates = previous.loadedPlates.filter((plate) => !newPlateIds.has(plate.id))
      const removedCollars = previous.loadedCollars.filter((collar) => !newCollarIds.has(collar.id))

      addedPlates.forEach((plate, index) => playPlateLoad(plate.kg, index * 0.018))
      addedCollars.forEach((_, index) => playCollar(index * 0.02))

      if (addedPlates.length > 0) {
        recentPlates += addedPlates.length
        lastPlateAt = now

        // Presets land several discs in a row: one crowd swell per burst.
        if (recentPlates >= 3 && !cheered) {
          playCrowd()
          cheered = true
        }

        const total =
          BAR.barMass +
          state.loadedPlates.reduce((sum, plate) => sum + plate.kg, 0) +
          state.loadedCollars.length * BAR.collarMass

        if (total >= 200 && !bigCheered) {
          playCheer(1.15)
          bigCheered = true
        }
      }

      if (removedPlates.length > 0 || removedCollars.length > 0) playUnload()
    })
  }, [])

  const toggleMuted = () => {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  return { muted, toggleMuted }
}
