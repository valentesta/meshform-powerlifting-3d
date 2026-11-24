import { CuboidCollider } from '@react-three/rapier'
import { BAR } from './barbellSpecs'
import { PLATFORM_HEIGHT } from '../scene/dimensions'

type DeadliftSupportsProps = {
  barY: number
}

const SUPPORT_X = 0.86

export default function DeadliftSupports({ barY }: DeadliftSupportsProps) {
  const height = barY - BAR.sleeveRadius - PLATFORM_HEIGHT

  return (
    <group>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh
            position={[side * SUPPORT_X, PLATFORM_HEIGHT + height / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.1, height, 0.16]} />
            <meshStandardMaterial color="#1b2230" metalness={0.55} roughness={0.55} />
          </mesh>
          <mesh
            position={[side * SUPPORT_X, PLATFORM_HEIGHT + height + 0.004, 0]}
            castShadow
          >
            <boxGeometry args={[0.12, 0.012, 0.18]} />
            <meshStandardMaterial color="#0f141c" roughness={1} />
          </mesh>
          <CuboidCollider
            args={[0.05, height / 2, 0.08]}
            position={[side * SUPPORT_X, PLATFORM_HEIGHT + height / 2, 0]}
            friction={1}
          />
        </group>
      ))}
    </group>
  )
}
