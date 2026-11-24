import { BAR } from './barbellSpecs'
import JCup from './JCup'
import RackUpright from './RackUpright'
import { PLATFORM_HEIGHT } from '../scene/dimensions'
import { MODEL_PATHS, USE_GLB_MODELS } from '../scene/modelAssets'
import GlbModel from './GlbModel'

type ComboRackProps = {
  barY: number
  accent: string
  mode: 'squat' | 'bench'
}

const CHARCOAL = '#222932'
const STEEL = '#2d3644'
const CHROME = '#aebac9'
const WEBBING = '#121820'

// The uprights sit behind the bar, the hooks reach forward to the shaft.
// This is the layout of an IPF combo rack: no steel crosses the bar path.
const UPRIGHT_X = 0.82
const UPRIGHT_Z = -0.42
const CUP_X = 0.62
const UPRIGHT_HEIGHT = 2.05

const PAD_TOP = 0.43
const PAD_THICKNESS = 0.09
const PAD_LENGTH = 1.24
const PAD_WIDTH = 0.31
const PAD_CENTER_Z = 0.06

function SquatStraps() {
  return (
    <group>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          {/* Two hanging webbing straps behind the lifter, not steel arms. */}
          {[-0.055, 0.055].map((offset) => (
            <mesh
              key={offset}
              position={[side * UPRIGHT_X + offset, PLATFORM_HEIGHT + 0.82, -0.29]}
              castShadow
            >
              <boxGeometry args={[0.035, 1.0, 0.012]} />
              <meshStandardMaterial color={WEBBING} roughness={1} />
            </mesh>
          ))}
          <mesh
            position={[side * UPRIGHT_X, PLATFORM_HEIGHT + 0.34, -0.02]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, 0.54, 0.012]} />
            <meshStandardMaterial color={WEBBING} roughness={1} />
          </mesh>
          <mesh position={[side * UPRIGHT_X, PLATFORM_HEIGHT + 1.34, -0.29]} castShadow>
            <boxGeometry args={[0.15, 0.05, 0.06]} />
            <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function BenchSafetyArms() {
  return (
    <group>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh position={[side * (UPRIGHT_X - 0.055), PLATFORM_HEIGHT + 0.76, UPRIGHT_Z + 0.05]} castShadow>
            <boxGeometry args={[0.03, 0.16, 0.12]} />
            <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[side * 0.7, PLATFORM_HEIGHT + 0.72, 0.04]} castShadow>
            <boxGeometry args={[0.07, 0.05, 1.0]} />
            <meshStandardMaterial color={CHARCOAL} metalness={0.65} roughness={0.45} />
          </mesh>
          <mesh position={[side * 0.7, PLATFORM_HEIGHT + 0.82, 0.5]} castShadow>
            <boxGeometry args={[0.055, 0.22, 0.055]} />
            <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[side * 0.7, PLATFORM_HEIGHT + 0.93, 0.5]}>
            <boxGeometry args={[0.07, 0.02, 0.07]} />
            <meshStandardMaterial color="#e40521" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CompetitionBench() {
  const padBottom = PAD_TOP - PAD_THICKNESS
  const columnBottom = PLATFORM_HEIGHT + 0.06
  const columnHeight = padBottom - columnBottom

  return (
    <group>
      {/* IPF pad: 1240 x 310 mm, top at 430 mm, on a single central pedestal. */}
      <mesh position={[0, PAD_TOP - PAD_THICKNESS / 2, PAD_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[PAD_WIDTH, PAD_THICKNESS, PAD_LENGTH]} />
        <meshStandardMaterial color="#1b222d" roughness={0.95} />
      </mesh>
      <mesh position={[0, PAD_TOP - 0.006, PAD_CENTER_Z]}>
        <boxGeometry args={[PAD_WIDTH - 0.02, 0.008, PAD_LENGTH - 0.04]} />
        <meshStandardMaterial color="#252f3d" roughness={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (PAD_WIDTH / 2 - 0.008), PAD_TOP - PAD_THICKNESS / 2, PAD_CENTER_Z]}
        >
          <boxGeometry args={[0.006, PAD_THICKNESS - 0.012, PAD_LENGTH - 0.05]} />
          <meshStandardMaterial color="#485363" roughness={1} />
        </mesh>
      ))}

      <mesh position={[0, columnBottom + columnHeight / 2, PAD_CENTER_Z]} castShadow>
        <boxGeometry args={[0.13, columnHeight, 0.17]} />
        <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, PLATFORM_HEIGHT + 0.035, PAD_CENTER_Z]} castShadow>
        <boxGeometry args={[0.62, 0.06, 0.56]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.6} roughness={0.5} />
      </mesh>
      {[-1, 1].map((end) => (
        <mesh
          key={end}
          position={[0, PLATFORM_HEIGHT + 0.018, PAD_CENTER_Z + end * (PAD_LENGTH / 2 - 0.1)]}
          castShadow
        >
          <boxGeometry args={[0.16, 0.036, 0.12]} />
          <meshStandardMaterial color="#171d27" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// One competition combo rack: the same uprights hold the bar for squat and
// bench. The bench pad, safety arms and squat straps are the only differences.
export default function ComboRack({ barY, accent, mode }: ComboRackProps) {
  const cupY = barY - BAR.shaftRadius - 0.02
  const isBench = mode === 'bench'

  return (
    <GlbModel
        url={isBench ? MODEL_PATHS.comboRackBench : MODEL_PATHS.comboRackSquat}
        enabled={USE_GLB_MODELS}
      >
      <group>
        {([-1, 1] as const).map((side) => (
          <group key={side}>
            <RackUpright
              x={side * UPRIGHT_X}
              z={UPRIGHT_Z}
              height={UPRIGHT_HEIGHT}
              accent={accent}
            />
  
            {/* Stabiliser feet run forward and back from each upright. */}
            <mesh
              position={[side * UPRIGHT_X, PLATFORM_HEIGHT + 0.025, UPRIGHT_Z + 0.3]}
              castShadow
            >
              <boxGeometry args={[0.1, 0.05, 1.0]} />
              <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.45} />
            </mesh>
            {[UPRIGHT_Z - 0.18, 0.28].map((z) => (
              <mesh key={z} position={[side * UPRIGHT_X, PLATFORM_HEIGHT + 0.014, z]} castShadow>
                <boxGeometry args={[0.16, 0.028, 0.12]} />
                <meshStandardMaterial color="#171d27" roughness={0.9} />
              </mesh>
            ))}
  
            <JCup
              x={side * CUP_X}
              y={cupY}
              z={0}
              side={side}
              uprightX={side * UPRIGHT_X}
              uprightZ={UPRIGHT_Z}
            />
          </group>
        ))}
  
        {/* Rear crossmembers keep the pair rigid without crossing the bar path. */}
        {[PLATFORM_HEIGHT + UPRIGHT_HEIGHT - 0.14, PLATFORM_HEIGHT + 0.55].map((y) => (
          <mesh key={y} position={[0, y, UPRIGHT_Z]} castShadow>
            <boxGeometry args={[UPRIGHT_X * 2, 0.06, 0.07]} />
            <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.45} />
          </mesh>
        ))}
  
        {isBench ? (
          <group>
            <BenchSafetyArms />
            <CompetitionBench />
          </group>
        ) : (
          <SquatStraps />
        )}
      </group>
    </GlbModel>
  )
}
