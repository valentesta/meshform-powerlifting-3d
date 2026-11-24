import { CuboidCollider } from '@react-three/rapier'

type JCupProps = {
  x: number
  y: number
  z: number
  uprightX: number
  uprightZ: number
  side: -1 | 1
}

const STEEL = '#aab6c6'
const LINER = '#171d27'

// Competition J-cup: a bolt-on plate, a forward arm and a lined U cradle.
// The arm comes from the upright behind the bar, so the bar never passes
// through the steel post and the plates can load outside the hook.
export default function JCup({ x, y, z, uprightX, uprightZ, side }: JCupProps) {
  const dx = x - uprightX
  const dz = z - uprightZ
  const armLength = Math.hypot(dx, dz)
  const armAngle = Math.atan2(dx, dz)

  return (
    <group>
      <mesh position={[uprightX - side * 0.047, y - 0.02, uprightZ + 0.04]} castShadow>
        <boxGeometry args={[0.025, 0.16, 0.11]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.3} />
      </mesh>

      <mesh
        position={[(uprightX + x) / 2, y - 0.035, (uprightZ + z) / 2]}
        rotation={[0, armAngle, 0]}
        castShadow
      >
        <boxGeometry args={[0.06, 0.03, armLength + 0.08]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.3} />
      </mesh>

      <mesh position={[x, y - 0.042, z]} castShadow>
        <boxGeometry args={[0.1, 0.016, 0.13]} />
        <meshStandardMaterial color={LINER} roughness={0.9} />
      </mesh>

      {[-1, 1].map((front) => (
        <mesh
          key={front}
          position={[x, y - 0.013, z + front * 0.058]}
          rotation={[front * 0.35, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.045, 0.014]} />
          <meshStandardMaterial color={LINER} roughness={0.9} />
        </mesh>
      ))}

      {/* The shaft rests on this collider at the cradle. Low side walls form
          the U of the hook so a heavy bar cannot roll out during loading. */}
      <CuboidCollider args={[0.07, 0.02, 0.065]} position={[x, y, z]} friction={1} />
      {[-1, 1].map((front) => (
        <CuboidCollider
          key={front}
          args={[0.05, 0.045, 0.012]}
          position={[x, y + 0.02, z + front * 0.072]}
          friction={1}
        />
      ))}
    </group>
  )
}
