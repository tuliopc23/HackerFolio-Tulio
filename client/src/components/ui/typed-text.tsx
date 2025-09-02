import { useEffect, useRef, useState, type ReactNode } from 'react'
import Typewriter from 'typewriter-effect'

interface TypedTextProps {
  strings: string[]
  typeSpeed?: number
  backSpeed?: number
  backDelay?: number
  startDelay?: number
  loop?: boolean
  showCursor?: boolean
  cursorChar?: string
  className?: string
  onComplete?: () => void
  onStringTyped?: (arrayPos: number) => void
  children?: ReactNode
  smartBackspace?: boolean
  shuffle?: boolean
  fadeOut?: boolean
  fadeOutClass?: string
  fadeOutDelay?: number
  bindInputFocusEvents?: boolean
  contentType?: 'html' | 'text'
  cursorClassName?: string
  loopCount?: number
  preStringTyped?: (arrayPos: number) => void
  resetCallback?: () => void
  stringsElement?: string
  stopped?: boolean
}

export function TypedText({
  strings,
  typeSpeed = 3,
  backSpeed = 25,
  backDelay = 500,
  startDelay = 0,
  loop = false,
  showCursor = true,
  cursorChar = '|',
  className = '',
  onComplete,
  onStringTyped,
  smartBackspace = true,
  shuffle = false,
  loopCount,
  preStringTyped,
  resetCallback,
  stopped = false,
}: TypedTextProps) {
  // Check if any string contains ANSI codes
  const hasAnsiCodes = strings.some(str => str.includes('\x1b['))

  // For typewriter-effect
  const elementRef = useRef<HTMLSpanElement>(null)
  const typewriterRef = useRef<InstanceType<typeof Typewriter> | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // If ANSI codes are present, skip typewriter-effect setup
    if (hasAnsiCodes || !elementRef.current || strings.length === 0) return

    const element = elementRef.current
    element.innerHTML = ''

    try {
      if (strings.length === 1) {
        const typewriter = new Typewriter(element, {
          autoStart: false,
          loop: false,
          delay: typeSpeed,
          cursor: showCursor ? cursorChar : '',
        })

        typewriter
          .pauseFor(startDelay)
          .typeString(strings[0] ?? '')
          .callFunction(() => {
            onComplete?.()
            resetCallback?.()
          })
          .start()

        typewriterRef.current = typewriter
      } else {
        const processedStrings = shuffle ? [...strings].sort(() => Math.random() - 0.5) : strings

        const typewriter = new Typewriter(element, {
          strings: processedStrings,
          autoStart: true,
          loop: loop && !loopCount,
          delay: typeSpeed,
          deleteSpeed: backSpeed,
          cursor: showCursor ? cursorChar : '',
        })

        if (onStringTyped || preStringTyped || onComplete) {
          typewriter.callFunction(() => {
            processedStrings.forEach((_, index) => {
              preStringTyped?.(index)
              onStringTyped?.(index)
            })
            if (!loop || loopCount) {
              onComplete?.()
            }
            resetCallback?.()
          })
        }

        typewriterRef.current = typewriter
      }

      setIsInitialized(true)
    } catch (_error) {
      element.textContent = strings[0] ?? ''
      onComplete?.()
    }

    return () => {
      if (typewriterRef.current) {
        try {
          typewriterRef.current.stop()
        } catch {
          // Ignore cleanup errors
        }
      }
      setIsInitialized(false)
    }
  }, [
    hasAnsiCodes,
    strings,
    typeSpeed,
    backSpeed,
    backDelay,
    startDelay,
    loop,
    showCursor,
    cursorChar,
    onComplete,
    onStringTyped,
    smartBackspace,
    shuffle,
    loopCount,
    preStringTyped,
    resetCallback,
  ])

  useEffect(() => {
    if (!hasAnsiCodes && isInitialized && typewriterRef.current) {
      try {
        if (stopped) {
          typewriterRef.current.stop()
        } else {
          typewriterRef.current.start()
        }
      } catch {
        // Ignore control errors
      }
    }
  }, [hasAnsiCodes, stopped, isInitialized])

  // If ANSI codes are present, use the original implementation
  if (hasAnsiCodes) {
    return (
      <TypedTextLegacy
        strings={strings}
        typeSpeed={typeSpeed}
        showCursor={showCursor}
        cursorChar={cursorChar}
        className={className}
        onComplete={onComplete}
        startDelay={startDelay}
      />
    )
  }

  return <span ref={elementRef} className={className} />
}

// Original implementation for ANSI-formatted text
function TypedTextLegacy({
  strings,
  typeSpeed = 8,
  showCursor = true,
  cursorChar = '|',
  className = '',
  onComplete,
  startDelay = 0,
}: {
  strings: string[]
  typeSpeed?: number
  showCursor?: boolean
  cursorChar?: string
  className?: string
  onComplete?: (() => void) | undefined
  startDelay?: number
}) {
  const [displayText, setDisplayText] = useState('')
  const [currentStringIndex, setCurrentStringIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (strings.length === 0) return

    const timer = setTimeout(
      () => {
        const currentString = strings[currentStringIndex] ?? ''

        if (currentCharIndex < currentString.length) {
          setDisplayText(currentString.slice(0, currentCharIndex + 1))
          setCurrentCharIndex(prev => prev + 1)
        } else if (currentStringIndex < strings.length - 1) {
          setCurrentStringIndex(prev => prev + 1)
          setCurrentCharIndex(0)
        } else {
          setIsComplete(true)
          onComplete?.()
        }
      },
      currentCharIndex === 0 ? startDelay : typeSpeed
    )

    return () => {
      clearTimeout(timer)
    }
  }, [currentStringIndex, currentCharIndex, strings, typeSpeed, startDelay, onComplete])

  return (
    <span className={className}>
      {displayText}
      {showCursor && !isComplete && <span className='animate-pulse'>{cursorChar}</span>}
    </span>
  )
}

// Simple animated text component using CSS animations
export function TypedTextAnimated({
  text,
  speed = 5,
  onComplete,
  className = '',
  startDelay = 0,
}: {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  startDelay?: number
}) {
  const [currentText, setCurrentText] = useState('')
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, startDelay)

    return () => {
      clearTimeout(timer)
    }
  }, [startDelay])

  useEffect(() => {
    if (!shouldAnimate) return

    let index = 0
    const timer = setInterval(() => {
      if (index <= text.length) {
        setCurrentText(text.slice(0, index))
        index++
      } else {
        clearInterval(timer)
        onComplete?.()
      }
    }, speed)

    return () => {
      clearInterval(timer)
    }
  }, [text, speed, onComplete, shouldAnimate])

  return <span className={className}>{currentText}</span>
}

// Multiline typewriter component
export function TypedTextMultiline({
  lines,
  lineDelay = 500,
  className = '',
}: {
  lines: string[]
  lineDelay?: number
  className?: string
}) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      setIsComplete(true)
      return
    }

    const timer = setTimeout(() => {
      setCurrentLineIndex((prev: number) => prev + 1)
    }, lineDelay)

    return () => {
      clearTimeout(timer)
    }
  }, [currentLineIndex, lines.length, lineDelay])

  if (isComplete) {
    return (
      <div className={className}>
        {lines.map(line => (
          <div key={`static-line-${line}-${line.length.toString()}`}>{line}</div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {lines.slice(0, currentLineIndex).map(line => (
        <div key={`completed-line-${line}-${line.length.toString()}`}>{line}</div>
      ))}
      {currentLineIndex < lines.length && (
        <TypedText
          strings={[lines[currentLineIndex] ?? '']}
          typeSpeed={5}
          showCursor={false}
          onComplete={() => {
            setCurrentLineIndex((prev: number) => prev + 1)
          }}
        />
      )}
    </div>
  )
}

// Staggered list animation
export function TypedTextStaggered({
  items,
  staggerDelay = 300,
  className = '',
}: {
  items: string[]
  staggerDelay?: number
  className?: string
}) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={`staggered-${item}-${index.toString()}`} className='fade-in-up'>
          <TypedText
            strings={[item]}
            typeSpeed={6}
            showCursor={false}
            startDelay={index * staggerDelay}
          />
        </div>
      ))}
    </div>
  )
}
