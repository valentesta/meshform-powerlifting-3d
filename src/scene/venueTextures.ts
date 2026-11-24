import { CanvasTexture } from 'three'
import { drawFlag } from '../data/flags'
import { MEN_RESULTS, WOMEN_RESULTS, type ResultRow } from '../data/results'

const WIDTH = 2048
const HEIGHT = 896
const PAGE_SIZE = 6

let resultsCanvas: HTMLCanvasElement | null = null
let resultsContext: CanvasRenderingContext2D | null = null
let resultsTexture: CanvasTexture | null = null
let currentPage = 0

export const RESULTS_PAGES = Math.ceil(Math.max(WOMEN_RESULTS.length, MEN_RESULTS.length) / PAGE_SIZE)

const COLUMNS = {
  place: 26,
  flag: 72,
  name: 116,
  className: 560,
  squat: 840,
  bench: 1040,
  deadlift: 1240,
  total: 1480,
  wr: 1900,
} as const

const HEADERS: { label: string; at: number; align: CanvasTextAlign }[] = [
  { label: 'PLACE', at: COLUMNS.place, align: 'left' },
  { label: 'NAME', at: COLUMNS.name, align: 'left' },
  { label: 'CLASS', at: COLUMNS.className, align: 'left' },
  { label: 'SQUAT', at: COLUMNS.squat, align: 'right' },
  { label: 'BENCH', at: COLUMNS.bench, align: 'right' },
  { label: 'DEADLIFT', at: COLUMNS.deadlift, align: 'right' },
  { label: 'TOTAL', at: COLUMNS.total, align: 'right' },
  { label: '% OF WR', at: COLUMNS.wr, align: 'right' },
]

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT

  return [canvas, canvas.getContext('2d')!]
}

function drawHeader(context: CanvasRenderingContext2D): void {
  const gradient = context.createLinearGradient(0, 0, WIDTH, 100)
  gradient.addColorStop(0, '#141c28')
  gradient.addColorStop(0.5, '#0c1119')
  gradient.addColorStop(1, '#22101a')

  context.fillStyle = gradient
  context.fillRect(0, 0, WIDTH, 96)
  context.fillStyle = '#e40521'
  context.fillRect(0, 0, WIDTH, 7)

  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.fillStyle = '#e40521'
  context.fillRect(40, 22, 62, 54)
  context.fillStyle = '#ffffff'
  context.font = 'bold 32px sans-serif'
  context.fillText('MF', 71, 50)

  context.textAlign = 'left'
  context.fillStyle = '#f5f7fb'
  context.font = 'bold 52px sans-serif'
  context.fillText('STANDINGS', 118, 50)

  context.textAlign = 'center'
  context.fillStyle = '#8fa1b8'
  context.font = 'bold 19px monospace'
  context.fillText('SHEFFIELD V 2026  ·  FINAL RESULTS  ·  KG', WIDTH / 2 + 80, 74)

  context.fillStyle = '#e40521'
  context.fillRect(WIDTH - 292, 22, 252, 54)
  context.fillStyle = '#ffffff'
  context.font = 'bold 30px sans-serif'
  context.fillText('MESHFORM V', WIDTH - 166, 50)
}

function drawTable(
  context: CanvasRenderingContext2D,
  options: {
    x: number
    y: number
    width: number
    height: number
    title: string
    rows: ResultRow[]
    accent: string
  },
): void {
  const { x, y, width, height, title, rows, accent } = options
  const start = currentPage * PAGE_SIZE
  const visible = rows.slice(start, start + PAGE_SIZE)

  context.fillStyle = '#101722'
  context.fillRect(x, y, width, height)
  context.fillStyle = accent
  context.fillRect(x, y, width, 6)

  context.textBaseline = 'middle'
  context.textAlign = 'left'
  context.fillStyle = accent
  context.fillRect(x + 24, y + 22, 150, 44)
  context.fillStyle = '#ffffff'
  context.font = 'bold 25px sans-serif'
  context.fillText(title, x + 99, y + 45)

  context.font = 'bold 17px monospace'
  context.fillStyle = '#8294ac'
  for (const header of HEADERS) {
    context.textAlign = header.align
    context.fillText(header.label, x + header.at, y + 92)
  }

  context.fillStyle = 'rgba(255, 255, 255, 0.1)'
  context.fillRect(x + 24, y + 110, width - 48, 2)

  visible.forEach((row, index) => {
    const rowY = y + 136 + index * 40

    if (index === 0) {
      context.fillStyle = accent === '#e40521' ? 'rgba(228, 5, 33, 0.16)' : 'rgba(79, 140, 255, 0.16)'
      context.fillRect(x + 16, rowY - 17, width - 32, 36)
      context.fillStyle = accent
      context.fillRect(x + 16, rowY - 17, 4, 36)
    }

    context.textAlign = 'center'
    context.fillStyle = index === 0 ? '#ff7c88' : '#90a1b7'
    context.font = 'bold 24px monospace'
    context.fillText(row.rank, x + COLUMNS.place + 8, rowY)

    drawFlag(context, row.nat, x + COLUMNS.flag, rowY - 11, 36, 22)

    context.textAlign = 'left'
    context.fillStyle = '#f2f6fb'
    context.font = 'bold 23px sans-serif'
    context.fillText(row.name, x + COLUMNS.name, rowY)

    context.fillStyle = '#9db0c8'
    context.font = 'bold 21px monospace'
    context.fillText(row.className, x + COLUMNS.className, rowY)

    const values: { at: number; text: string; color: string; font: string }[] = [
      { at: COLUMNS.squat, text: row.squat, color: '#dbe5f2', font: 'bold 22px monospace' },
      { at: COLUMNS.bench, text: row.bench, color: '#dbe5f2', font: 'bold 22px monospace' },
      { at: COLUMNS.deadlift, text: row.deadlift, color: '#dbe5f2', font: 'bold 22px monospace' },
      { at: COLUMNS.total, text: row.total, color: '#ffffff', font: 'bold 25px monospace' },
      { at: COLUMNS.wr, text: row.wr, color: '#ffd166', font: 'bold 23px monospace' },
    ]

    context.textAlign = 'right'
    for (const value of values) {
      context.fillStyle = value.color
      context.font = value.font
      context.fillText(value.text, x + value.at, rowY)
    }
  })

  context.textAlign = 'left'
  context.fillStyle = '#697b93'
  context.font = '17px monospace'
  context.fillText('BEST LIFTS  ·  KG  ·  % OF WORLD RECORD', x + 24, y + height - 18)

  context.textAlign = 'right'
  context.fillStyle = accent
  context.font = 'bold 18px monospace'
  context.fillText(
    `PAGE ${currentPage + 1}/${RESULTS_PAGES}   SCROLL TO SEE MORE  ▼`,
    x + width - 24,
    y + height - 18,
  )
}

function drawResults(): void {
  if (!resultsCanvas || !resultsContext) return

  const context = resultsContext

  context.fillStyle = '#0b1018'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  const glow = context.createRadialGradient(WIDTH / 2, HEIGHT, 60, WIDTH / 2, HEIGHT, 950)
  glow.addColorStop(0, 'rgba(228, 5, 33, 0.22)')
  glow.addColorStop(0.6, 'rgba(45, 70, 110, 0.1)')
  glow.addColorStop(1, 'rgba(11, 16, 24, 0)')
  context.fillStyle = glow
  context.fillRect(0, 0, WIDTH, HEIGHT)

  drawHeader(context)
  drawTable(context, {
    x: 40,
    y: 104,
    width: WIDTH - 80,
    height: 372,
    title: 'WOMEN',
    rows: WOMEN_RESULTS,
    accent: '#e40521',
  })
  drawTable(context, {
    x: 40,
    y: 496,
    width: WIDTH - 80,
    height: 372,
    title: 'MEN',
    rows: MEN_RESULTS,
    accent: '#4f8cff',
  })

  context.textAlign = 'center'
  context.fillStyle = '#5f7087'
  context.font = '16px monospace'
  context.fillText(
    'SOURCE: OPENIPF  ·  2026 IPF SHEFFIELD V CHAMPIONSHIPS  ·  21 NOV 2026',
    WIDTH / 2,
    HEIGHT - 10,
  )
}

export function getResultsTexture(): CanvasTexture {
  if (resultsTexture) return resultsTexture

  ;[resultsCanvas, resultsContext] = makeCanvas()
  drawResults()

  resultsTexture = new CanvasTexture(resultsCanvas)

  return resultsTexture
}

export function getResultsPage(): number {
  return currentPage
}

// Called by the wheel/drag handlers on the LED plane. Returns true when the
// page actually changed so the venue can reset its auto-scroll timer.
export function setResultsPage(page: number): boolean {
  const next = ((page % RESULTS_PAGES) + RESULTS_PAGES) % RESULTS_PAGES

  if (next === currentPage) return false

  currentPage = next
  drawResults()

  if (resultsTexture) resultsTexture.needsUpdate = true

  return true
}
