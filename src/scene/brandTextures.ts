import { CanvasTexture } from 'three'

let logoTexture: CanvasTexture | null = null

// The studio mark is the wire triangle from the Meshform brand, drawn on a
// canvas so the 3D scene needs no image files or extra fonts.
export function getBrandLogoTexture(): CanvasTexture {
  if (logoTexture) return logoTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')!

  context.clearRect(0, 0, canvas.width, canvas.height)

  const x = (value: number) => value * 3.6 + 8
  const y = (value: number) => value * 3.6 + 8
  const line = (from: [number, number], to: [number, number], width: number) => {
    context.beginPath()
    context.moveTo(x(from[0]), y(from[1]))
    context.lineTo(x(to[0]), y(to[1]))
    context.lineWidth = width
    context.stroke()
  }

  context.strokeStyle = '#5cffb0'
  context.lineJoin = 'round'

  context.beginPath()
  context.moveTo(x(12), y(2.5))
  context.lineTo(x(21.5), y(19.5))
  context.lineTo(x(2.5), y(19.5))
  context.closePath()
  context.lineWidth = 4.5
  context.stroke()

  line([12, 2.5], [12, 19.5], 2.8)
  line([7.25, 11], [16.75, 11], 2.8)
  line([12, 19.5], [7.25, 11], 2.8)
  line([12, 19.5], [16.75, 11], 2.8)

  context.font = '600 52px sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillStyle = '#f4f7fb'
  context.fillText('meshform', 124, 64)

  logoTexture = new CanvasTexture(canvas)

  return logoTexture
}
