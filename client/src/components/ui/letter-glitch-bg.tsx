import { useRef, useEffect, useCallback, useMemo } from 'react'

const LetterGlitchBackground = ({
  glitchColors = [
    '#666666', // soft gray
    '#777777', // medium gray
    '#888888', // lighter gray
    '#999999', // lightest gray
    'rgba(255,255,255,0.05)', // ghosted white
    'rgba(255,255,255,0.08)', // slightly more visible white
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
  // Frame scheduling (RAF/timeout) for WebKit-friendly cadence
  const rafIdRef = useRef<number | null>(null)
  const timeoutIdRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(Date.now())
  const workerRef = useRef<Worker | null>(null)
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
  const cssSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const transferredRef = useRef(false)

  const fontSize = 14
  const charWidth = 9
  const charHeight = 16

  // Terminal-focused characters for more hacker aesthetic
  const terminalChars = useMemo(
    () => [
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
    ],
    []
  )

  const getRandomChar = useCallback((): string => {
    const ch = terminalChars[Math.floor(Math.random() * terminalChars.length)]
    return typeof ch === 'string' ? ch : ' '
  }, [terminalChars])

  const getRandomColor = useCallback((): string => {
    const c = glitchColors[Math.floor(Math.random() * glitchColors.length)]
    return typeof c === 'string' ? c : '#666666'
  }, [glitchColors])

  const hexToRgb = (hex: string) => {
    // Handle rgba values
    if (hex.startsWith('rgba(')) {
      const match = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/.exec(hex)
      if (match) {
        return {
          r: parseInt(match[1] ?? '102', 10),
          g: parseInt(match[2] ?? '102', 10),
          b: parseInt(match[3] ?? '102', 10),
        }
      }
    }

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
    return `rgb(${String(result.r)}, ${String(result.g)}, ${String(result.b)})`
  }

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth)
    const rows = Math.ceil(height / charHeight)
    return { columns, rows }
  }

  const initializeLetters = useCallback(
    (columns: number, rows: number) => {
      grid.current = { columns, rows }
      const totalLetters = columns * rows
      letters.current = Array.from({ length: totalLetters }, () => ({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1,
      }))
    },
    [getRandomChar, getRandomColor]
  )

  const drawLetters = useCallback(() => {
    if (!context.current || letters.current.length === 0) return
    const ctx = context.current
    const canvas = canvasRef.current
    if (!canvas) return
    const { width } = cssSize.current
    const { height } = cssSize.current

    ctx.clearRect(0, 0, width, height)

    // Set font once, outside the loop for slight optimization
    ctx.font = `${String(fontSize)}px 'JetBrains Mono', 'Courier New', monospace`
    ctx.textBaseline = 'top'

    // Pre-calculate cols to avoid redundant calculations
    const cols = Math.max(1, grid.current.columns)
    letters.current.forEach((letter, index) => {
      const x = (index % cols) * charWidth
      const y = Math.floor(index / cols) * charHeight
      ctx.fillStyle = letter.color || '#666666'
      ctx.fillText(letter.char || ' ', x, y)
    })
  }, [fontSize, charWidth, charHeight])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const rect = parent.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    canvas.style.width = `${String(rect.width)}px`
    canvas.style.height = `${String(rect.height)}px`

    cssSize.current = { width: rect.width, height: rect.height }

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height)
    initializeLetters(columns, rows)
    drawLetters()
  }, [initializeLetters, drawLetters])

  const updateLetters = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!letters.current || letters.current.length === 0) return

    // Reduced update rate for more subtle glitch effect
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.02))

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length)
      const letter = letters.current[index]
      if (!letter) continue

      letter.char = getRandomChar()
      letter.targetColor = getRandomColor()

      if (!smooth) {
        letter.color = letter.targetColor
        letter.colorProgress = 1
      } else {
        letter.colorProgress = 0
      }
    }
  }, [smooth, getRandomChar, getRandomColor])
  const animate = useCallback(() => {
    // Skip updates when tab is hidden (no visible change, saves work)
    const docHidden = typeof document !== 'undefined' ? document.hidden : false
    const scheduleNext = () => {
      const isWebKit =
        typeof navigator !== 'undefined' &&
        navigator.userAgent.includes('WebKit') &&
        !navigator.userAgent.includes('Chrome')
      if (isWebKit) {
        timeoutIdRef.current = window.setTimeout(() => {
          rafIdRef.current = requestAnimationFrame(animate)
        }, 33)
      } else {
        rafIdRef.current = requestAnimationFrame(animate)
      }
    }

    if (docHidden) {
      scheduleNext()
      return
    }
    const now = Date.now()
    const dt = now - lastFrameTimeRef.current
    lastFrameTimeRef.current = now

    // Update letters at configured glitch cadence (incremental redraw)
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters()
      lastGlitchTime.current = now
    }

    // Smooth transitions: time-based; redraw only affected cells
    if (smooth) {
      const incrementPerSecond = 1.8 // ~0.03 per 16.67ms
      for (let i = 0; i < letters.current.length; i++) {
        const letter = letters.current[i]
        if (letter && letter.colorProgress < 1) {
          letter.colorProgress += (incrementPerSecond * dt) / 1000
          if (letter.colorProgress > 1) letter.colorProgress = 1

          const startRgb = hexToRgb(letter.color)
          const endRgb = hexToRgb(letter.targetColor)
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress)
            // Redraw only this cell
            const cols = Math.max(1, grid.current.columns)
            const x = (i % cols) * charWidth
            const y = Math.floor(i / cols) * charHeight
            if (context.current) {
              const ctx = context.current
              ctx.fillStyle = '#000000'
              ctx.fillRect(x, y, charWidth, charHeight)
              ctx.font = `${String(fontSize)}px 'JetBrains Mono', 'Courier New', monospace`
              ctx.textBaseline = 'top'
              ctx.fillStyle = letter.color || '#666666'
              ctx.fillText(letter.char || ' ', x, y)
            }
          }
        }
      }
    }

    scheduleNext()
  }, [glitchSpeed, smooth, updateLetters])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Temporarily disable OffscreenCanvas due to intermittent getContext race
    // conditions in some browsers when transferring control and re-rendering.
    // Main-thread rendering is fast enough for this effect.
    // const enableOffscreen = false
    // if (enableOffscreen && supportsOffscreen && import.meta.env.PROD) {
    //   try {
    //     const off = canvas.transferControlToOffscreen()
    //     // Mark as transferred immediately to prevent any main-thread fallback from
    //     // calling getContext() on a transferred canvas in case of subsequent errors
    //     transferredRef.current = true
    //     const worker = new Worker(new URL('./letter-glitch-worker.ts', import.meta.url), {
    //       type: 'module',
    //     })
    //     workerRef.current = worker

    //     const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    //     const parent = canvas.parentElement
    //     const rect = parent ? parent.getBoundingClientRect() : { width: 0, height: 0 }

    //     worker.postMessage(
    //       {
    //         type: 'init',
    //         canvas: off,
    //         width: rect.width,
    //         height: rect.height,
    //         dpr,
    //         glitchColors,
    //         glitchSpeed,
    //         smooth,
    //         fontSize,
    //         charWidth,
    //         charHeight,
    //       },
    //       [off as unknown as Transferable]
    //     )

    //     let resizeTimeout: number | undefined
    //     const handleResize = () => {
    //       if (resizeTimeout) window.clearTimeout(resizeTimeout)
    //       resizeTimeout = window.setTimeout(() => {
    //         const parent = canvas.parentElement
    //         if (!parent) return
    //         const rect = parent.getBoundingClientRect()
    //         const dpr = window.devicePixelRatio || 1
    //         worker.postMessage({ type: 'resize', width: rect.width, height: rect.height, dpr })
    //       }, 100)
    //     }
    //     window.addEventListener('resize', handleResize)

    //     return () => {
    //       window.removeEventListener('resize', handleResize)
    //       worker.terminate()
    //       workerRef.current = null
    //       transferredRef.current = false
    //     }
    //   } catch {
    //     // Fallback to main-thread path below
    //   }
    // }

    // Main-thread path
    if (!transferredRef.current) {
      context.current = canvas.getContext('2d')
    } else {
      // Canvas already transferred (e.g., dev StrictMode double-invoke). Skip main-thread path.
      return () => {
        if (workerRef.current) {
          workerRef.current.terminate()
          workerRef.current = null
        }
      }
    }
    resizeCanvas()
    lastFrameTimeRef.current = Date.now()
    animate()

    // Prefer ResizeObserver on the canvas parent for precise size changes
    const parent = canvas.parentElement
    let ro: ResizeObserver | null = null
    let resizeTimeout: number | undefined
    const debouncedResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
        resizeCanvas()
        animate()
      }, 100)
    }

    if (parent && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        debouncedResize()
      })
      ro.observe(parent)
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize, { passive: true })
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
      if (ro) ro.disconnect()
      else if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedResize as unknown as () => void)
      }
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [glitchSpeed, smooth, glitchColors, animate, resizeCanvas])

  return (
    <div className='relative w-full h-full bg-black overflow-hidden'>
      <canvas ref={canvasRef} className='block w-full h-full opacity-40' />
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
