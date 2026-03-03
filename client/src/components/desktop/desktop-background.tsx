import { useState, useEffect } from 'react'

import PortfolioMarketingOverlay from '@/components/desktop/portfolio-marketing-overlay'
import LetterGlitchBackground from '@/components/ui/letter-glitch-bg'

interface DesktopBackgroundProps {
  onOpenTerminal?: () => void
}

export default function DesktopBackground({ onOpenTerminal }: DesktopBackgroundProps) {
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
    <div className='fixed inset-0 overflow-hidden bg-[#05060d]'>
      <div className='mesh-aura absolute inset-0' aria-hidden='true' />

      {/* LetterGlitch Animated Background */}
      <div className='absolute inset-0 opacity-70' aria-hidden='true'>
        <LetterGlitchBackground glitchSpeed={100} smooth outerVignette centerVignette={false} />
      </div>

      <div className='grain-overlay absolute inset-0' aria-hidden='true' />

      <PortfolioMarketingOverlay onOpenTerminal={onOpenTerminal} />

      {/* Desktop Icons Area */}
      <div className='absolute top-2 left-2 space-y-4 z-50'>{/* Icons removed */}</div>

      {/* Desktop Status Bar */}
      <div className='absolute bottom-0 left-0 right-0 isolate overflow-hidden border-t border-white/10 bg-[#070910]/85 backdrop-blur-md contain-paint'>
        <div className='px-6 py-2 flex items-center justify-between'>
          {/* Left side - System status */}
          <div className='flex items-center gap-4 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-[#7dd3fc] shadow-[0_0_8px_rgba(125,211,252,0.7)]' />
              <span className='font-ui font-semibold text-[#dbeafe]'>Portfolio Live</span>
            </div>
            <div className='font-ui text-slate-200'>
              <span>Build:</span>
              <span className='ml-1 text-fuchsia-200'>Marketing Ready</span>
              <span className='mx-2 text-slate-500'>•</span>
              <span>Mode:</span>
              <span className='ml-1 text-cyan-200'>Interactive Terminal</span>
            </div>
          </div>

          {/* Right side - Clock */}
          <div className='flex items-center gap-4 text-xs'>
            <div className='font-ui font-semibold text-cyan-200' suppressHydrationWarning>
              {formatTime(currentTime)}
            </div>
            <div className='font-ui text-slate-300' suppressHydrationWarning>
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
