import { PLATFORM_HEIGHT } from '../scene/dimensions'

type RackUprightProps = {
  x: number
  z: number
  height: number
  accent?: string
}

const STEEL = '#242c39'
const EDGE = '#3c4759'

export default function RackUpright({ x, z, height, accent }: RackUprightProps) {
  const baseY = PLATFORM_HEIGHT
  const holeCount = Math.floor((height - 0.2) / 0.05)

  return (
    <group>
      <mesh position={[x, baseY + height / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[0.075, height, 0.075]} />
        <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.45} />
      </mesh>

      <mesh position={[x, baseY + height, z]} castShadow>
        <boxGeometry args={[0.077, 0.01, 0.077]} />
        <meshStandardMaterial color={EDGE} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Height adjustment holes on the inner face. */}
      {Array.from({ length: holeCount }, (_, index) => {
        const y = baseY + 0.18 + index * 0.05

        return (
          <mesh key={index} position={[x - Math.sign(x) * 0.039, y, z]}>
            <boxGeometry args={[0.003, 0.014, 0.014]} />
            <meshStandardMaterial color="#0d121a" roughness={1} />
          </mesh>
        )
      })}

      <mesh position={[x, baseY + 0.018, z]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.036, 0.34]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.5} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[x, baseY + 0.038, z + side * 0.12]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.012, 0.012, 0.006, 12]} />
          <meshStandardMaterial color={EDGE} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {accent && (
        <mesh position={[x, baseY + height - 0.09, z]} castShadow>
          <boxGeometry args={[0.078, 0.035, 0.078]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      )}
    </group>
  )
}
