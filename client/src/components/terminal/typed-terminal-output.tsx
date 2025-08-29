import { useState, useEffect, type ReactNode } from 'react'

import { TypedText } from '@/components/ui/typed-text'

interface TypedTerminalOutputProps {
  output: string
  isError?: boolean
  onComplete?: () => void
  typeSpeed?: number
  animate?: boolean
}

export function TypedTerminalOutput({
  output,
  isError = false,
  onComplete,
  typeSpeed = 30,
  animate = true,
}: TypedTerminalOutputProps) {
  const [shouldAnimate, setShouldAnimate] = useState(animate)

  useEffect(() => {
    setShouldAnimate(animate)
  }, [animate])

  const formatOutput = (output: string): ReactNode => {
    if (!output) return null

    // Hard cap to avoid rendering extremely large outputs accidentally
    const MAX_CHARS = 50_000
    if (output.length > MAX_CHARS) {
      output = output.slice(0, MAX_CHARS) + '\n\x1b[33m[truncated]\x1b[39m'
    }

    // ANSI parser for SGR codes (very small subset)
    const urlRegex = /(https?:\/\/[^\s]+)/g
    // eslint-disable-next-line no-control-regex
    const ANSI_PATTERN = new RegExp('\\x1b\\[([0-9;]+)m', 'g') // e.g., \x1b[31m or \x1b[1;32m

    interface StyleState {
      bold?: boolean
      italic?: boolean
      underline?: boolean
      fg?: string | null
      bg?: string | null
    }
    const initState = (): StyleState => ({
      bold: false,
      italic: false,
      underline: false,
      fg: null,
      bg: null,
    })

    const stateToClass = (s: StyleState) => {
      const classes: string[] = []
      if (s.bold) classes.push('ansi-bold')
      if (s.italic) classes.push('ansi-italic')
      if (s.underline) classes.push('ansi-underline')
      if (s.fg) classes.push(`ansi-fg-${s.fg}`)
      if (s.bg) classes.push(`ansi-bg-${s.bg}`)
      return classes.join(' ')
    }

    const applyCode = (s: StyleState, code: number) => {
      if (code === 0) return initState() // reset
      if (code === 1) return { ...s, bold: true }
      if (code === 3) return { ...s, italic: true }
      if (code === 4) return { ...s, underline: true }
      if (code === 22) return { ...s, bold: false }
      if (code === 23) return { ...s, italic: false }
      if (code === 24) return { ...s, underline: false }
      if (code === 39) return { ...s, fg: null }
      if (code === 49) return { ...s, bg: null }
      const fgMap: Record<number, string> = {
        30: 'black',
        31: 'red',
        32: 'green',
        33: 'yellow',
        34: 'blue',
        35: 'magenta',
        36: 'cyan',
        37: 'white',
        90: 'bright-black',
        91: 'bright-red',
        92: 'bright-green',
        93: 'bright-yellow',
        94: 'bright-blue',
        95: 'bright-magenta',
        96: 'bright-cyan',
        97: 'bright-white',
      }
      const bgMap: Record<number, string> = {
        40: 'black',
        41: 'red',
        42: 'green',
        43: 'yellow',
        44: 'blue',
        45: 'magenta',
        46: 'cyan',
        47: 'white',
        100: 'bright-black',
        101: 'bright-red',
        102: 'bright-green',
        103: 'bright-yellow',
        104: 'bright-blue',
        105: 'bright-magenta',
        106: 'bright-cyan',
        107: 'bright-white',
      }
      if (fgMap[code]) return { ...s, fg: fgMap[code] }
      if (bgMap[code]) return { ...s, bg: bgMap[code] }
      return s
    }

    const renderTextWithLinks = (text: string) => {
      const parts: Array<string | { url: string }> = []
      let lastIndex = 0
      const matches = Array.from(text.matchAll(urlRegex))
      for (const match of matches) {
        const url = match[0]
        const index = match.index || 0
        if (index > lastIndex) parts.push(text.slice(lastIndex, index))
        parts.push({ url })
        lastIndex = index + url.length
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex))
      if (parts.length === 0) parts.push(text)
      return parts.map((p, j) =>
        typeof p === 'string' ? (
          <span key={`text-${String(j)}-${p.slice(0, 10)}`}>{p}</span>
        ) : (
          <a
            key={`url-${String(j)}-${p.url}`}
            href={p.url}
            target='_blank'
            rel='noopener noreferrer'
            className='underline text-cyan-bright focus:outline-none focus:ring-2 focus:ring-cyan-bright focus:ring-opacity-50 rounded'
            aria-label={`External link: ${p.url}`}
          >
            {p.url}
          </a>
        )
      )
    }

    const renderLine = (line: string, i: number) => {
      const segments: Array<{ text: string; classes: string }> = []
      let lastIndex = 0
      let state = initState()
      let match: RegExpExecArray | null
      while ((match = ANSI_PATTERN.exec(line)) !== null) {
        const { index: idx } = match
        if (idx > lastIndex) {
          segments.push({ text: line.slice(lastIndex, idx), classes: stateToClass(state) })
        }
        const codes = match[1]?.split(';').map(n => Number(n || '0')) ?? []
        for (const code of codes) state = applyCode(state, code)
        const { lastIndex: newLastIndex } = ANSI_PATTERN
        lastIndex = newLastIndex
      }
      if (lastIndex < line.length) {
        segments.push({ text: line.slice(lastIndex), classes: stateToClass(state) })
      }

      return (
        <div key={`line-${String(i)}`} className='whitespace-pre-wrap'>
          {segments.map((seg, k) => (
            <span
              key={`segment-${String(i)}-${String(k)}-${seg.text.slice(0, 10)}`}
              className={seg.classes}
            >
              {renderTextWithLinks(seg.text)}
            </span>
          ))}
        </div>
      )
    }

    return output.split('\n').map((line, i) => renderLine(line, i))
  }

  const handleComplete = () => {
    setShouldAnimate(false)
    onComplete?.()
  }

  // If animation is disabled, render directly
  if (!shouldAnimate) {
    return (
      <div
        className={`ml-4 mb-2 ${isError ? 'text-terminal-red' : 'text-[rgba(235,241,255,0.9)]'}`}
      >
        {formatOutput(output)}
      </div>
    )
  }

  // For complex ANSI-formatted outputs, use slower typing speed
  const effectiveTypeSpeed = output.includes('\x1b[') ? Math.max(typeSpeed, 15) : typeSpeed

  return (
    <div className={`ml-4 mb-2 ${isError ? 'text-terminal-red' : 'text-[rgba(235,241,255,0.9)]'}`}>
      <TypedText
        strings={[output]}
        typeSpeed={effectiveTypeSpeed}
        showCursor={false}
        onComplete={handleComplete}
      />
    </div>
  )
}

export default TypedTerminalOutput
