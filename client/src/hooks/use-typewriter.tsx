import { useState, useEffect, useCallback } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number
  delay?: number
  loop?: boolean
  enabled?: boolean
}

function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  loop = false,
  enabled = true,
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // DISABLED: Show full text immediately
    setDisplayText(text)
    setIsComplete(true)
    return

    // Original typewriter logic commented out
    /*
    if (!enabled || text.length === 0) {
      setDisplayText(text)
      setIsComplete(true)
      return
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(prev => prev + 1)
      }, delay + speed)

      return () => {
        clearTimeout(timeout)
      }
    } else {
      setIsComplete(true)
      if (loop) {
        const timeout = setTimeout(() => {
          setCurrentIndex(0)
          setDisplayText('')
          setIsComplete(false)
        }, 1000)
        return () => {
          clearTimeout(timeout)
        }
      }
    }

    return undefined
    */
  }, [text]) // Simplified dependencies

  return { displayText, isComplete }
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  enabled = true,
  onComplete,
}: UseTypewriterOptions & {
  className?: string
  onComplete?: () => void
}) {
  const { displayText, isComplete } = useTypewriter({ text, speed, delay, enabled })

  const memoizedOnComplete = useCallback(() => {
    if (onComplete) onComplete()
  }, [onComplete])

  useEffect(() => {
    if (isComplete && onComplete) {
      memoizedOnComplete()
    }
  }, [isComplete, memoizedOnComplete, onComplete])

  return <span className={className}>{displayText}</span>
}
