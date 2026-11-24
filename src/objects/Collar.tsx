import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { BAR } from './barbellSpecs'
import CollarVisual from './CollarVisual'

type CollarProps = {
  position: [number, number, number]
}

export default function Collar({ position }: CollarProps) {
  return (
    <RigidBody colliders={false} position={position} ccd friction={0.7} restitution={0.1}>
      <CylinderCollider args={[0.03, 0.033]} mass={BAR.collarMass} />

      <CollarVisual />
    </RigidBody>
  )
}
