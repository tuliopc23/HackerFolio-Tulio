import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import './loading-screen.css'
import { MACINTOSH_ASCII } from '../assets/ascii/macintosh'

// WebKit detection for performance optimizations
const isWebkit = () => {
  return (
    typeof window !== 'undefined' &&
    navigator.userAgent.includes('WebKit') &&
    !navigator.userAgent.includes('Chrome')
  )
}

export interface LoadingScreenProps {
  onComplete: () => void
}

// Overall loading duration tuned to 3 seconds for a snappier handoff
const DURATION_MS = 3000

const CONNECTING_FRAMES = ['CONNECTING', 'CONNECTING.', 'CONNECTING..', 'CONNECTING...'] as const
const CONNECTING_FRAME_INTERVAL_MS = 280

// Connection sequence messages
const CONNECTION_MESSAGES = [
  '> Establishing secure connection to HackerFolio v2.0...',
  '> SSH protocol handshake initiated',
  '> Authenticating with portfolio.dev server',
  '> Loading encrypted user credentials',
  '> Mounting remote filesystem /home/tulio',
  '> Initializing terminal environment',
  '> Portfolio interface ready',
]

/**
 * LoadingScreen displays vintage Macintosh ASCII art alongside an SSH-style
 * connection log. It runs for a fixed three-second window before invoking
 * onComplete so the app can hydrate behind the scenes.
 *
 * Enhanced with terminal aesthetics including CRT scanlines, phosphor glow,
 * SSH-style connection messages, and the Oxocarbon color palette.
 */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [connectingFrameIndex, setConnectingFrameIndex] = useState(0)
  const doneRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  const progressValue = Math.min(
    100,
    Math.round((currentMessageIndex / Math.max(CONNECTION_MESSAGES.length - 1, 1)) * 100)
  )

  // Adjust animation speeds for WebKit performance
  const typewriterSpeed = isWebkit() ? 25 : 15
  const blinkSpeed = isWebkit() ? 800 : 600

  useEffect(() => {
    if (typeof window === 'undefined') return

    const interval = window.setInterval(() => {
      setConnectingFrameIndex(prev => (prev + 1) % CONNECTING_FRAMES.length)
    }, CONNECTING_FRAME_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Connection message sequence
    const messageTimeouts: number[] = []
    const typeIntervals: number[] = []
    const startMessageSequence = () => {
      const showMessage = (index: number) => {
        if (index >= CONNECTION_MESSAGES.length) return

        const message = CONNECTION_MESSAGES[index] ?? ''
        setCurrentMessageIndex(index)
        let charIndex = 0

        // Typewriter effect
        const typeInterval = window.setInterval(() => {
          if (charIndex <= message.length) {
            setCurrentMessage(message.slice(0, charIndex))
            charIndex++
          } else {
            window.clearInterval(typeInterval)
            // Show next message after a shorter delay
            messageTimeouts.push(
              window.setTimeout(() => {
                showMessage(index + 1)
              }, 150)
            )
          }
        }, typewriterSpeed)

        typeIntervals.push(typeInterval)
      }

      // Start first message after a brief delay
      messageTimeouts.push(
        window.setTimeout(() => {
          showMessage(0)
        }, 500)
      )
    }

    startMessageSequence()

    // Cursor blinking effect - reduced frequency for WebKit
    const cursorInterval = window.setInterval(() => {
      setShowCursor(prev => !prev)
    }, blinkSpeed)

    // Trigger completion at the configured duration - guarantees timing
    timeoutRef.current = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        onComplete()
      }
    }, DURATION_MS)

    return () => {
      messageTimeouts.forEach(window.clearTimeout)
      typeIntervals.forEach(window.clearInterval)
      window.clearInterval(cursorInterval)
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [onComplete, typewriterSpeed, blinkSpeed])

  return (
    <div className='loading-root crt-screen' data-testid='loading-root'>
      {/* CRT Scanlines Effect */}
      <div className='crt-scanlines' />

      <motion.pre
        className='ascii'
        role='img'
        aria-label='Vintage Macintosh'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {MACINTOSH_ASCII}
      </motion.pre>

      {/* Connection Messages */}
      <motion.div
        className='connection-terminal'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className='terminal-header'>
          <span className='terminal-title'>
            <span className='text-cyan-bright'>root@hackerfolio</span>
            <span className='text-magenta-bright'>:</span>
            <span className='text-[#42be65]'>~</span>
            <span className='text-cyan-bright'>$</span>
          </span>
        </div>
        <div className='message-container'>
          {CONNECTION_MESSAGES.map((msg, index) => (
            <div
              key={`message-${String(index)}`}
              className={`message-line ${index <= currentMessageIndex ? 'visible' : 'hidden'}`}
            >
              {index === currentMessageIndex ? (
                <>
                  <span className='message-text'>{currentMessage}</span>
                  {showCursor && index < CONNECTION_MESSAGES.length - 1 && (
                    <span className='terminal-cursor'>_</span>
                  )}
                </>
              ) : index < currentMessageIndex ? (
                <>
                  <span className='message-text completed'>{msg}</span>
                  <span className='status-ok'>✓</span>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className='loading-indicator'
        role='progressbar'
        aria-live='polite'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressValue}
        data-testid='progress'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <span className='loading-text' data-testid='bar'>
          {CONNECTING_FRAMES[connectingFrameIndex]}
        </span>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
