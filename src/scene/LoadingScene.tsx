import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Plane, Quaternion, Raycaster, Vector2, Vector3, type Group } from 'three'
import Barbell from '../objects/Barbell'
import CollarVisual from '../objects/CollarVisual'
import PlateRack from '../objects/PlateRack'
import PlateVisual from '../objects/PlateVisual'
import { PLATE_WEIGHTS, type PlateWeight } from '../objects/createPlate'
import {
  getBarPosition,
  stockCollarPosition,
  stockPlatePosition,
  stockRotation,
} from '../physics/positions'
import {
  LOADED_ROTATION,
  nextCollarX,
  nextPlateX,
} from '../physics/loadingSpecs'
import { setCameraLocked } from '../physics/interaction'
import type { Side, Vec3 } from '../physics/types'
import { useLoadingStore, type Guide } from '../state/useLoadingStore'
import { useSceneStore } from '../state/useSceneStore'

const SIDES: Side[] = ['left', 'right']

function GuideGhost({ guide }: { guide: Guide }) {
  const group = useRef<Group>(null)
  const finished = useRef(false)
  const completeGuide = useLoadingStore((state) => state.completeGuide)
  const from = useMemo(() => new Vector3(...guide.from), [guide.from])
  const to = useMemo(() => new Vector3(...guide.to), [guide.to])
  const fromRotation = useMemo(() => new Quaternion(...guide.fromRotation), [guide.fromRotation])
  const toRotation = useMemo(() => new Quaternion(...guide.toRotation), [guide.toRotation])

  useFrame(() => {
    if (!group.current) return

    const progress = Math.min(
      1,
      Math.max(0, (performance.now() - guide.startedAt) / guide.duration),
    )
    const eased = 1 - (1 - progress) ** 3

    group.current.position.lerpVectors(from, to, eased)
    group.current.quaternion.slerpQuaternions(fromRotation, toRotation, eased)

    if (progress >= 1 && !finished.current) {
      finished.current = true
      completeGuide(guide.id)
    }
  })

  return (
    <group ref={group} position={guide.from} quaternion={guide.fromRotation}>
      {guide.kind === 'plate' && guide.kg ? (
        <PlateVisual kg={guide.kg} opacity={0.8} highlight />
      ) : (
        <CollarVisual opacity={0.8} highlight />
      )}
    </group>
  )
}

export default function LoadingScene() {
  const { camera, gl } = useThree()
  const activeStation = useSceneStore((state) => state.activeStation)
  const physicsResetToken = useSceneStore((state) => state.physicsResetToken)
  const barPosition = useMemo(() => getBarPosition(activeStation), [activeStation])

  const reset = useLoadingStore((state) => state.reset)
  const setBarPosition = useLoadingStore((state) => state.setBarPosition)
  const beginDrag = useLoadingStore((state) => state.beginDrag)
  const loadedPlates = useLoadingStore((state) => state.loadedPlates)
  const loadedCollars = useLoadingStore((state) => state.loadedCollars)
  const drag = useLoadingStore((state) => state.drag)
  const guides = useLoadingStore((state) => state.guides)
  const unloadPlate = useLoadingStore((state) => state.unloadPlate)
  const unloadCollar = useLoadingStore((state) => state.unloadCollar)

  useEffect(() => {
    reset()
  }, [physicsResetToken, reset])

  useEffect(() => {
    setBarPosition(barPosition)
  }, [barPosition, setBarPosition])

  const startDrag = (
    event: ThreeEvent<PointerEvent>,
    kind: 'plate' | 'collar',
    side: Side,
    from: Vec3,
    kg?: PlateWeight,
  ) => {
    event.stopPropagation()

    beginDrag({
      kind,
      kg,
      side,
      from,
      pointerId: event.pointerId,
      screen: [event.clientX, event.clientY],
    })
    setCameraLocked(true)
    gl.domElement.setPointerCapture(event.pointerId)
  }

  useEffect(() => {
    const element = gl.domElement
    const raycaster = new Raycaster()
    const pointer = new Vector2()
    const hit = new Vector3()
    const plane = new Plane(new Vector3(0, 1, 0), -barPosition[1])

    const getPoint = (clientX: number, clientY: number): Vec3 | null => {
      const rect = element.getBoundingClientRect()

      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)

      const intersection = raycaster.ray.intersectPlane(plane, hit)

      if (!intersection) return null

      return [hit.x, hit.y, hit.z]
    }

    const onPointerMove = (event: PointerEvent) => {
      const state = useLoadingStore.getState()
      const current = state.drag

      if (!current || current.pointerId !== event.pointerId) return

      const position = getPoint(event.clientX, event.clientY)
      if (!position) return

      const dx = position[0] - barPosition[0]
      const dz = position[2] - barPosition[2]
      const side = dx >= 0 ? 'right' : 'left'
      const targetX =
        current.kind === 'plate' && current.kg
          ? nextPlateX(side, state.loadedPlates, current.kg)
          : nextCollarX(side, state.loadedPlates, state.loadedCollars)
      const moved =
        current.moved ||
        Math.hypot(
          event.clientX - current.startScreen[0],
          event.clientY - current.startScreen[1],
        ) > 6

      const snap = targetX !== null && Math.abs(dz) < 0.6 && Math.abs(dx) < 1.25

      state.updateDrag({
        id: current.id,
        position,
        side,
        targetX,
        snap,
        moved,
      })
    }

    const onPointerEnd = (event: PointerEvent) => {
      const current = useLoadingStore.getState().drag

      if (!current || current.pointerId !== event.pointerId) return

      useLoadingStore.getState().endDrag(current.id, current.snap || !current.moved)
      setCameraLocked(false)

      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }
    }

    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerEnd)
    element.addEventListener('pointercancel', onPointerEnd)

    return () => {
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerEnd)
      element.removeEventListener('pointercancel', onPointerEnd)
      setCameraLocked(false)
    }
  }, [camera, gl, barPosition])

  return (
    <>
      {SIDES.map((side) => (
        <PlateRack key={side} side={side} />
      ))}

      <Barbell
        key={activeStation}
        position={barPosition}
        plates={loadedPlates}
        collars={loadedCollars}
        onUnloadPlate={unloadPlate}
        onUnloadCollar={unloadCollar}
      />

      {SIDES.flatMap((side) =>
        PLATE_WEIGHTS.map((kg) => {
          const position = stockPlatePosition(kg, side)

          return (
            <group
              key={`${side}-${kg}`}
              position={position}
              quaternion={stockRotation(side)}
              onPointerDown={(event) => startDrag(event, 'plate', side, position, kg)}
            >
              <PlateVisual kg={kg} />
            </group>
          )
        }),
      )}

      {SIDES.map((side) => {
        const position = stockCollarPosition(side)

        return (
          <group
            key={`${side}-collar`}
            position={position}
            quaternion={stockRotation(side)}
            onPointerDown={(event) => startDrag(event, 'collar', side, position)}
          >
            <CollarVisual />
          </group>
        )
      })}

      {drag && (
        <>
          <group position={drag.position} quaternion={drag.fromRotation}>
            {drag.kind === 'plate' && drag.kg ? (
              <PlateVisual kg={drag.kg} opacity={0.75} highlight />
            ) : (
              <CollarVisual opacity={0.75} highlight />
            )}
          </group>

          {drag.snap && drag.targetX !== null && (
            <group
              position={[
                barPosition[0] + drag.targetX,
                barPosition[1],
                barPosition[2],
              ]}
              quaternion={LOADED_ROTATION}
            >
              {drag.kind === 'plate' && drag.kg ? (
                <PlateVisual kg={drag.kg} opacity={0.35} highlight />
              ) : (
                <CollarVisual opacity={0.35} highlight />
              )}
            </group>
          )}
        </>
      )}

      {guides.map((guide) => (
        <GuideGhost key={guide.id} guide={guide} />
      ))}
    </>
  )
}
