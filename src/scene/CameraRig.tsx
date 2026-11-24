import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { MathUtils, Spherical, Vector3 } from 'three'
import { useSceneStore } from '../state/useSceneStore'
import { isCameraLocked } from '../physics/interaction'
import { DEFAULT_STATION, STATIONS, type StationId } from './stations'

const MIN_RADIUS = 2.6
const MAX_RADIUS = 10
const MIN_POLAR = MathUtils.degToRad(12)
const MAX_POLAR = MathUtils.degToRad(88)
const DRAG_SENSITIVITY = 0.005

type OrbitState = {
  azimuth: number
  polar: number
  radius: number
}

const initialStation = STATIONS[DEFAULT_STATION]
const initialOffset = new Vector3(...initialStation.camera).sub(
  new Vector3(...initialStation.target),
)
const initialSpherical = new Spherical().setFromVector3(initialOffset)

// Keep the flight short: pick the closest equivalent angle instead of spinning
// around the whole venue when a station is selected after a full orbit.
function shortestAngle(from: number, to: number): number {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))

  return from + delta
}

function getDestination(stationId: StationId, fromAzimuth: number): OrbitState {
  const station = STATIONS[stationId]
  const offset = new Vector3(...station.camera).sub(new Vector3(...station.target))
  const spherical = new Spherical().setFromVector3(offset)

  return {
    azimuth: shortestAngle(fromAzimuth, spherical.theta),
    polar: MathUtils.clamp(spherical.phi, MIN_POLAR, MAX_POLAR),
    radius: MathUtils.clamp(spherical.radius, MIN_RADIUS, MAX_RADIUS),
  }
}

export default function CameraRig() {
  const { camera, gl } = useThree()
  const activeStation = useSceneStore((state) => state.activeStation)
  const cameraResetToken = useSceneStore((state) => state.cameraResetToken)

  const orbit = useRef<OrbitState>({
    azimuth: initialSpherical.theta,
    polar: MathUtils.clamp(initialSpherical.phi, MIN_POLAR, MAX_POLAR),
    radius: MathUtils.clamp(initialSpherical.radius, MIN_RADIUS, MAX_RADIUS),
  })
  const target = useRef(new Vector3(...initialStation.target))
  const tween = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchDistance = useRef(0)
  const spherical = useMemo(() => new Spherical(), [])
  const position = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const station = STATIONS[activeStation]
    const destination = getDestination(activeStation, orbit.current.azimuth)

    tween.current?.kill()
    tween.current = gsap.timeline()
    tween.current.to(orbit.current, { ...destination, duration: 1.4, ease: 'power3.inOut' }, 0)
    tween.current.to(
      target.current,
      {
        x: station.target[0],
        y: station.target[1],
        z: station.target[2],
        duration: 1.4,
        ease: 'power3.inOut',
      },
      0,
    )

    return () => {
      tween.current?.kill()
    }
  }, [activeStation, cameraResetToken])

  useEffect(() => {
    const element = gl.domElement
    const previousTouchAction = element.style.touchAction
    element.style.touchAction = 'none'

    const onPointerDown = (event: PointerEvent) => {
      if (isCameraLocked()) return

      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      element.setPointerCapture(event.pointerId)

      if (pointers.current.size === 2) {
        const [first, second] = [...pointers.current.values()]
        pinchDistance.current = Math.hypot(first.x - second.x, first.y - second.y)
      }

      tween.current?.kill()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (isCameraLocked()) return

      const previous = pointers.current.get(event.pointerId)
      if (!previous) return

      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (pointers.current.size === 2) {
        const [first, second] = [...pointers.current.values()]
        const distance = Math.hypot(first.x - second.x, first.y - second.y)

        if (pinchDistance.current > 0 && distance > 0) {
          orbit.current.radius = MathUtils.clamp(
            orbit.current.radius * (pinchDistance.current / distance),
            MIN_RADIUS,
            MAX_RADIUS,
          )
        }

        pinchDistance.current = distance
        return
      }

      const dx = event.clientX - previous.x
      const dy = event.clientY - previous.y

      // Unbounded azimuth: drag as far as you want, the camera keeps orbiting
      // in a full 360° circle instead of hitting an invisible wall.
      orbit.current.azimuth -= dx * DRAG_SENSITIVITY
      orbit.current.polar = MathUtils.clamp(
        orbit.current.polar - dy * DRAG_SENSITIVITY,
        MIN_POLAR,
        MAX_POLAR,
      )
    }

    const onPointerUp = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId)

      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }

      if (pointers.current.size < 2) pinchDistance.current = 0
    }

    const onWheel = (event: WheelEvent) => {
      if (isCameraLocked()) return

      event.preventDefault()
      tween.current?.kill()
      orbit.current.radius = MathUtils.clamp(
        orbit.current.radius + Math.sign(event.deltaY) * 0.4,
        MIN_RADIUS,
        MAX_RADIUS,
      )
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', onPointerUp)
    element.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      element.style.touchAction = previousTouchAction
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointercancel', onPointerUp)
      element.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  useFrame(() => {
    spherical.set(orbit.current.radius, orbit.current.polar, orbit.current.azimuth)
    position.setFromSpherical(spherical).add(target.current)
    camera.position.copy(position)
    camera.lookAt(target.current)
  })

  return null
}
