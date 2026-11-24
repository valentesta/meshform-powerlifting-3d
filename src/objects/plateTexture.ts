import { CanvasTexture } from 'three'
import type { PlateWeight } from './createPlate'

const cache = new Map<string, CanvasTexture>()

function needsDarkInk(hex: string): boolean {
  const value = hex.replace('#', '')
  const red = parseInt(value.slice(0, 2), 16)
  const green = parseInt(value.slice(2, 4), 16)
  const blue = parseInt(value.slice(4, 6), 16)

  return red * 0.299 + green * 0.587 + blue * 0.114 > 165
}

export function getPlateFaceTexture(kg: PlateWeight, color: string): CanvasTexture {
  const key = `${kg}-${color}`
  const cached = cache.get(key)

  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')!
  const darkInk = needsDarkInk(color)
  const ink = darkInk ? '#111827' : '#f8fafc'
  const halo = darkInk ? 'rgba(255, 255, 255, 0.6)' : 'rgba(8, 12, 20, 0.65)'

  const stamp = (text: string, y: number, size: number, family = 'sans-serif') => {
    context.font = `bold ${size}px ${family}`
    context.lineWidth = Math.max(3, size * 0.075)
    context.strokeStyle = halo
    context.strokeText(text, 256, y)
    context.fillStyle = ink
    context.fillText(text, 256, y)
  }

  context.clearRect(0, 0, 512, 512)
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // Raised rings imitate the machined face of a calibrated competition disc.
  context.strokeStyle = halo
  context.lineWidth = 6
  context.beginPath()
  context.arc(256, 256, 226, 0, Math.PI * 2)
  context.stroke()

  context.lineWidth = 3
  context.beginPath()
  context.arc(256, 256, 206, 0, Math.PI * 2)
  context.stroke()

  stamp('MESHFORM', 104, 36)
  stamp('COMPETITION', 144, 20, 'monospace')

  const numberSize = kg < 5 ? 132 : 178
  stamp(String(kg), 272, numberSize)
  stamp('KG', 366, 32)

  context.font = 'bold 17px monospace'
  context.fillStyle = ink
  context.fillText('CALIBRATED', 256, 414)

  context.beginPath()
  context.moveTo(186, 398)
  context.lineTo(326, 398)
  context.strokeStyle = halo
  context.lineWidth = 3
  context.stroke()

  const texture = new CanvasTexture(canvas)
  cache.set(key, texture)

  return texture
}

let brandTexture: CanvasTexture | null = null

export function getPlateLabelTexture(): CanvasTexture {
  if (brandTexture) return brandTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128

  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = 'bold 58px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineWidth = 5
  context.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  context.strokeText('MESHFORM', 256, 64)
  context.fillStyle = '#ffffff'
  context.fillText('MESHFORM', 256, 64)

  brandTexture = new CanvasTexture(canvas)

  return brandTexture
}
