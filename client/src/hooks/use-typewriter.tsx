import { useState, useEffect, useCallback } from 'react'

interface UseTypewriterOptions {
  text: string
}

function useTypewriter({ text }: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // DISABLED: Show full text immediately
    setDisplayText(text)
    setIsComplete(true)

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
  className = '',
  onComplete,
}: UseTypewriterOptions & {
  className?: string
  onComplete?: () => void
}) {
  const { displayText, isComplete } = useTypewriter({ text })

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
