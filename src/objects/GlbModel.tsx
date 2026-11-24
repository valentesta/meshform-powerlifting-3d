import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'

type GlbModelProps = {
  url: string
  enabled?: boolean
  children: ReactNode
}

function LoadedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => scene.clone(true), [scene])

  return <primitive object={clone} />
}

// A GLB replaces the procedural prop only when the file is really there.
// Vite and Vercel answer unknown paths with index.html, so the content type
// is checked as well as the status code. Any failure keeps the fallback.
export default function GlbModel({ url, enabled = true, children }: GlbModelProps) {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setAvailable(false)
      return
    }

    let alive = true

    fetch(url, { method: 'HEAD' })
      .then((response) => {
        const type = response.headers.get('content-type') ?? ''
        const isModel =
          type.includes('model/gltf') || type.includes('octet-stream')

        if (alive) setAvailable(response.ok && isModel)
      })
      .catch(() => {
        if (alive) setAvailable(false)
      })

    return () => {
      alive = false
    }
  }, [enabled, url])

  if (!available) return <>{children}</>

  return (
    <Suspense fallback={<>{children}</>}>
      <LoadedModel url={url} />
    </Suspense>
  )
}
