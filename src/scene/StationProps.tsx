import type { ReactElement } from 'react'
import { RigidBody } from '@react-three/rapier'
import ComboRack from '../objects/ComboRack'
import DeadliftSupports from '../objects/DeadliftSupports'
import { STATIONS, type StationId } from './stations'
import { useSceneStore } from '../state/useSceneStore'
import { useLoadingStore } from '../state/useLoadingStore'

type EquipmentProps = {
  barY: number
  accent: string
}

function SquatEquipment(props: EquipmentProps) {
  return <ComboRack {...props} mode="squat" />
}

function BenchEquipment(props: EquipmentProps) {
  return <ComboRack {...props} mode="bench" />
}

function DeadliftEquipment({ barY }: EquipmentProps) {
  return <DeadliftSupports barY={barY} />
}

const EQUIPMENT: Record<StationId, (props: EquipmentProps) => ReactElement> = {
  squat: SquatEquipment,
  bench: BenchEquipment,
  deadlift: DeadliftEquipment,
}

export default function StationProps() {
  const activeStation = useSceneStore((state) => state.activeStation)
  const plateCount = useLoadingStore((state) => state.loadedPlates.length)
  const station = STATIONS[activeStation]
  const Equipment = EQUIPMENT[activeStation]

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* With plates on the bar the discs rest on the platform, so hide the empty-bar stands. */}
      {activeStation !== 'deadlift' || plateCount === 0 ? (
        <Equipment barY={station.bar[1]} accent={station.accent} />
      ) : (
        <group />
      )}
    </RigidBody>
  )
}
