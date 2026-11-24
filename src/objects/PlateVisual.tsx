import { useMemo } from 'react'
import { DoubleSide } from 'three'
import { createPlate, type PlateWeight } from './createPlate'
import { getPlateFaceTexture } from './plateTexture'

type PlateVisualProps = {
  kg: PlateWeight
  opacity?: number
  highlight?: boolean
}

export default function PlateVisual({ kg, opacity = 1, highlight = false }: PlateVisualProps) {
  const spec = useMemo(() => createPlate(kg), [kg])
  const faceTexture = useMemo(
    () => getPlateFaceTexture(kg, spec.color),
    [kg, spec.color],
  )
  const transparent = opacity < 1

  return (
    <group>
      <mesh castShadow={!transparent} receiveShadow={!transparent}>
        <cylinderGeometry args={[spec.radius, spec.radius, spec.thickness, 80]} />
        <meshStandardMaterial
          color={spec.color}
          metalness={0.28}
          roughness={0.38}
          emissive={highlight ? '#38bdf8' : '#000000'}
          emissiveIntensity={highlight ? 0.35 : 0}
          transparent={transparent}
          opacity={opacity}
          depthWrite={!transparent}
        />
      </mesh>

      {/* Machined outer edge and a thin decorative ring on the face. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[spec.radius - 0.003, 0.005, 8, 96]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.7}
          roughness={0.35}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[0, (side * spec.thickness) / 2 + side * 0.0008, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[spec.radius * 0.78, 0.0025, 6, 80]} />
            <meshStandardMaterial
              color="#64748b"
              metalness={0.8}
              roughness={0.35}
              transparent={transparent}
              opacity={opacity}
            />
          </mesh>

          <mesh
            position={[0, (side * spec.thickness) / 2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[spec.holeRadius + 0.012, 0.006, 8, 40]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.95}
              roughness={0.2}
              transparent={transparent}
              opacity={opacity}
            />
          </mesh>

          <mesh
            position={[0, (side * spec.thickness) / 2 + side * 0.0015, 0]}
            rotation={[side === 1 ? -Math.PI / 2 : Math.PI / 2, 0, 0]}
            scale={[side === -1 ? -1 : 1, 1, 1]}
          >
            <planeGeometry args={[spec.radius * 1.72, spec.radius * 1.72]} />
            <meshBasicMaterial
              map={faceTexture}
              transparent
              opacity={opacity}
              depthWrite={false}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
