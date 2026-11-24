import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
} from 'three'
import { setScreenHovered } from '../physics/interaction'
import { getBrandLogoTexture } from './brandTextures'
import { getResultsPage, getResultsTexture, setResultsPage } from './venueTextures'

type Seat = {
  x: number
  y: number
  z: number
  yaw: number
  scale: number
  shirt: string
  skin: string
  phone: boolean
}

const SHIRTS = ['#1e2735', '#2b3648', '#3a2b35', '#243244', '#482630', '#303b47']
const SKINS = ['#8d6a55', '#b98a6d', '#d2a98a', '#6f5344', '#e0b89a']

function noise(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453

  return value - Math.floor(value)
}

function pick<T>(values: T[], amount: number): T {
  return values[Math.floor(amount * values.length) % values.length]
}

function buildAudience(): Seat[] {
  const seats: Seat[] = []
  let index = 0

  const add = (seat: Omit<Seat, 'shirt' | 'skin' | 'phone'>) => {
    seats.push({
      ...seat,
      shirt: pick(SHIRTS, noise(index, 1)),
      skin: pick(SKINS, noise(index, 2)),
      phone: noise(index, 3) > 0.84,
    })
    index += 1
  }

  // Rear grandstand: the upper rows rise above the LED wall.
  for (let row = 0; row < 8; row += 1) {
    for (let seat = 0; seat < 40; seat += 1) {
      add({
        x: -10.7 + seat * 0.55 + (noise(index, 4) - 0.5) * 0.08,
        y: 0.78 + row * 0.7,
        z: -7 - row * 0.92,
        yaw: 0,
        scale: 0.92 + noise(index, 5) * 0.16,
      })
    }
  }

  // Side stands make the arena feel enclosed from the default camera.
  for (const side of [-1, 1] as const) {
    for (let row = 0; row < 5; row += 1) {
      for (let seat = 0; seat < 20; seat += 1) {
        add({
          x: side * (7.6 + row * 0.82),
          y: 0.7 + row * 0.62,
          z: -5.3 + seat * 0.56 + (noise(index, 6) - 0.5) * 0.08,
          yaw: side === 1 ? -Math.PI / 2 : Math.PI / 2,
          scale: 0.9 + noise(index, 7) * 0.18,
        })
      }
    }
  }

  // Front blocks flank the results wall, like a real arena around the screen.
  for (const side of [-1, 1] as const) {
    for (let row = 0; row < 3; row += 1) {
      for (let seat = 0; seat < 8; seat += 1) {
        add({
          x: side * (6.1 + seat * 0.55) + (noise(index, 8) - 0.5) * 0.08,
          y: 0.55 + row * 0.62,
          z: 3.9 + row * 0.82,
          yaw: Math.PI,
          scale: 0.9 + noise(index, 9) * 0.18,
        })
      }
    }
  }

  return seats
}

function Stands() {
  const tiers = Array.from({ length: 8 }, (_, row) => row)

  return (
    <group>
      {tiers.map((row) => (
        <group key={`rear-${row}`}>
          <mesh position={[0, 0.32 + row * 0.7, -7 - row * 0.92]} receiveShadow>
            <boxGeometry args={[22, 0.66, 0.92]} />
            <meshStandardMaterial color="#111925" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.67 + row * 0.7, -6.53 - row * 0.92]}>
            <boxGeometry args={[22, 0.018, 0.02]} />
            <meshStandardMaterial color="#2b3646" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {([-1, 1] as const).map((side) =>
        tiers.slice(0, 5).map((row) => (
          <mesh
            key={`side-${side}-${row}`}
            position={[side * (7.6 + row * 0.82), 0.3 + row * 0.62, -1.4]}
            receiveShadow
          >
            <boxGeometry args={[0.82, 0.6, 10.6]} />
            <meshStandardMaterial color="#111925" roughness={0.95} />
          </mesh>
        )),
      )}

      {([-1, 1] as const).map((side) =>
        tiers.slice(0, 3).map((row) => (
          <mesh
            key={`front-${side}-${row}`}
            position={[side * 7.95, 0.27 + row * 0.62, 4.3 + row * 0.82]}
            receiveShadow
          >
            <boxGeometry args={[4.5, 0.6, 0.82]} />
            <meshStandardMaterial color="#111925" roughness={0.95} />
          </mesh>
        )),
      )}
    </group>
  )
}

function Audience() {
  const bodiesRef = useRef<InstancedMesh>(null)
  const headsRef = useRef<InstancedMesh>(null)
  const lightsRef = useRef<InstancedMesh>(null)
  const phoneMaterialRef = useRef<MeshBasicMaterial>(null)
  const seats = useMemo(buildAudience, [])
  const phoneSeats = useMemo(() => seats.filter((seat) => seat.phone), [seats])
  const shirtColors = useMemo(() => seats.map((seat) => new Color(seat.shirt)), [seats])
  const skinColors = useMemo(() => seats.map((seat) => new Color(seat.skin)), [seats])

  useFrame(({ clock }) => {
    if (phoneMaterialRef.current) {
      phoneMaterialRef.current.opacity =
        0.72 + Math.sin(clock.elapsedTime * 1.6) * 0.12
    }
  })

  useEffect(() => {
    const dummy = new Object3D()

    seats.forEach((seat, index) => {
      dummy.position.set(seat.x, seat.y, seat.z)
      dummy.rotation.set(0, seat.yaw, 0)
      dummy.scale.setScalar(seat.scale)
      dummy.updateMatrix()
      bodiesRef.current?.setMatrixAt(index, dummy.matrix)
      bodiesRef.current?.setColorAt(index, shirtColors[index])

      dummy.position.set(
        seat.x,
        seat.y + 0.34 * seat.scale,
        seat.z,
      )
      dummy.updateMatrix()
      headsRef.current?.setMatrixAt(index, dummy.matrix)
      headsRef.current?.setColorAt(index, skinColors[index])
    })

    if (bodiesRef.current) {
      bodiesRef.current.instanceMatrix.needsUpdate = true
      if (bodiesRef.current.instanceColor) {
        bodiesRef.current.instanceColor.needsUpdate = true
      }
    }

    if (headsRef.current) {
      headsRef.current.instanceMatrix.needsUpdate = true
      if (headsRef.current.instanceColor) {
        headsRef.current.instanceColor.needsUpdate = true
      }
    }

    phoneSeats.forEach((seat, index) => {
      const forward = 0.13 * seat.scale

      dummy.position.set(
        seat.x + Math.sin(seat.yaw) * forward,
        seat.y + 0.14 * seat.scale,
        seat.z + Math.cos(seat.yaw) * forward,
      )
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(seat.scale)
      dummy.updateMatrix()
      lightsRef.current?.setMatrixAt(index, dummy.matrix)
    })

    if (lightsRef.current) lightsRef.current.instanceMatrix.needsUpdate = true
  }, [seats, phoneSeats, shirtColors, skinColors])

  return (
    <group>
      <Stands />

      <instancedMesh
        ref={bodiesRef}
        args={[undefined, undefined, seats.length]}
        frustumCulled={false}
      >
        <capsuleGeometry args={[0.11, 0.3, 4, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </instancedMesh>

      <instancedMesh
        ref={headsRef}
        args={[undefined, undefined, seats.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.082, 8, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </instancedMesh>

      <instancedMesh
        ref={lightsRef}
        args={[undefined, undefined, phoneSeats.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.038, 6, 4]} />
        <meshBasicMaterial
          ref={phoneMaterialRef}
          color="#fff0c4"
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

function Truss() {
  const fixtures = [-4.4, -2.6, -0.8, 0.8, 2.6, 4.4]

  return (
    <group>
      {[-3.4, 3.2].map((z) => (
        <group key={z}>
          <mesh position={[0, 5.9, z]} castShadow>
            <boxGeometry args={[11.4, 0.09, 0.09]} />
            <meshStandardMaterial color="#242c36" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 5.68, z]}>
            <boxGeometry args={[11.4, 0.025, 0.025]} />
            <meshStandardMaterial color="#394456" metalness={0.8} roughness={0.3} />
          </mesh>
          {fixtures.map((x) => (
            <group key={x} position={[x, 5.55, z]}>
              <mesh>
                <cylinderGeometry args={[0.07, 0.09, 0.22, 10]} />
                <meshStandardMaterial color="#151b23" metalness={0.6} roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.13, 0]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshBasicMaterial
                  color={z < 0 ? '#ffb27a' : '#e8f1ff'}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      <spotLight
        position={[0, 6.2, 3.2]}
        color="#ffd2a1"
        intensity={26}
        angle={0.5}
        penumbra={0.8}
        distance={16}
      />
      <spotLight
        position={[0, 4.6, -4.6]}
        color="#e40521"
        intensity={18}
        angle={0.7}
        penumbra={0.9}
        distance={14}
      />
    </group>
  )
}

export default function Venue() {
  const { gl } = useThree()
  const resultsTexture = useMemo(getResultsTexture, [])
  const hovered = useRef(false)
  const dragStartY = useRef<number | null>(null)
  const lastPageChange = useRef(performance.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      // Slowly page through all 12 finalists per sex, but never fight the user.
      if (hovered.current || document.hidden) return
      if (performance.now() - lastPageChange.current < 8000) return

      setResultsPage(getResultsPage() + 1)
      lastPageChange.current = performance.now()
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => () => {
    setScreenHovered(false)
    gl.domElement.style.cursor = ''
  }, [gl])

  const changePage = (step: number) => {
    if (setResultsPage(getResultsPage() + step)) lastPageChange.current = performance.now()
  }

  return (
    <group>
      {/* The results wall stands in front of the platform, facing the audience
          and the default camera. This matches the venue sketch: public behind
          and on the sides, big screen opposite the lifter. */}
      <group position={[0, 0, 5.2]}>
        <mesh
          position={[0, 3.05, 0]}
          rotation={[0, Math.PI, 0]}
          onPointerOver={() => {
            hovered.current = true
            setScreenHovered(true)
            gl.domElement.style.cursor = 'ns-resize'
          }}
          onPointerOut={() => {
            hovered.current = false
            setScreenHovered(false)
            gl.domElement.style.cursor = ''
          }}
          onWheel={(event) => {
            event.stopPropagation()
            changePage(event.deltaY >= 0 ? 1 : -1)
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
            dragStartY.current = event.clientY
            hovered.current = true
            setScreenHovered(true)
          }}
          onPointerMove={(event) => {
            if (dragStartY.current === null) return
            event.stopPropagation()
            const delta = event.clientY - dragStartY.current

            if (Math.abs(delta) > 55) {
              changePage(delta > 0 ? 1 : -1)
              dragStartY.current = event.clientY
            }
          }}
          onPointerUp={(event) => {
            event.stopPropagation()
            dragStartY.current = null
            if (event.pointerType !== 'mouse') {
              hovered.current = false
              setScreenHovered(false)
            }
          }}
        >
          <planeGeometry args={[10.4, 4.5]} />
          <meshBasicMaterial map={resultsTexture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 3.05, 0.09]}>
          <boxGeometry args={[10.7, 4.8, 0.16]} />
          <meshStandardMaterial color="#0a0d12" metalness={0.4} roughness={0.7} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 5.22, 3.05, 0.02]} castShadow>
            <boxGeometry args={[0.14, 4.95, 0.26]} />
            <meshStandardMaterial color="#1d2532" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.55, 0.02]} castShadow>
          <boxGeometry args={[10.7, 1.1, 0.26]} />
          <meshStandardMaterial color="#121924" metalness={0.5} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.55, -0.13]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.1, 0.525]} />
          <meshBasicMaterial
            map={getBrandLogoTexture()}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 1.14, -0.1]}>
          <boxGeometry args={[10.7, 0.08, 0.3]} />
          <meshStandardMaterial color="#e40521" emissive="#e40521" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <Audience />
      <Truss />
    </group>
  )
}
