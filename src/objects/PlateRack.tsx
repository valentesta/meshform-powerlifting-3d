import { CanvasTexture } from 'three'
import { createPlate, PLATE_WEIGHTS, type PlateWeight } from './createPlate'
import {
  RACK_BIG_SPACING,
  RACK_CENTER_Z,
  RACK_COLLAR_X,
  RACK_COLLAR_Y,
  RACK_DEPTH,
  RACK_HALF_WIDTH,
  RACK_HEIGHT,
  RACK_SMALL_SPACING,
  RACK_YAW,
} from '../scene/dimensions'
import { rackX, rackSlot } from '../physics/positions'
import { MODEL_PATHS, USE_GLB_MODELS } from '../scene/modelAssets'
import type { Side } from '../physics/types'
import GlbModel from './GlbModel'

const STEEL = '#202734'
const EDGE = '#374252'
const CHROME = '#aab7c9'
const RUBBER = '#121821'

const labelCache = new Map<PlateWeight, CanvasTexture>()

function getWeightLabel(kg: PlateWeight): CanvasTexture {
  const cached = labelCache.get(kg)

  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 72
  const context = canvas.getContext('2d')!

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = 'bold 52px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#f2f6fc'
  context.fillText(String(kg), canvas.width / 2, canvas.height / 2 + 4)

  const texture = new CanvasTexture(canvas)
  labelCache.set(kg, texture)

  return texture
}

type PlateRackProps = {
  side: Side
}

// The pins run across the rack depth, so a disc rolls straight on and off.
function Peg({ x, y }: { x: number; y: number }) {
  const length = RACK_DEPTH + 0.04

  return (
    <group position={[x, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, length, 16]} />
        <meshStandardMaterial color={CHROME} metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -length / 2 + 0.07]}>
        <cylinderGeometry args={[0.022, 0.022, 0.12, 16]} />
        <meshStandardMaterial color={RUBBER} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, length / 2]}>
        <sphereGeometry args={[0.021, 12, 8]} />
        <meshStandardMaterial color={CHROME} metalness={0.92} roughness={0.18} />
      </mesh>
    </group>
  )
}

// Inverted-U hoops between the slots: the same idea as a bike parking rack.
// The disc sits in the bay, with the hoop keeping it from sliding sideways.
function Hoop({ x, y, radius, color }: { x: number; y: number; radius: number; color: string }) {
  return (
    <group position={[x, y, 0]}>
      <mesh castShadow>
        <torusGeometry args={[radius, 0.012, 8, 20, Math.PI]} />
        <meshStandardMaterial color={EDGE} metalness={0.78} roughness={0.32} />
      </mesh>
      <mesh position={[0, radius, 0]}>
        <sphereGeometry args={[0.017, 10, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.6}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * radius, -0.045, 0]}>
          <boxGeometry args={[0.03, 0.09, 0.04]} />
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

function WeightLabel({ kg, x, y }: { kg: PlateWeight; x: number; y: number }) {
  const spec = createPlate(kg)

  return (
    <group position={[x, y, RACK_DEPTH / 2 - 0.008]}>
      <mesh castShadow>
        <boxGeometry args={[0.105, 0.044, 0.008]} />
        <meshStandardMaterial color="#101721" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.022, 0.006]}>
        <boxGeometry args={[0.105, 0.009, 0.003]} />
        <meshStandardMaterial
          color={spec.color}
          emissive={spec.color}
          emissiveIntensity={0.25}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.004, 0.006]}>
        <planeGeometry args={[0.098, 0.04]} />
        <meshBasicMaterial
          map={getWeightLabel(kg)}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

// Horizontal competition rack: long low skids, two end frames and two storage
// levels. It reads as a bike rack from the audience camera, not as a tree.
export default function PlateRack({ side }: PlateRackProps) {
  const yaw = RACK_YAW[side]
  const front = RACK_DEPTH / 2 - 0.02
  const bigSlots = PLATE_WEIGHTS.filter((kg) => kg >= 5)
  const smallSlots = PLATE_WEIGHTS.filter((kg) => kg < 5)
  const railLength = RACK_HALF_WIDTH * 2 - 0.1

  return (
    <GlbModel url={MODEL_PATHS.plateRack} enabled={USE_GLB_MODELS}>
      <group position={[rackX(side), 0, RACK_CENTER_Z]} rotation={[0, yaw, 0]}>
        {/* Long skids keep the rack off the floor, like the Eleiko tree. */}
        {[-1, 1].map((depth) => (
          <mesh key={`skid-${depth}`} position={[0, 0.05, depth * front]} castShadow>
            <boxGeometry args={[RACK_HALF_WIDTH * 2 + 0.1, 0.07, 0.09]} />
            <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.45} />
          </mesh>
        ))}
        {[-1, 1].map((end) =>
          [-1, 1].map((depth) => (
            <mesh
              key={`foot-${end}-${depth}`}
              position={[end * (RACK_HALF_WIDTH + 0.02), 0.02, depth * front]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.04, 0.12]} />
              <meshStandardMaterial color={RUBBER} roughness={0.95} />
            </mesh>
          )),
        )}

        {/* Two square end frames plus one long top rail: horizontal silhouette. */}
        {[-1, 1].map((end) => (
          <group key={`end-${end}`}>
            {[-1, 1].map((depth) => (
              <mesh
                key={`post-${depth}`}
                position={[end * (RACK_HALF_WIDTH - 0.06), RACK_HEIGHT / 2, depth * front]}
                castShadow
              >
                <boxGeometry args={[0.06, RACK_HEIGHT, 0.06]} />
                <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.42} />
              </mesh>
            ))}
            <mesh position={[end * (RACK_HALF_WIDTH - 0.06), RACK_HEIGHT, 0]} castShadow>
              <boxGeometry args={[0.075, 0.075, RACK_DEPTH]} />
              <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.42} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, RACK_HEIGHT, 0]} castShadow>
          <boxGeometry args={[RACK_HALF_WIDTH * 2, 0.06, 0.06]} />
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.42} />
        </mesh>
        {/* Two long storage rails per level, front and back. */}
        {[0.16, 0.76].map((y) =>
          [-1, 1].map((depth) => (
            <mesh
              key={`rail-${y}-${depth}`}
              position={[0, y, depth * front]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.026, 0.026, railLength, 12]} />
              <meshStandardMaterial color={EDGE} metalness={0.78} roughness={0.3} />
            </mesh>
          )),
        )}

        {/* Low bay: calibrated 5-25 kg discs. */}
        {bigSlots.map((kg) => {
          const slot = rackSlot(kg)

          return <Peg key={`big-${kg}`} x={slot.x} y={slot.y} />
        })}
        {Array.from({ length: bigSlots.length + 1 }, (_, index) => (
          <Hoop
            key={`big-hoop-${index}`}
            x={(index - bigSlots.length / 2) * RACK_BIG_SPACING}
            y={0.1}
            radius={0.23}
            color={index === 0 ? '#94a3b8' : createPlate(bigSlots[index - 1]).color}
          />
        ))}
        {bigSlots.map((kg) => (
          <WeightLabel key={`big-label-${kg}`} kg={kg} x={rackSlot(kg).x} y={0.68} />
        ))}

        {/* High bay: change plates on their own rail, clear of the big discs. */}
        {smallSlots.map((kg) => {
          const slot = rackSlot(kg)

          return <Peg key={`small-${kg}`} x={slot.x} y={slot.y} />
        })}
        {Array.from({ length: smallSlots.length + 1 }, (_, index) => (
          <Hoop
            key={`small-hoop-${index}`}
            x={(index - smallSlots.length / 2) * RACK_SMALL_SPACING}
            y={0.78}
            radius={0.12}
            color={index === 0 ? '#94a3b8' : createPlate(smallSlots[index - 1]).color}
          />
        ))}
        {smallSlots.map((kg) => (
          <WeightLabel key={`small-label-${kg}`} kg={kg} x={rackSlot(kg).x} y={1.06} />
        ))}

        {/* Collars rest at the end of the high bay. */}
        <Peg x={RACK_COLLAR_X} y={RACK_COLLAR_Y} />
        <mesh position={[RACK_COLLAR_X, 1.06, RACK_DEPTH / 2 - 0.008]}>
          <boxGeometry args={[0.105, 0.044, 0.008]} />
          <meshStandardMaterial color="#101721" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[RACK_COLLAR_X, 1.048, RACK_DEPTH / 2]}>
          <planeGeometry args={[0.1, 0.04]} />
          <meshBasicMaterial color="#dbe4f0" toneMapped={false} />
        </mesh>
      </group>
    </GlbModel>
  )
}
