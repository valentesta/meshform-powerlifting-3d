import { lazy, Suspense, useMemo } from 'react'
import Fallback from './ui/Fallback'
import Overlay from './ui/Overlay'
import { hasWebGL, prefersReducedMotion } from './scene/capabilities'

// Three, Rapier and postprocessing are only needed when the 3D scene can run.
// Splitting them out keeps the first paint and the no-WebGL fallback small.
const Scene = lazy(() => import('./scene/Scene'))

export default function App() {
  const webglAvailable = useMemo(() => hasWebGL(), [])
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  if (!webglAvailable || reducedMotion) {
    return <Fallback reason={webglAvailable ? 'reduced-motion' : 'no-webgl'} />
  }

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#05060a]">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center" role="status">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Loading arena…
            </p>
          </div>
        }
      >
        <Scene />
      </Suspense>
      <Overlay />
    </main>
  )
}
