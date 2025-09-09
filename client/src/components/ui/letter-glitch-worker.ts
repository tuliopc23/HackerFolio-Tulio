interface InitMessage {
  type: 'init'
  canvas: OffscreenCanvas
  width: number
  height: number
  dpr: number
  glitchColors: string[]
  glitchSpeed: number
  smooth: boolean
  fontSize: number
  charWidth: number
  charHeight: number
}

interface ResizeMessage {
  type: 'resize'
  width: number
  height: number
  dpr: number
}

type WorkerMessage = InitMessage | ResizeMessage

let ctx: OffscreenCanvasRenderingContext2D | null = null
let canvas: OffscreenCanvas | null = null
let width = 0
let height = 0
let dpr = 1
let glitchColors: string[] = []
let glitchSpeed = 80
let smooth = true
let fontSize = 14
let charWidth = 9
let charHeight = 16

let letters: Array<{ char: string; color: string; targetColor: string; colorProgress: number }> = []
let columns = 0
let rows = 0
let lastGlitchTime = Date.now()
let rafId: number | null = null

const lettersAZ: string[] = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
const digits: string[] = Array.from({ length: 10 }, (_, i) => String(i))
const terminalChars: string[] = [
  ...lettersAZ,
  ...digits,
  '!',
  '@',
  '#',
  '$',
  '%',
  '&',
  '*',
  '(',
  ')',
  '_',
  '-',
  '+',
  '=',
  '/',
  '\\',
  '|',
  '[',
  ']',
  '{',
  '}',
  ';',
  ':',
  '<',
  '>',
  '?',
  '~',
  '`',
  '^',
  "'",
  '"',
  ',',
  '.',
  ' ',
]

function getRandomChar() {
  return terminalChars[(Math.random() * terminalChars.length) | 0] ?? ' '
}

function getRandomColor() {
  return glitchColors[(Math.random() * glitchColors.length) | 0] ?? '#666666'
}

function hexToRgb(hex: string) {
  if (hex.startsWith('rgba(')) {
    const match = /rgba\((\d+),(\d+),(\d+),[\d.]+\)/.exec(hex)
    if (match)
      return {
        r: parseInt(match[1] ?? '0', 10),
        g: parseInt(match[2] ?? '0', 10),
        b: parseInt(match[3] ?? '0', 10),
      }
  }
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(
    shorthand,
    (_m: string, r: string, g: string, b: string) => r + r + g + g + b + b
  )
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!res) return null
  const [, rHex = '00', gHex = '00', bHex = '00'] = res
  return { r: parseInt(rHex, 16), g: parseInt(gHex, 16), b: parseInt(bHex, 16) }
}

function interpolateColor(
  start: { r: number; g: number; b: number },
  end: { r: number; g: number; b: number },
  factor: number
) {
  const r = Math.round(start.r + (end.r - start.r) * factor)
  const g = Math.round(start.g + (end.g - start.g) * factor)
  const b = Math.round(start.b + (end.b - start.b) * factor)
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`
}

function calculateGrid(w: number, h: number) {
  columns = Math.max(1, Math.ceil(w / charWidth))
  rows = Math.max(1, Math.ceil(h / charHeight))
}

function initializeLetters() {
  const total = columns * rows
  letters = Array.from({ length: total }, () => ({
    char: getRandomChar(),
    color: getRandomColor(),
    targetColor: getRandomColor(),
    colorProgress: 1,
  }))
}

function drawLetters() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, width, height)
  ctx.font = `${String(fontSize)}px 'JetBrains Mono', 'Courier New', monospace`
  ctx.textBaseline = 'top'
  for (let i = 0; i < letters.length; i++) {
    const x = (i % columns) * charWidth
    const y = ((i / columns) | 0) * charHeight
    const l = letters[i]
    if (!l) continue
    ctx.fillStyle = l.color
    ctx.fillText(l.char, x, y)
  }
}

function updateLetters() {
  if (!letters.length) return
  const updateCount = Math.max(1, Math.floor(letters.length * 0.02))
  for (let i = 0; i < updateCount; i++) {
    const idx = (Math.random() * letters.length) | 0
    const l = letters[idx]
    if (!l) continue
    l.char = getRandomChar()
    l.targetColor = getRandomColor()
    if (!smooth) {
      l.color = l.targetColor
      l.colorProgress = 1
    } else {
      l.colorProgress = 0
    }
  }
}

function smoothTransitions() {
  let changed = false
  for (const l of letters) {
    if (l.colorProgress < 1) {
      l.colorProgress += 0.03
      if (l.colorProgress > 1) l.colorProgress = 1
      const start = hexToRgb(l.color)
      const end = hexToRgb(l.targetColor)
      if (start && end) {
        l.color = interpolateColor(start, end, l.colorProgress)
        changed = true
      }
    }
  }
  if (changed) drawLetters()
}

function animate() {
  rafId = self.requestAnimationFrame(animate)
  const now = Date.now()
  if (now - lastGlitchTime >= glitchSpeed) {
    updateLetters()
    drawLetters()
    lastGlitchTime = now
  }
  if (smooth) smoothTransitions()
}

function setupCanvas() {
  if (!canvas) return
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))
  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  calculateGrid(width, height)
  initializeLetters()
  drawLetters()
}

self.onmessage = (evt: MessageEvent<WorkerMessage>) => {
  const { data } = evt
  if (data.type === 'init') {
    const {
      canvas: initCanvas,
      width: initW,
      height: initH,
      dpr: initDpr,
      glitchColors: initColors,
      glitchSpeed: initSpeed,
      smooth: initSmooth,
      fontSize: initFont,
      charWidth: initCharW,
      charHeight: initCharH,
    } = data
    canvas = initCanvas
    width = initW
    height = initH
    dpr = initDpr
    glitchColors = initColors
    glitchSpeed = initSpeed
    smooth = initSmooth
    fontSize = initFont
    charWidth = initCharW
    charHeight = initCharH
    setupCanvas()
    if (rafId) self.cancelAnimationFrame(rafId)
    animate()
  } else {
    const { width: newW, height: newH, dpr: newDpr } = data
    width = newW
    height = newH
    dpr = newDpr
    setupCanvas()
  }
}
