import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

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

// Exactly 4 seconds as required - controls overall loading duration
const DURATION_MS = 4000

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
 * LoadingScreen displays vintage Macintosh ASCII art with a progress bar
 * that completes in exactly 4 seconds, then calls onComplete.
 *
 * Enhanced with terminal aesthetics including CRT scanlines, phosphor glow,
 * SSH-style connection messages, and the Oxocarbon color palette.
 */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [ariaNow, setAriaNow] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const progress = useMotionValue(0)
  const scaleX = useTransform(progress, v => v / 100)
  const doneRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  // Adjust animation speeds for WebKit performance
  const typewriterSpeed = isWebkit() ? 25 : 15
  const blinkSpeed = isWebkit() ? 800 : 600

  useEffect(() => {
    // Animate progress from 0 to 100 linearly over exactly 4 seconds
    const controls = animate(progress, 100, {
      duration: DURATION_MS / 1000,
      ease: 'linear',
      onUpdate: v => {
        setAriaNow(Math.round(v))
      },
    })

    // Connection message sequence
    let messageTimeout: number
    const startMessageSequence = () => {
      const showMessage = (index: number) => {
        if (index >= CONNECTION_MESSAGES.length) return

        const message = CONNECTION_MESSAGES[index] ?? ''
        setCurrentMessageIndex(index)
        let charIndex = 0

        // Typewriter effect
        const typeInterval = setInterval(() => {
          if (charIndex <= message.length) {
            setCurrentMessage(message.slice(0, charIndex))
            charIndex++
          } else {
            clearInterval(typeInterval)
            // Show next message after a shorter delay
            messageTimeout = window.setTimeout(() => {
              showMessage(index + 1)
            }, 150)
          }
        }, typewriterSpeed)
      }

      // Start first message after a brief delay
      messageTimeout = window.setTimeout(() => {
        showMessage(0)
      }, 500)
    }

    startMessageSequence()

    // Cursor blinking effect - reduced frequency for WebKit
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, blinkSpeed)

    // Trigger completion exactly at 4000ms - this guarantees timing
    timeoutRef.current = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        onComplete()
      }
    }, DURATION_MS)

    return () => {
      controls.stop()
      clearTimeout(messageTimeout)
      clearInterval(cursorInterval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [onComplete, progress, typewriterSpeed, blinkSpeed])

  return (
    <div className='loading-root crt-screen' data-testid='loading-root'>
      {/* CRT Scanlines Effect */}
      <div className='crt-scanlines' />

      <motion.pre
        className='ascii phosphor-glow'
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
            <span className='text-green-400'>~</span>
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

      <div
        className='progress'
        role='progressbar'
        aria-label='Loading'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaNow}
        data-testid='progress'
      >
        <div className='track' aria-hidden='true' />
        <motion.div
          className='bar'
          style={{ scaleX, transformOrigin: 'left' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
          aria-hidden='true'
          data-testid='bar'
        />
        <div className='progress-glow' style={{ width: `${String(ariaNow)}%` }} />
      </div>

      {/* Loading percentage indicator */}
      <motion.div
        className='loading-indicator'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <span className='loading-text'>
          <span className='text-cyan-bright'>CONNECTING</span>
          <span className='text-magenta-bright ml-2'>[{ariaNow}%]</span>
        </span>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
