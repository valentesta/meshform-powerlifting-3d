type FallbackProps = {
  reason: 'no-webgl' | 'reduced-motion'
}

export default function Fallback({ reason }: FallbackProps) {
  const message =
    reason === 'no-webgl'
      ? 'This browser cannot start WebGL, so the interactive 3D scene is disabled.'
      : 'Reduced motion is enabled on your device, so the 3D scene is shown as a static preview.'

  return (
    <main className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0b1020] to-[#05060a] p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Meshform</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Powerlifting 3D</h1>
        <img
          src="/fallback.svg"
          alt="Static preview of a loaded barbell resting on a competition platform"
          className="mx-auto mt-6 w-full rounded-xl border border-white/10 bg-black/30"
          width={640}
          height={360}
        />
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{message}</p>
      </div>
    </main>
  )
}
