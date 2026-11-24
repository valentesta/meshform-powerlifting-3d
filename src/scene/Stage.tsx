import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { getPlateLabelTexture } from '../objects/plateTexture'
import {
  LOADER_WING_DEPTH,
  LOADER_WING_HEIGHT,
  LOADER_WING_WIDTH,
  PLATFORM_HEIGHT,
  PLATFORM_SIZE,
} from './dimensions'
import { STATIONS } from './stations'

export default function Stage() {
  const brandTexture = useMemo(() => getPlateLabelTexture(), [])

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[12, 0.1, 8]} position={[0, -0.1, 0]} friction={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial color="#10141a" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Single competition platform: low, flat and carpeted (IPF 2.5-4 m, <= 10 cm). */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[PLATFORM_SIZE / 2, PLATFORM_HEIGHT / 2, PLATFORM_SIZE / 2]}
          position={[0, PLATFORM_HEIGHT / 2, 0]}
          friction={0.9}
        />
        <mesh position={[0, PLATFORM_HEIGHT / 2 - 0.003, 0]} receiveShadow castShadow>
          <boxGeometry args={[PLATFORM_SIZE, PLATFORM_HEIGHT, PLATFORM_SIZE]} />
          <meshStandardMaterial color="#171d25" roughness={0.85} />
        </mesh>

        {/* Textile surface with faint weave lines. */}
        <mesh position={[0, PLATFORM_HEIGHT + 0.003, 0]} receiveShadow>
          <boxGeometry args={[PLATFORM_SIZE - 0.04, 0.006, PLATFORM_SIZE - 0.04]} />
          <meshStandardMaterial color="#252c36" roughness={1} />
        </mesh>
        {Array.from({ length: 11 }, (_, index) => {
          const offset = (index - 5) * (PLATFORM_SIZE - 0.2) / 10

          return (
            <mesh key={offset} position={[offset, PLATFORM_HEIGHT + 0.007, 0]}>
              <boxGeometry args={[0.004, 0.002, PLATFORM_SIZE - 0.12]} />
              <meshStandardMaterial color="#303946" roughness={1} transparent opacity={0.55} />
            </mesh>
          )
        })}

        {/* Side trim and the competition mark on the front edge. */}
        <mesh position={[0, PLATFORM_HEIGHT / 2, PLATFORM_SIZE / 2 + 0.011]}>
          <boxGeometry args={[PLATFORM_SIZE, 0.035, 0.02]} />
          <meshStandardMaterial
            color={STATIONS.deadlift.accent}
            emissive={STATIONS.deadlift.accent}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, PLATFORM_HEIGHT + 0.008, 0]}>
          <boxGeometry args={[1.25, 0.004, 0.018]} />
          <meshStandardMaterial color="#c9d1dc" roughness={0.9} transparent opacity={0.7} />
        </mesh>
        <mesh
          position={[-0.9, PLATFORM_HEIGHT + 0.009, 1.12]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.9, 0.22]} />
          <meshBasicMaterial
            map={brandTexture}
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>
      </RigidBody>

      {/* Lower rubber loader wings under the plate racks. Visual only: the stock is static. */}
      {([-1, 1] as const).map((side) => (
        <group
          key={side}
          position={[
            side * (PLATFORM_SIZE / 2 + LOADER_WING_WIDTH / 2),
            LOADER_WING_HEIGHT / 2,
            0,
          ]}
        >
          <mesh receiveShadow>
            <boxGeometry args={[LOADER_WING_WIDTH, LOADER_WING_HEIGHT, LOADER_WING_DEPTH]} />
            <meshStandardMaterial color="#121820" roughness={1} />
          </mesh>
          {Array.from({ length: 5 }, (_, index) => {
            const offset = (index - 2) * (LOADER_WING_WIDTH - 0.12) / 4

            return (
              <mesh key={offset} position={[offset, LOADER_WING_HEIGHT / 2 + 0.002, 0]}>
                <boxGeometry args={[0.006, 0.003, LOADER_WING_DEPTH - 0.08]} />
                <meshStandardMaterial color="#1d2632" roughness={1} />
              </mesh>
            )
          })}
          <mesh
            position={[-side * (LOADER_WING_WIDTH / 2 - 0.02), LOADER_WING_HEIGHT / 2, 0]}
          >
            <boxGeometry args={[0.012, 0.006, LOADER_WING_DEPTH - 0.1]} />
            <meshStandardMaterial color="#8a94a4" roughness={0.8} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  )
}
