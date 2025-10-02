import { cloneElement, isValidElement, useEffect, useMemo, useState, type ReactNode } from 'react'

import { renderIcon } from '@/lib/icon-registry'
import { findIconTokens } from 'shared/iconography/parser'

interface TypedTerminalOutputProps {
  output: string
  isError?: boolean
  onComplete?: () => void
  animate?: boolean
  ariaHidden?: boolean
}

export function TypedTerminalOutput({
  output,
  isError = false,
  onComplete,
  animate = true,
  ariaHidden = false,
}: TypedTerminalOutputProps) {
  const [shouldAnimate, setShouldAnimate] = useState(animate)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setShouldAnimate(animate)
  }, [animate])

  // OPTIMIZATION: Memoize expensive ANSI parsing to avoid re-computation
  const formatOutput = useMemo((): ReactNode => {
    if (!output) return null

    // Hard cap to avoid rendering extremely large outputs accidentally
    const MAX_CHARS = 50_000
    let processedOutput = output
    if (processedOutput.length > MAX_CHARS) {
      processedOutput = processedOutput.slice(0, MAX_CHARS) + '\n\x1b[33m[truncated]\x1b[39m'
    }

    // ANSI parser for SGR codes (very small subset)
    const urlRegex = /(https?:\/\/[^\s]+)/g
    // eslint-disable-next-line no-control-regex -- ANSI escape codes require control characters
    const ANSI_PATTERN = new RegExp('\\x1b\\[([0-9;]+)m', 'g') // e.g., \x1b[31m or \x1b[1;32m
    // OSC 8 hyperlink pattern: \x1b]8;;url\x1b\\text\x1b]8;;\x1b\\
    /* eslint-disable no-control-regex */ // ANSI escape codes require control characters
    const OSC8_PATTERN = new RegExp(
      '\\x1b\\]8;;([^\\x1b]*)\\x1b\\\\([^\\x1b]*)\\x1b\\]8;;\\x1b\\\\',
      'g'
    )
    /* eslint-enable no-control-regex */

    interface StyleState {
      bold?: boolean
      italic?: boolean
      underline?: boolean
      large?: boolean
      fg?: string | null
      bg?: string | null
    }
    const initState = (): StyleState => ({
      bold: false,
      italic: false,
      underline: false,
      large: false,
      fg: null,
      bg: null,
    })

    const stateToClass = (s: StyleState) => {
      const classes: string[] = []
      if (s.bold) classes.push('ansi-bold')
      if (s.italic) classes.push('ansi-italic')
      if (s.underline) classes.push('ansi-underline')
      if (s.large) classes.push('ansi-large')
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
      if (code === 53) return { ...s, large: true }
      if (code === 55) return { ...s, large: false }
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

    const renderIconTokensInString = (text: string, keyBase: string): ReactNode[] => {
      const matches = findIconTokens(text)
      if (matches.length === 0) return [text]

      const nodes: ReactNode[] = []
      let cursor = 0

      const pushNode = (node: ReactNode) => {
        if (node === null || node === undefined || node === false) return
        if (Array.isArray(node)) {
          for (const child of node as ReactNode[]) {
            pushNode(child)
          }
          return
        }
        nodes.push(node)
      }

      matches.forEach(match => {
        const matchIndex = typeof match.index === 'number' ? match.index : cursor

        if (matchIndex > cursor) {
          nodes.push(text.slice(cursor, matchIndex))
        }
        if (match.iconKey) {
          const iconNode = renderIcon(match.iconKey, { label: match.label })
          if (isValidElement(iconNode)) {
            const iconKeySuffix = `${keyBase}-icon-${String(matchIndex)}-${match.rawKey}`
            nodes.push(cloneElement(iconNode, { key: iconKeySuffix }))
          } else {
            pushNode(iconNode)
          }
        } else {
          nodes.push(`[icon] ${match.label}`)
        }
        cursor = matchIndex + match.match.length
      })
      if (cursor < text.length) {
        nodes.push(text.slice(cursor))
      }
      return nodes
    }

    const pushWithIcons = (target: ReactNode[], text: string, keyBase: string) => {
      const segments = renderIconTokensInString(text, keyBase)
      segments.forEach(segment => {
        if (typeof segment === 'string') {
          if (segment.length > 0) target.push(segment)
        } else {
          target.push(segment)
        }
      })
    }

    const renderTextWithLinks = (text: string, baseKey: string) => {
      interface TextPart {
        type: 'text'
        value: string
        start: number
      }

      interface LinkPart {
        type: 'link'
        url: string
        start: number
      }

      const parts: Array<TextPart | LinkPart> = []
      let lastIndex = 0
      const matches = Array.from(text.matchAll(urlRegex))
      for (const match of matches) {
        const url = match[0]
        const index = typeof match.index === 'number' ? match.index : 0
        if (index > lastIndex) {
          parts.push({ type: 'text', value: text.slice(lastIndex, index), start: lastIndex })
        }
        parts.push({ type: 'link', url, start: index })
        lastIndex = index + url.length
      }
      if (lastIndex < text.length) {
        parts.push({ type: 'text', value: text.slice(lastIndex), start: lastIndex })
      }
      if (parts.length === 0) {
        parts.push({ type: 'text', value: text, start: 0 })
      }

      const result: ReactNode[] = []
      parts.forEach(part => {
        if (part.type === 'text') {
          pushWithIcons(result, part.value, `${baseKey}-text-${String(part.start)}`)
        } else {
          result.push(
            <a
              key={`${baseKey}-url-${String(part.start)}-${part.url}`}
              href={part.url}
              target='_blank'
              rel='noopener noreferrer'
              className='underline text-cyan-bright hover:text-cyan-soft focus:outline-none focus:ring-1 focus:ring-cyan-bright focus:ring-opacity-50 bg-transparent'
              aria-label={`External link: ${part.url}`}
            >
              {part.url}
            </a>
          )
        }
      })

      return result
    }

    const renderLine = (line: string, i: number) => {
      // First, parse OSC 8 hyperlinks and replace them with a placeholder
      interface HyperlinkInfo {
        url: string
        text: string
        placeholder: string
      }
      const hyperlinks: HyperlinkInfo[] = []
      let processedLine = line

      // Use matchAll to avoid infinite loop issues
      const hyperlinkMatches = Array.from(line.matchAll(OSC8_PATTERN))
      hyperlinkMatches.forEach((hyperlinkMatch, idx) => {
        const url = hyperlinkMatch[1] ?? ''
        const text = hyperlinkMatch[2] ?? ''
        const placeholder = `__HYPERLINK_${String(idx)}__`
        hyperlinks.push({ url, text, placeholder })
        processedLine = processedLine.replace(hyperlinkMatch[0], placeholder)
      })

      const segments: Array<{ text: string; classes: string; hyperlinks: HyperlinkInfo[] }> = []
      let lastIndex = 0
      let state = initState()
      let match: RegExpExecArray | null

      // Reset lastIndex before loop to ensure clean state
      ANSI_PATTERN.lastIndex = 0
      while ((match = ANSI_PATTERN.exec(processedLine)) !== null) {
        const idx = match.index
        if (idx > lastIndex) {
          segments.push({
            text: processedLine.slice(lastIndex, idx),
            classes: stateToClass(state),
            hyperlinks,
          })
        }
        const codes = match[1]?.split(';').map(n => Number(n || '0')) ?? []
        for (const code of codes) state = applyCode(state, code)
        const { lastIndex: newLastIndex } = ANSI_PATTERN
        lastIndex = newLastIndex
      }
      if (lastIndex < processedLine.length) {
        segments.push({
          text: processedLine.slice(lastIndex),
          classes: stateToClass(state),
          hyperlinks,
        })
      }

      const renderTextWithHyperlinks = (text: string, links: HyperlinkInfo[], baseKey: string) => {
        if (links.length === 0) {
          return renderTextWithLinks(text, baseKey)
        }

        const nodes: ReactNode[] = []
        let cursor = 0
        for (const link of links) {
          const placeholderIndex = text.indexOf(link.placeholder, cursor)
          if (placeholderIndex === -1) continue
          if (placeholderIndex > cursor) {
            pushWithIcons(
              nodes,
              text.slice(cursor, placeholderIndex),
              `${baseKey}-${link.placeholder}-pre`
            )
          }
          const children = renderIconTokensInString(
            link.text,
            `${baseKey}-${link.placeholder}-link`
          )
          nodes.push(
            <a
              key={`${baseKey}-${link.placeholder}-${link.url}`}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='underline text-cyan-bright hover:text-cyan-soft focus:outline-none focus:ring-1 focus:ring-cyan-bright focus:ring-opacity-50 bg-transparent'
              aria-label={`External link: ${link.url}`}
            >
              {children}
            </a>
          )
          cursor = placeholderIndex + link.placeholder.length
        }

        if (cursor < text.length) {
          pushWithIcons(nodes, text.slice(cursor), `${baseKey}-tail`)
        }

        return nodes.length > 0 ? nodes : renderTextWithLinks(text, `${baseKey}-fallback`)
      }

      return (
        <div key={`line-${String(i)}`} className='whitespace-pre-wrap break-words overflow-x-auto'>
          {segments.map((seg, k) => {
            const segmentKey = `segment-${String(i)}-${String(k)}`
            return (
              <span key={`${segmentKey}-${seg.text.slice(0, 10)}`} className={seg.classes}>
                {seg.hyperlinks.length > 0
                  ? renderTextWithHyperlinks(seg.text, seg.hyperlinks, segmentKey)
                  : renderTextWithLinks(seg.text, `${segmentKey}-text`)}
              </span>
            )
          })}
        </div>
      )
    }

    return processedOutput.split('\n').map((line, i) => renderLine(line, i))
  }, [output]) // Memoize based on output content

  // DISABLED: Custom typing animation for ANSI content
  useEffect(() => {
    // Always show full output immediately
    setIsTyping(false)
    onComplete?.()

    // Original typing animation logic commented out
    /*
    if (!shouldAnimate || !output) {
      setDisplayedOutput(output)
      onComplete?.()
      return
    }

    setIsTyping(true)
    setDisplayedOutput('')

    let currentIndex = 0
    const effectiveTypeSpeed = output.includes('\x1b[') ? Math.max(typeSpeed, 1) : typeSpeed

    const timer = setInterval(() => {
      if (currentIndex <= output.length) {
        setDisplayedOutput(output.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(timer)
        setIsTyping(false)
        onComplete?.()
      }
    }, effectiveTypeSpeed)

    return () => {
      clearInterval(timer)
      setIsTyping(false)
    }
    */
  }, [output, onComplete]) // Simplified dependencies

  // If animation is disabled, render directly
  if (!shouldAnimate) {
    return (
      <div
        className={`ml-4 terminal-body ${isError ? 'text-terminal-red' : 'text-[rgba(235,241,255,0.9)]'}`}
        aria-hidden={ariaHidden}
      >
        {formatOutput}
      </div>
    )
  }

  return (
    <div
      className={`ml-4 terminal-body ${isError ? 'text-terminal-red' : 'text-[rgba(235,241,255,0.9)]'}`}
      aria-hidden={ariaHidden}
    >
      {formatOutput}
      {isTyping && <span className='animate-pulse'>|</span>}
    </div>
  )
}

export default TypedTerminalOutput
