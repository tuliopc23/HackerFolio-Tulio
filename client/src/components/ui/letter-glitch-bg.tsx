import { useRef, useEffect } from 'react'

const LetterGlitchBackground = ({
  glitchColors = [
    '#FF00FF', // magenta-bright
    '#00D4FF', // cyan-bright
    '#C954C9', // magenta-soft
    '#7DD3FC', // cyan-soft
  ],
  glitchSpeed = 80,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
}: {
  glitchColors?: string[]
  glitchSpeed?: number
  centerVignette?: boolean
  outerVignette?: boolean
  smooth?: boolean
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const letters = useRef<
    Array<{
      char: string
      color: string
      targetColor: string
      colorProgress: number
    }>
  >([])
  const grid = useRef({ columns: 0, rows: 0 })
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const lastGlitchTime = useRef(Date.now())

  const fontSize = 14
  const charWidth = 9
  const charHeight = 16

  // Terminal-focused characters for more hacker aesthetic
  const terminalChars = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '!',
    '@',
    '#',
    '$',
    '%',
    '&',
    '*',
    '(',
    ')',
    '-',
    '_',
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

  const getRandomChar = (): string => {
    const ch = terminalChars[Math.floor(Math.random() * terminalChars.length)]
    return typeof ch === 'string' ? ch : ' '
  }

  const getRandomColor = (): string => {
    const c = glitchColors[Math.floor(Math.random() * glitchColors.length)]
    return typeof c === 'string' ? c : '#00D4FF'
  }

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace(shorthandRegex, (_m: string, r: string, g: string, b: string) => {
      return r + r + g + g + b + b
    })

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    const r = result[1]
    const g = result[2]
    const b = result[3]
    return {
      r: parseInt(r ?? '00', 16),
      g: parseInt(g ?? '00', 16),
      b: parseInt(b ?? '00', 16),
    }
  }

  const interpolateColor = (
    start: { r: number; g: number; b: number },
    end: { r: number; g: number; b: number },
    factor: number
  ) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    }
    return `rgb(${result.r}, ${result.g}, ${result.b})`
  }

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth)
    const rows = Math.ceil(height / charHeight)
    return { columns, rows }
  }

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows }
    const totalLetters = columns * rows
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }))
  }

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const rect = parent.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height)
    initializeLetters(columns, rows)
    drawLetters()
  }

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0) return
    const ctx = context.current
    const { width, height } = canvasRef.current!.getBoundingClientRect()

    ctx.clearRect(0, 0, width, height)
    ctx.font = `${fontSize}px 'JetBrains Mono', 'Courier New', monospace`
    ctx.textBaseline = 'top'

    letters.current.forEach((letter, index) => {
      const cols = Math.max(1, grid.current.columns)
      const x = (index % cols) * charWidth
      const y = Math.floor(index / cols) * charHeight
      ctx.fillStyle = letter.color || '#00D4FF'
      ctx.fillText(letter.char || ' ', x, y)
    })
  }

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return

    // Reduced update rate for more subtle glitch effect
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.02))

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length)
      if (!letters.current[index]) continue

      letters.current[index].char = getRandomChar()
      letters.current[index].targetColor = getRandomColor()

      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor
        letters.current[index].colorProgress = 1
      } else {
        letters.current[index].colorProgress = 0
      }
    }
  }

  const handleSmoothTransitions = () => {
    let needsRedraw = false
    letters.current.forEach(letter => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.03 // Slower transition for smoother effect
        if (letter.colorProgress > 1) letter.colorProgress = 1

        const startRgb = hexToRgb(letter.color)
        const endRgb = hexToRgb(letter.targetColor)
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress)
          needsRedraw = true
        }
      }
    })

    if (needsRedraw) {
      drawLetters()
    }
  }

  const animate = () => {
    const now = Date.now()
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters()
      drawLetters()
      lastGlitchTime.current = now
    }

    if (smooth) {
      handleSmoothTransitions()
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    context.current = canvas.getContext('2d')
    resizeCanvas()
    animate()

    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationRef.current!)
        resizeCanvas()
        animate()
      }, 100)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      cancelAnimationFrame(animationRef.current!)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [glitchSpeed, smooth, glitchColors])

  return (
    <div className='relative w-full h-full bg-black overflow-hidden'>
      <canvas ref={canvasRef} className='block w-full h-full opacity-60' />
      {outerVignette && (
        <div className='absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-radial from-transparent via-transparent to-black' />
      )}
      {centerVignette && (
        <div className='absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-radial from-black/80 via-transparent to-transparent' />
      )}
    </div>
  )
}

export default LetterGlitchBackground
