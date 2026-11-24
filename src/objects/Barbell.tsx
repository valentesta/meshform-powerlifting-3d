import { useMemo, useRef } from 'react'
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from '@react-three/rapier'
import type { ThreeEvent } from '@react-three/fiber'
import { Vector2 } from 'three'
import { BAR, BAR_COLLIDER_DENSITY } from './barbellSpecs'
import { createPlate } from './createPlate'
import CollarVisual from './CollarVisual'
import { getKnurlTexture } from './knurling'
import PlateVisual from './PlateVisual'
import { COLLAR_RADIUS, COLLAR_THICKNESS } from '../physics/loadingSpecs'
import type { LoadedCollar, LoadedPlate, Vec3 } from '../physics/types'

type BarbellProps = {
  position: Vec3
  plates: LoadedPlate[]
  collars: LoadedCollar[]
  onUnloadPlate: (id: string) => void
  onUnloadCollar: (id: string) => void
}

// IPF diagram: 120 mm centre knurl and two 160 mm grip zones ending at ±405 mm.
const KNURL_BANDS = [
  { x: 0, length: 0.12 },
  { x: -0.325, length: 0.16 },
  { x: 0.325, length: 0.16 },
]

const SHAFT_END = BAR.shaftLength / 2
const SHOULDER_LENGTH = 0.035

function KnurlBand({ x, length }: { x: number; length: number }) {
  const texture = useMemo(() => getKnurlTexture(), [])
  const scale = useMemo(() => new Vector2(0.6, 0.6), [])

  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry
        args={[BAR.shaftRadius + 0.0004, BAR.shaftRadius + 0.0004, length, 32]}
      />
      <meshStandardMaterial
        color="#aab6c7"
        metalness={0.85}
        roughness={0.5}
        normalMap={texture}
        normalScale={scale}
      />
    </mesh>
  )
}

export default function Barbell({
  position,
  plates,
  collars,
  onUnloadPlate,
  onUnloadCollar,
}: BarbellProps) {
  const body = useRef<RapierRigidBody>(null)
  const rest = useMemo(() => ({ x: position[0], z: position[2] }), [position])

  // A loaded bar must stay over the J-cups. Each new plate changes the mass
  // properties and gives the body a small kick, so a soft spring pulls only
  // horizontally back to the rack column while gravity and contacts still
  // work normally. Vertical movement, tilt and impacts stay fully physical.
  useBeforePhysicsStep(() => {
    const rigidBody = body.current
    if (!rigidBody) return

    const translation = rigidBody.translation()
    const velocity = rigidBody.linvel()
    const dx = translation.x - rest.x
    const dz = translation.z - rest.z

    if (Math.abs(dx) + Math.abs(dz) + Math.abs(velocity.x) + Math.abs(velocity.z) > 0.001) {
      const mass = rigidBody.mass()
      const dt = 1 / 120
      const impulseX = (-12 * dx - 5 * velocity.x) * mass * dt
      const impulseZ = (-12 * dz - 5 * velocity.z) * mass * dt

      rigidBody.applyImpulse({ x: impulseX, y: 0, z: impulseZ }, true)
    }

    const spin = rigidBody.angvel()
    rigidBody.setAngvel({ x: spin.x * 0.97, y: spin.y * 0.94, z: spin.z * 0.97 }, true)
  })

  const handlePlateClick = (event: ThreeEvent<MouseEvent>, id: string) => {
    event.stopPropagation()
    onUnloadPlate(id)
  }

  const handleCollarClick = (event: ThreeEvent<MouseEvent>, id: string) => {
    event.stopPropagation()
    onUnloadCollar(id)
  }

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={position}
      ccd
      friction={0.8}
      restitution={0.08}
      linearDamping={0.9}
      angularDamping={1.5}
    >
      <CuboidCollider
        args={[BAR.shaftLength / 2, BAR.shaftRadius, BAR.shaftRadius]}
        density={BAR_COLLIDER_DENSITY}
      />
      <CuboidCollider
        args={[BAR.sleeveLength / 2, BAR.sleeveRadius, BAR.sleeveRadius]}
        position={[BAR.sleeveCenter, 0, 0]}
        density={BAR_COLLIDER_DENSITY}
      />
      <CuboidCollider
        args={[BAR.sleeveLength / 2, BAR.sleeveRadius, BAR.sleeveRadius]}
        position={[-BAR.sleeveCenter, 0, 0]}
        density={BAR_COLLIDER_DENSITY}
      />

      {plates.map((plate) => {
        const spec = createPlate(plate.kg)

        return (
          <group
            key={plate.id}
            position={[plate.x, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            onClick={(event) => handlePlateClick(event, plate.id)}
          >
            <CylinderCollider
              args={[plate.thickness / 2, spec.radius]}
              mass={plate.kg}
              friction={0.75}
              restitution={0.1}
            />
            <PlateVisual kg={plate.kg} />
          </group>
        )
      })}

      {collars.map((collar) => (
        <group
          key={collar.id}
          position={[collar.x, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          onClick={(event) => handleCollarClick(event, collar.id)}
        >
          <CylinderCollider
            args={[COLLAR_THICKNESS / 2, COLLAR_RADIUS]}
            mass={BAR.collarMass}
            friction={0.7}
            restitution={0.1}
          />
          <CollarVisual />
        </group>
      ))}

      {/* Polished shaft with the three knurl zones of an IPF competition bar. */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[BAR.shaftRadius, BAR.shaftRadius, BAR.shaftLength, 32]} />
        <meshStandardMaterial color="#b9c5d6" metalness={0.95} roughness={0.22} />
      </mesh>
      {KNURL_BANDS.map((band) => (
        <KnurlBand key={band.x} x={band.x} length={band.length} />
      ))}

      {/* Shoulder transition from the 28 mm shaft to the 50 mm sleeve. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * (SHAFT_END - SHOULDER_LENGTH / 2), 0, 0]}
            rotation={[0, 0, (-side * Math.PI) / 2]}
            castShadow
          >
            <cylinderGeometry
              args={[
                BAR.sleeveRadius,
                BAR.shaftRadius,
                SHOULDER_LENGTH,
                32,
              ]}
            />
            <meshStandardMaterial color="#b9c5d6" metalness={0.95} roughness={0.24} />
          </mesh>

          <mesh
            position={[side * BAR.sleeveCenter, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry
              args={[BAR.sleeveRadius, BAR.sleeveRadius, BAR.sleeveLength, 32]}
            />
            <meshStandardMaterial color="#d4dde9" metalness={0.98} roughness={0.16} />
          </mesh>

          {/* Sleeve grooves mark the collar seating area. */}
          {[0.045, 0.075].map((offset) => (
            <mesh
              key={offset}
              position={[side * (SHAFT_END + offset), 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <torusGeometry args={[BAR.sleeveRadius, 0.0012, 6, 32]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}

          {/* End cap and a subtle brand ring. */}
          <mesh
            position={[side * (BAR.totalLength / 2 - 0.004), 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[BAR.sleeveRadius, BAR.sleeveRadius, 0.008, 32]} />
            <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {[-BAR.gripMarkingOffset, BAR.gripMarkingOffset].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[BAR.shaftRadius + 0.0006, 0.0009, 6, 24]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </RigidBody>
  )
}
