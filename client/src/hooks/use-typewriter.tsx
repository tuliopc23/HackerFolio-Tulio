import { useState, useEffect, useCallback, useMemo } from 'react'

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

  const memoizedText = useMemo(() => text, [text])

  const updateText = useCallback(() => {
    if (currentIndex < memoizedText.length) {
      setDisplayText(prev => prev + (memoizedText[currentIndex] ?? ''))
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsComplete(true)

      if (loop) {
        setTimeout(() => {
          setDisplayText('')
          setCurrentIndex(0)
          setIsComplete(false)
        }, 2000)
      }
    }
  }, [currentIndex, memoizedText, loop])

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text)
      setIsComplete(true)
      return
    }

    if (currentIndex < memoizedText.length) {
      const timeout = setTimeout(updateText, currentIndex === 0 ? delay : speed)
      return () => {
        clearTimeout(timeout)
      }
    }
    return undefined
  }, [currentIndex, memoizedText, speed, delay, enabled, updateText, text])

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
