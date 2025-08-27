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
      <div className='absolute top-2 left-2 space-y-4 z-50'>
        {/* macOS System Icon */}
        <div className='flex flex-col items-center gap-1 p-2 rounded hover:bg-magenta-soft hover:bg-opacity-10 transition-colors cursor-pointer group'>
          <div className='w-12 h-12 border-2 border-magenta-soft rounded bg-lumon-bg bg-opacity-50 flex items-center justify-center'>
            {/* Apple Logo */}
            <svg
              viewBox='0 0 24 24'
              className='w-6 h-6 text-magenta-bright fill-current'
              aria-label='Apple logo'
            >
              <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
            </svg>
          </div>
          <div className='text-center'>
            <div className='text-text-soft text-xs group-hover:text-magenta-bright transition-colors shadow-[0_0_8px_rgba(255,0,255,0.3)] group-hover:shadow-[0_0_12px_rgba(255,0,255,0.6)] text-shadow-sm'>
              macOS
            </div>
            <div className='text-text-soft text-xs group-hover:text-magenta-bright transition-colors shadow-[0_0_8px_rgba(255,0,255,0.3)] group-hover:shadow-[0_0_12px_rgba(255,0,255,0.6)] text-shadow-sm'>
              System
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Status Bar */}
      <div className='absolute bottom-0 left-0 right-0 bg-lumon-bg bg-opacity-80 border-t border-magenta-soft backdrop-blur-sm'>
        <div className='px-6 py-2 flex items-center justify-between'>
          {/* Left side - System status */}
          <div className='flex items-center gap-4 text-xs text-text-soft'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-terminal-green animate-pulse' />
              <span>System Online</span>
            </div>
            <div>CPU: 23% • RAM: 4.2GB • Network: Active</div>
          </div>

          {/* Right side - Clock */}
          <div className='flex items-center gap-4 text-xs'>
            <div className='text-magenta-bright font-mono'>{formatTime(currentTime)}</div>
            <div className='text-text-soft'>
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
