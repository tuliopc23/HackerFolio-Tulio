import { useEffect, useState } from 'react'

interface TypedTextProps {
  strings: string[]
  typeSpeed?: number
  startDelay?: number
  showCursor?: boolean
  cursorChar?: string
  className?: string
  onComplete?: () => void
  onStringTyped?: (arrayPos: number) => void
}

export function TypedText({
  strings,
  typeSpeed = 15,
  startDelay = 0,
  showCursor = true,
  cursorChar = '|',
  className = '',
  onComplete,
  onStringTyped,
}: TypedTextProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [showCursorState, setShowCursorState] = useState(true)

  useEffect(() => {
    if (strings.length === 0) return

    // DISABLED: Show full text immediately
    const message = strings[0] ?? ''
    setCurrentMessage(message)
    onStringTyped?.(0)
    onComplete?.()
    return

    // Original typewriter logic commented out
    /*
    const startTyping = () => {
      const message = strings[0] ?? ''
      let charIndex = 0

      // Typewriter effect - EXACTLY like LoadingScreen
      const typeInterval = setInterval(() => {
        if (charIndex <= message.length) {
          setCurrentMessage(message.slice(0, charIndex))
          charIndex++
        } else {
          clearInterval(typeInterval)
          onStringTyped?.(0)
          onComplete?.()
        }
      }, typeSpeed) // Use the typeSpeed prop

      return () => {
        clearInterval(typeInterval)
      }
    }

    if (startDelay > 0) {
      const timeout = setTimeout(() => {
        const cleanup = startTyping()
        return cleanup
      }, startDelay)
      return () => {
        clearTimeout(timeout)
      }
    } else {
      return startTyping()
    }
    */
  }, [strings, onStringTyped, onComplete]) // Removed typeSpeed and startDelay

  // DISABLED: Cursor blinking effect
  useEffect(() => {
    setShowCursorState(true) // Always show cursor
    return

    // Original cursor blinking logic commented out
    /*
    const cursorInterval = setInterval(() => {
      setShowCursorState(prev => !prev)
    }, 600)

    return () => {
      clearInterval(cursorInterval)
    }
    */
  }, [])

  return (
    <span className={className}>
      {currentMessage}
      {showCursor && showCursorState && <span className='animate-pulse'>{cursorChar}</span>}
    </span>
  )
}
