type CollarVisualProps = {
  opacity?: number
  highlight?: boolean
}

export default function CollarVisual({ opacity = 1, highlight = false }: CollarVisualProps) {
  const transparent = opacity < 1

  return (
    <group>
      <mesh castShadow={!transparent} receiveShadow={!transparent}>
        <cylinderGeometry args={[0.033, 0.033, 0.06, 32]} />
        <meshStandardMaterial
          color="#9aa8bb"
          metalness={0.95}
          roughness={0.22}
          emissive={highlight ? '#38bdf8' : '#000000'}
          emissiveIntensity={highlight ? 0.4 : 0}
          transparent={transparent}
          opacity={opacity}
          depthWrite={!transparent}
        />
      </mesh>

      {/* Knurled tightening band. */}
      <mesh position={[0, 0.012, 0]} castShadow={!transparent}>
        <cylinderGeometry args={[0.034, 0.034, 0.016, 32]} />
        <meshStandardMaterial
          color="#c4cedb"
          metalness={0.95}
          roughness={0.45}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Lever arm with rubber grip, the standard IPF spring collar. */}
      <mesh position={[0.05, 0.012, 0]} castShadow={!transparent}>
        <boxGeometry args={[0.045, 0.012, 0.018]} />
        <meshStandardMaterial
          color="#8795a9"
          metalness={0.9}
          roughness={0.28}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0.077, 0.012, 0]} castShadow={!transparent}>
        <boxGeometry args={[0.022, 0.016, 0.022]} />
        <meshStandardMaterial
          color="#161c26"
          metalness={0.2}
          roughness={0.85}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0.033, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.028, 16]} />
        <meshStandardMaterial
          color="#5f6d80"
          metalness={0.9}
          roughness={0.3}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  )
}
