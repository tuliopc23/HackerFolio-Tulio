import { useState, useEffect } from 'react'

import { TypewriterText } from '@/hooks/use-typewriter'

export default function SystemInfoPane() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFastfetch, setShowFastfetch] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    // Trigger fastfetch display after component mounts
    const timeout = setTimeout(() => {
      setShowFastfetch(true)
    }, 500)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const fastfetchOutput = `tuliopinheirocunha@MacBook-Pro
────────────────────────────────────────
OS: macOS Tahoe 26.0 ARM64
Host: MacBook Pro (14-inch, 2023)
Kernel: Darwin 25.0.0
Uptime: 10 hours, 59 mins
Packages: 228 (brew), 101 (brew-cask)
Shell: fish 4.0.2
Resolution: 3024x1964 @ 120 Hz
DE: Aqua
WM: Quartz Compositor 341.0.1
WM Theme: Multicolor (Light)
Font: .AppleSystemUIFont [System], Helvetica [User]
Cursor: Fill - Black, Outline - White (32px)
Terminal: iTerm2
CPU: Apple M2 Pro (10) @ 3.50 GHz
GPU: Apple M2 Pro (16) @ 1.40 GHz [Integrated]
Memory: 16.57 GiB / 16.00 GiB (66%)
Swap: Disabled
Disk (/): 215.8B GiB / 460.40 GiB (47%) - apfs [Read-only]
Local IP (en0): 192.168.0.3/24`

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
    <div
      className='h-full flex flex-col font-mono text-[12.5px] leading-[1.5] text-[rgba(235,241,255,0.9)]'
      aria-label='System Information'
    >
      <div className='flex-1 overflow-y-auto'>
        {/* Current Time */}
        <div className='space-y-2 mb-4'>
          <div className='text-magenta-bright text-xs font-medium tracking-wide'>LOCAL TIME</div>
          <div className='text-cyan-bright text-lg font-mono font-semibold'>
            {formatTime(currentTime)}
          </div>
          <div className='text-text-soft text-xs opacity-70'>
            {currentTime.toLocaleDateString('en-US', {
              timeZoneName: 'short',
              timeZone: 'America/Sao_Paulo',
            })}{' '}
            | São Paulo
          </div>
        </div>

        {/* Fastfetch Output */}
        {showFastfetch && (
          <div className='space-y-2'>
            <div className='text-magenta-bright text-xs font-medium tracking-wide'>SYSTEM INFO</div>
            <div className='bg-black/30 border border-[rgba(122,0,255,0.25)] rounded-lg p-3 text-xs text-cyan-bright font-mono'>
              <TypewriterText
                text={
                  fastfetchOutput.split('\n').slice(0, 8).join('\n') +
                  '\n[Details truncated for privacy]'
                }
                speed={15}
                enabled
                className='whitespace-pre-line'
              />
            </div>
          </div>
        )}

        {/* Network Status */}
        <div className='space-y-2 mt-4'>
          <div className='text-magenta-bright text-xs font-medium tracking-wide'>
            SSH CONNECTION
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 rounded-full bg-terminal-green animate-pulse' />
            <span className='text-terminal-green text-xs font-semibold'>ONLINE</span>
          </div>
          <div className='text-xs text-text-soft opacity-70'>Network: 1Gbps ↓ / 100Mbps ↑</div>
        </div>
      </div>
    </div>
  )
}
