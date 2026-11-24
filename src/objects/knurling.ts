import { CanvasTexture, RepeatWrapping } from 'three'

let cached: CanvasTexture | null = null

export function getKnurlTexture(): CanvasTexture {
  if (cached) return cached

  const size = 128
  const heightCanvas = document.createElement('canvas')
  heightCanvas.width = size
  heightCanvas.height = size
  const heightContext = heightCanvas.getContext('2d')!

  heightContext.fillStyle = '#808080'
  heightContext.fillRect(0, 0, size, size)
  heightContext.strokeStyle = '#fafafa'
  heightContext.lineWidth = 3

  for (let offset = -size; offset < size * 2; offset += 10) {
    heightContext.beginPath()
    heightContext.moveTo(offset, 0)
    heightContext.lineTo(offset + size, size)
    heightContext.stroke()

    heightContext.beginPath()
    heightContext.moveTo(offset + size, 0)
    heightContext.lineTo(offset, size)
    heightContext.stroke()
  }

  const height = heightContext.getImageData(0, 0, size, size).data
  const normalCanvas = document.createElement('canvas')
  normalCanvas.width = size
  normalCanvas.height = size
  const normalContext = normalCanvas.getContext('2d')!
  const output = normalContext.createImageData(size, size)
  const strength = 2.2

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const left = height[(y * size + ((x - 1 + size) % size)) * 4]
      const right = height[(y * size + ((x + 1) % size)) * 4]
      const up = height[(((y - 1 + size) % size) * size + x) * 4]
      const down = height[(((y + 1) % size) * size + x) * 4]

      const dx = ((right - left) / 255) * strength
      const dy = ((down - up) / 255) * strength
      const length = Math.hypot(dx, dy, 1)
      const index = (y * size + x) * 4

      output.data[index] = ((-dx / length) * 0.5 + 0.5) * 255
      output.data[index + 1] = ((-dy / length) * 0.5 + 0.5) * 255
      output.data[index + 2] = (1 / length) * 255
      output.data[index + 3] = 255
    }
  }

  normalContext.putImageData(output, 0, 0)

  cached = new CanvasTexture(normalCanvas)
  cached.wrapS = RepeatWrapping
  cached.wrapT = RepeatWrapping
  cached.repeat.set(4, 24)

  return cached
}
