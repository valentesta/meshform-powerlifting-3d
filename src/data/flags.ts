// Simple procedural flags. No image files and no country-flag dependency:
// canvas drawing works for both the LED wall and the HTML leaderboard.
const KNOWN = new Set([
  'CAN', 'BEL', 'NZL', 'USA', 'ITA', 'FRA', 'ENG', 'SWE', 'POL', 'TTO', 'ALG', 'NOR',
])

function fill(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function cross(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number,
  thickness: number,
): void {
  fill(ctx, color, x + w / 2 - thickness / 2, y, thickness, h)
  fill(ctx, color, x, y + h / 2 - thickness / 2, w, thickness)
}

function dot(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  r: number,
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export function drawFlag(
  ctx: CanvasRenderingContext2D,
  code: string,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  fill(ctx, '#1b2431', x, y, w, h)

  const third = w / 3
  const half = h / 2

  switch (code) {
    case 'CAN':
      fill(ctx, '#d52b1e', x, y, third, h)
      fill(ctx, '#d52b1e', x + third * 2, y, third, h)
      dot(ctx, '#d52b1e', x + w / 2, y + half, h * 0.19)
      fill(ctx, '#ffffff', x + w / 2 - h * 0.045, y + half - h * 0.16, h * 0.09, h * 0.32)
      break
    case 'BEL':
      fill(ctx, '#1a1a1a', x, y, third, h)
      fill(ctx, '#fdda24', x + third, y, third, h)
      fill(ctx, '#ed2939', x + third * 2, y, third, h)
      break
    case 'NZL':
      fill(ctx, '#00247d', x, y, w, h)
      dot(ctx, '#ffffff', x + w * 0.7, y + h * 0.28, h * 0.075)
      dot(ctx, '#d52b1e', x + w * 0.7, y + h * 0.28, h * 0.045)
      dot(ctx, '#ffffff', x + w * 0.82, y + h * 0.58, h * 0.075)
      dot(ctx, '#d52b1e', x + w * 0.82, y + h * 0.58, h * 0.045)
      dot(ctx, '#ffffff', x + w * 0.65, y + h * 0.78, h * 0.075)
      dot(ctx, '#d52b1e', x + w * 0.65, y + h * 0.78, h * 0.045)
      break
    case 'USA':
      // Bolder than the real flag on purpose: at 24 px wide, thin stripes and
      // tiny stars disappear. Seven clear red bands, a large canton and six
      // bigger stars keep the nationality readable on the LED and the HUD.
      for (let stripe = 0; stripe < 13; stripe += 1) {
        if (stripe % 2 === 0) {
          fill(ctx, '#e5232f', x, y + (stripe * h) / 13, w, h / 13 + 0.6)
        }
      }
      fill(ctx, '#123f8c', x, y, w * 0.48, h * 7 / 13 + 0.5)
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 3; column += 1) {
          dot(
            ctx,
            '#ffffff',
            x + w * (0.09 + column * 0.15),
            y + h * (0.09 + row * 0.16),
            h * 0.045,
          )
        }
      }
      break
    case 'ITA':
      fill(ctx, '#008c45', x, y, third, h)
      fill(ctx, '#f4f5f0', x + third, y, third, h)
      fill(ctx, '#cd212a', x + third * 2, y, third, h)
      break
    case 'FRA':
      fill(ctx, '#002395', x, y, third, h)
      fill(ctx, '#ffffff', x + third, y, third, h)
      fill(ctx, '#ed2939', x + third * 2, y, third, h)
      break
    case 'ENG':
      fill(ctx, '#ffffff', x, y, w, h)
      cross(ctx, '#ce1124', x, y, w, h, h * 0.2)
      break
    case 'SWE':
      fill(ctx, '#006aa7', x, y, w, h)
      cross(ctx, '#fecc00', x, y, w, h, h * 0.2)
      break
    case 'POL':
      fill(ctx, '#ffffff', x, y, w, half)
      fill(ctx, '#dc143c', x, y + half, w, half)
      break
    case 'TTO':
      fill(ctx, '#d52b1e', x, y, w, h)
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.moveTo(x - w * 0.1, y + h * 0.9)
      ctx.lineTo(x + w * 1.1, y - h * 0.1)
      ctx.lineTo(x + w * 1.1, y + h * 0.28)
      ctx.lineTo(x + w * 0.02, y + h * 1.1)
      ctx.closePath()
      ctx.fill()
      break
    case 'ALG':
      fill(ctx, '#006233', x, y, half, h)
      fill(ctx, '#ffffff', x + half, y, half, h)
      dot(ctx, '#d52b1e', x + half * 1.5, y + half, h * 0.28)
      dot(ctx, '#ffffff', x + half * 1.56, y + half, h * 0.22)
      break
    case 'NOR':
      fill(ctx, '#ba0c2f', x, y, w, h)
      cross(ctx, '#ffffff', x, y, w, h, h * 0.34)
      cross(ctx, '#00205b', x, y, w, h, h * 0.18)
      break
    default:
      if (KNOWN.has(code)) break
      dot(ctx, '#7d8da3', x + w / 2, y + half, h * 0.18)
  }

  ctx.restore()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 1.25
  ctx.strokeRect(x + 0.6, y + 0.6, w - 1.2, h - 1.2)
}
