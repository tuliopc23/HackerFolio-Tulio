import { useEffect, useState, type ReactNode } from 'react'

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

// Simple typewriter implementation as fallback
export function TypedText({
  strings,
  typeSpeed = 50,
  showCursor = true,
  cursorChar = '|',
  className = '',
  onComplete,
  startDelay = 0,
}: TypedTextProps) {
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

// Simple animated text component
export function TypedTextAnimated({
  text,
  speed = 50,
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
      setCurrentLineIndex(prev => prev + 1)
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
          typeSpeed={30}
          showCursor={false}
          onComplete={() => {
            setCurrentLineIndex(prev => prev + 1)
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
            typeSpeed={40}
            showCursor={false}
            startDelay={index * staggerDelay}
          />
        </div>
      ))}
    </div>
  )
}
