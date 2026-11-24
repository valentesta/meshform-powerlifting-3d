import { useEffect, useRef } from 'react'
import { drawFlag } from '../data/flags'

type FlagIconProps = {
  code: string
  title?: string
}

export default function FlagIcon({ code, title }: FlagIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, 32, 20)
    drawFlag(context, code, 0, 0, 32, 20)
  }, [code])

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={20}
      role="img"
      aria-label={title ?? code}
      className="h-4 w-6 shrink-0 rounded-[2px] border border-white/10"
    />
  )
}
