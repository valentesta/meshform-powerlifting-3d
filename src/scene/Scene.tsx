import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useSceneStore } from '../state/useSceneStore'
import CameraRig from './CameraRig'
import LoadingScene from './LoadingScene'
import Stage from './Stage'
import StationProps from './StationProps'
import Venue from './Venue'
import { isLowPowerDevice } from './performance'
import { DEFAULT_STATION, STATIONS } from './stations'

export default function Scene() {
  const physicsResetToken = useSceneStore((state) => state.physicsResetToken)
  const lowPower = useMemo(isLowPowerDevice, [])
  const maxDpr = lowPower ? 1.25 : 2
  const [dpr, setDpr] = useState<[number, number]>([1, maxDpr])

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      camera={{ position: STATIONS[DEFAULT_STATION].camera, fov: 45, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.12
      }}
    >
      <color attach="background" args={['#0b1020']} />
      <fog attach="fog" args={['#0b1020', 14, 45]} />

      {/* Real FPS decides the resolution instead of a fixed device guess. */}
      <PerformanceMonitor
        flipflops={3}
        onDecline={() =>
          setDpr(([min, current]) => [min, Math.max(min, +(current - 0.25).toFixed(2))])
        }
        onIncline={() =>
          setDpr(([min, current]) => [min, Math.min(maxDpr, +(current + 0.25).toFixed(2))])
        }
        onFallback={() => setDpr([1, lowPower ? 1 : 1.25])}
      />

      {/* Procedural studio reflections: no HDR download, one render on mount. */}
      <Environment frames={1} resolution={lowPower ? 64 : 128}>
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#e8f1ff"
          position={[-6, 5, -4]}
          scale={[8, 3, 1]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#ffd4bd"
          position={[6, 5, 2]}
          scale={[7, 3, 1]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="ring"
          intensity={1.4}
          color="#e40521"
          position={[0, 6, 6]}
          scale={5}
          target={[0, 1, 0]}
        />
      </Environment>

      <hemisphereLight args={['#8fb6ff', '#1a1020', 0.9]} />
      <directionalLight
        castShadow
        position={[2, 9, 6]}
        intensity={2.2}
        shadow-mapSize={lowPower ? [512, 512] : [2048, 2048]}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <spotLight
        position={[-6, 6, -2]}
        color="#dc2626"
        intensity={25}
        angle={0.6}
        penumbra={0.7}
        distance={18}
      />
      <spotLight
        position={[6, 6, -2]}
        color="#2563eb"
        intensity={25}
        angle={0.6}
        penumbra={0.7}
        distance={18}
      />

      {/* One static pass grounds the platform and racks without a per-frame cost. */}
      <ContactShadows
        position={[0, 0.004, 0]}
        scale={9}
        far={2.6}
        blur={2.6}
        opacity={0.55}
        resolution={lowPower ? 256 : 512}
        frames={1}
        color="#000000"
      />

      <Venue />
      <Sparkles
        count={lowPower ? 28 : 70}
        scale={[9, 4.5, 5]}
        position={[0, 2.2, -1]}
        size={2.2}
        speed={0.22}
        opacity={0.32}
        color="#ffd2a1"
        noise={0.4}
      />
      <CameraRig />
      <Physics timeStep={1 / 120} interpolate gravity={[0, -9.81, 0]}>
        <Stage />
        <StationProps />
        <LoadingScene key={physicsResetToken} />
      </Physics>

      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.25}
          intensity={1.05}
          mipmapBlur
        />
        <Vignette offset={0.34} darkness={0.45} />
      </EffectComposer>
    </Canvas>
  )
}
