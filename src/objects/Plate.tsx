import { useMemo } from 'react'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { createPlate, type PlateWeight } from './createPlate'
import PlateVisual from './PlateVisual'

type PlateProps = {
  kg: PlateWeight
  position: [number, number, number]
  rotation?: [number, number, number]
}

export default function Plate({ kg, position, rotation = [0, 0, 0] }: PlateProps) {
  const spec = useMemo(() => createPlate(kg), [kg])

  return (
    <RigidBody
      colliders={false}
      position={position}
      rotation={rotation}
      ccd
      friction={0.75}
      restitution={0.12}
    >
      <CylinderCollider
        args={[spec.thickness / 2, spec.radius]}
        mass={spec.kg}
        friction={0.75}
        restitution={0.12}
      />

      <PlateVisual kg={kg} />
    </RigidBody>
  )
}
