import { create } from 'zustand'
import { createPlate, type PlateWeight } from '../objects/createPlate'
import {
  computeAutoload,
  loadedWorldPosition,
  LOADED_ROTATION,
  nextCollarX,
  nextPlateX,
  reflowCollars,
  stockCollarPosition,
  stockPlatePosition,
  stockRotation,
} from '../physics/loadingSpecs'
import { getBarPosition } from '../physics/positions'
import type { LoadedCollar, LoadedPlate, Quat, Side, Vec3 } from '../physics/types'
import { DEFAULT_STATION } from '../scene/stations'

export type GuideCommit = {
  kind: 'plate' | 'collar'
  side: Side
  kg?: PlateWeight
  x?: number
}

export type Drag = {
  id: string
  kind: 'plate' | 'collar'
  kg?: PlateWeight
  from: Vec3
  fromRotation: Quat
  position: Vec3
  side: Side
  targetX: number | null
  snap: boolean
  pointerId: number
  startScreen: [number, number]
  moved: boolean
}

export type Guide = {
  id: string
  kind: 'plate' | 'collar'
  kg?: PlateWeight
  from: Vec3
  fromRotation: Quat
  to: Vec3
  toRotation: Quat
  startedAt: number
  duration: number
  commit: GuideCommit | null
}

type LoadingState = {
  loadedPlates: LoadedPlate[]
  loadedCollars: LoadedCollar[]
  barPosition: Vec3
  drag: Drag | null
  guides: Guide[]
  beginDrag: (input: {
    kind: 'plate' | 'collar'
    kg?: PlateWeight
    side: Side
    from: Vec3
    pointerId: number
    screen: [number, number]
  }) => string
  updateDrag: (input: {
    id: string
    position: Vec3
    side: Side
    targetX: number | null
    snap: boolean
    moved: boolean
  }) => void
  endDrag: (id: string, load: boolean) => void
  completeGuide: (id: string) => void
  unloadPlate: (id: string) => void
  unloadCollar: (id: string) => void
  unloadAll: () => void
  autoLoad: (targetKg: number) => void
  setBarPosition: (position: Vec3) => void
  reset: () => void
}

let idCounter = 0

function nextId(prefix: string) {
  idCounter += 1

  return `${prefix}-${idCounter}`
}

function returnGuide(
  kind: 'plate' | 'collar',
  side: Side,
  kg: PlateWeight | undefined,
  from: Vec3,
  to: Vec3,
  delay: number,
): Guide {
  return {
    id: nextId('guide'),
    kind,
    kg,
    from,
    fromRotation: LOADED_ROTATION,
    to,
    toRotation: stockRotation(side),
    startedAt: performance.now() + delay,
    duration: 520,
    commit: null,
  }
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadedPlates: [],
  loadedCollars: [],
  barPosition: getBarPosition(DEFAULT_STATION),
  drag: null,
  guides: [],

  beginDrag: ({ kind, kg, side, from, pointerId, screen }) => {
    const state = get()
    const targetX =
      kind === 'plate' && kg
        ? nextPlateX(side, state.loadedPlates, kg)
        : nextCollarX(side, state.loadedPlates, state.loadedCollars)
    const id = nextId('drag')

    set({
      drag: {
        id,
        kind,
        kg,
        from,
        fromRotation: stockRotation(side),
        position: [...from],
        side,
        targetX,
        snap: false,
        pointerId,
        startScreen: screen,
        moved: false,
      },
    })

    return id
  },

  updateDrag: ({ id, position, side, targetX, snap, moved }) => {
    set((state) => {
      if (!state.drag || state.drag.id !== id) return state

      return { drag: { ...state.drag, position, side, targetX, snap, moved } }
    })
  },

  endDrag: (id, load) => {
    set((state) => {
      const drag = state.drag

      if (!drag || drag.id !== id) return state

      const commit: GuideCommit | null =
        load && drag.targetX !== null && Number.isFinite(drag.targetX)
          ? { kind: drag.kind, side: drag.side, kg: drag.kg, x: drag.targetX }
          : null

      return {
        drag: null,
        guides: [
          ...state.guides,
          {
            id: nextId('guide'),
            kind: drag.kind,
            kg: drag.kg,
            from: drag.position,
            fromRotation: drag.fromRotation,
            to: commit ? loadedWorldPosition(drag.targetX ?? 0, state.barPosition) : drag.from,
            toRotation: commit ? LOADED_ROTATION : drag.fromRotation,
            startedAt: performance.now(),
            duration: commit ? 520 : 360,
            commit,
          },
        ],
      }
    })
  },

  completeGuide: (id) => {
    set((state) => {
      const guide = state.guides.find((entry) => entry.id === id)

      if (!guide) return state

      let loadedPlates = state.loadedPlates
      let loadedCollars = state.loadedCollars

      if (guide.commit?.kind === 'plate' && guide.commit.kg) {
        // Recalculate on completion: another load may have landed while this
        // guide was flying, so the queued x can already be taken.
        const x = nextPlateX(guide.commit.side, loadedPlates, guide.commit.kg)

        if (x !== null) {
          loadedPlates = [
            ...loadedPlates,
            {
              id: nextId('plate'),
              side: guide.commit.side,
              kg: guide.commit.kg,
              x,
              thickness: createPlate(guide.commit.kg).thickness,
            },
          ]
        }
      }

      if (guide.commit?.kind === 'collar') {
        const x = nextCollarX(guide.commit.side, loadedPlates, [])

        if (x !== null) {
          loadedCollars = [...loadedCollars, { id: nextId('collar'), side: guide.commit.side, x }]
        }
      }

      return {
        guides: state.guides.filter((entry) => entry.id !== id),
        loadedPlates,
        loadedCollars: reflowCollars(loadedPlates, loadedCollars),
      }
    })
  },

  unloadPlate: (id) => {
    set((state) => {
      const plate = state.loadedPlates.find((entry) => entry.id === id)

      if (!plate) return state

      const loadedPlates = state.loadedPlates.filter((entry) => entry.id !== id)

      return {
        loadedPlates,
        loadedCollars: reflowCollars(loadedPlates, state.loadedCollars),
        guides: [
          ...state.guides,
          returnGuide(
            'plate',
            plate.side,
            plate.kg,
            loadedWorldPosition(plate.x, state.barPosition),
            stockPlatePosition(plate.kg, plate.side),
            0,
          ),
        ],
      }
    })
  },

  unloadCollar: (id) => {
    set((state) => {
      const collar = state.loadedCollars.find((entry) => entry.id === id)

      if (!collar) return state

      return {
        loadedCollars: state.loadedCollars.filter((entry) => entry.id !== id),
        guides: [
          ...state.guides,
          returnGuide(
            'collar',
            collar.side,
            undefined,
            loadedWorldPosition(collar.x, state.barPosition),
            stockCollarPosition(collar.side),
            0,
          ),
        ],
      }
    })
  },

  unloadAll: () => {
    set((state) => {
      const returns: Guide[] = [
        ...state.loadedPlates.map((plate) =>
          returnGuide(
            'plate',
            plate.side,
            plate.kg,
            loadedWorldPosition(plate.x, state.barPosition),
            stockPlatePosition(plate.kg, plate.side),
            0,
          ),
        ),
        ...state.loadedCollars.map((collar) =>
          returnGuide(
            'collar',
            collar.side,
            undefined,
            loadedWorldPosition(collar.x, state.barPosition),
            stockCollarPosition(collar.side),
            0,
          ),
        ),
      ]

      returns.forEach((guide, index) => {
        guide.startedAt += index * 90
      })

      return { loadedPlates: [], loadedCollars: [], guides: returns }
    })
  },

  autoLoad: (targetKg) => {
    const items = computeAutoload(targetKg)
    const { barPosition } = get()
    const now = performance.now()
    const pendingPlates: LoadedPlate[] = []
    const pendingCollars: LoadedCollar[] = []

    const guides: Guide[] = []

    items.forEach((item, index) => {
      const x =
        item.kind === 'plate' && item.kg
          ? nextPlateX(item.side, pendingPlates, item.kg)
          : nextCollarX(item.side, pendingPlates, pendingCollars)

      // A full sleeve has no slot: never send the ghost to x = 0 (bar center).
      if (x === null) return

      if (item.kind === 'plate' && item.kg) {
        pendingPlates.push({
          id: `pending-${index}`,
          side: item.side,
          kg: item.kg,
          x,
          thickness: createPlate(item.kg).thickness,
        })
      }

      if (item.kind === 'collar') {
        pendingCollars.push({ id: `pending-${index}`, side: item.side, x })
      }

      const from =
        item.kind === 'plate' && item.kg
          ? stockPlatePosition(item.kg, item.side)
          : stockCollarPosition(item.side)

      guides.push({
        id: nextId('guide'),
        kind: item.kind,
        kg: item.kg,
        from,
        fromRotation: stockRotation(item.side),
        to: loadedWorldPosition(x, barPosition),
        toRotation: LOADED_ROTATION,
        startedAt: now + guides.length * 170,
        duration: 620,
        commit: { kind: item.kind, side: item.side, kg: item.kg, x },
      })
    })

    set({ loadedPlates: [], loadedCollars: [], guides })
  },

  setBarPosition: (barPosition) => set({ barPosition }),

  reset: () => set({ loadedPlates: [], loadedCollars: [], drag: null, guides: [] }),
}))
