import { useState, useEffect } from 'react'

import LetterGlitchBackground from '@/components/ui/letter-glitch-bg'

export default function DesktopBackground() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const formatTime = (time: Date) => {
    try {
      return time.toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: 'America/Sao_Paulo',
      })
    } catch {
      // Fallback to basic time format on error
      return time.toTimeString().slice(0, 8)
    }
  }

  return (
    <div className='fixed inset-0 bg-black overflow-hidden'>
      {/* LetterGlitch Animated Background */}
      <div className='absolute inset-0'>
        <LetterGlitchBackground glitchSpeed={100} smooth outerVignette centerVignette={false} />
      </div>

      {/* Desktop Icons Area */}
      <div className='absolute top-2 left-2 space-y-4 z-50'>{/* Icons removed */}</div>

      {/* Desktop Status Bar */}
      <div className='absolute bottom-0 left-0 right-0 bg-[#0a0a0a] bg-opacity-80 border-t border-[#393939] backdrop-blur-sm contain-paint overflow-hidden isolate'>
        <div className='px-6 py-2 flex items-center justify-between'>
          {/* Left side - System status */}
          <div className='flex items-center gap-4 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-cyan-soft animate-pulse shadow-[0_0_6px_rgba(130,207,255,0.6)]' />
              <span className='text-[color:var(--ansi-2)] font-medium phosphor-glow'>
                System Online
              </span>
            </div>
            <div className='text-[#f2f4f8]'>
              <span className='text-[#f2f4f8]'>CPU:</span>
              <span className='text-[color:var(--ansi-2)] ml-1 phosphor-glow'>23%</span>
              <span className='text-[#393939] mx-2'>•</span>
              <span className='text-[#f2f4f8]'>RAM:</span>
              <span className='text-[color:var(--ansi-6)] ml-1 phosphor-glow'>4.2GB</span>
              <span className='text-[#393939] mx-2'>•</span>
              <span className='text-[#f2f4f8]'>Network:</span>
              <span className='text-[color:var(--ansi-6)] ml-1 phosphor-glow'>Active</span>
            </div>
          </div>

          {/* Right side - Clock */}
          <div className='flex items-center gap-4 text-xs'>
            <div
              className='text-cyan-bright font-mono font-semibold glow-soft'
              suppressHydrationWarning
            >
              {formatTime(currentTime)}
            </div>
            <div className='text-[#f2f4f8]' suppressHydrationWarning>
              {currentTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
