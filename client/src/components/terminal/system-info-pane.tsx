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
[Details truncated for privacy]`

  const formatSystemInfo = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.includes('────')) {
        return <div key={index} className="text-magenta-soft">{line}</div>
      }
      
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const label = line.substring(0, colonIndex + 1)
        const value = line.substring(colonIndex + 1).trim()
        return (
          <div key={index}>
            <span className="text-magenta-bright font-semibold">{label}</span>
            <span className="text-cyan-bright ml-1">{value}</span>
          </div>
        )
      }
      
      // Header line - username@hostname
      if (index === 0 && line.includes('@')) {
        const atIndex = line.indexOf('@')
        const username = line.substring(0, atIndex)
        const hostname = line.substring(atIndex)
        return (
          <div key={index} className="font-bold">
            <span className="text-magenta-bright">{username}</span>
            <span className="text-cyan-bright">{hostname}</span>
          </div>
        )
      }
      
      // Other header content
      if (index === 0) {
        return <div key={index} className="text-cyan-bright font-bold">{line}</div>
      }
      
      return <div key={index} className="text-cyan-bright">{line}</div>
    })
  }

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
            <div className='flex gap-3'>
              {/* Main System Info Card */}
              <div className='flex-1 bg-black/30 border border-[rgba(122,0,255,0.25)] rounded-lg p-3 text-xs text-cyan-bright font-mono'>
                <div className='flex gap-4'>
                  {/* Apple ASCII Art - Left Side */}
                  <div className='flex-shrink-0'>
                    <div className='font-mono text-[8px] leading-[1.1]'>
                      <pre className='text-white whitespace-pre drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)] transition-all duration-300'>
{`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⡿⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣠⣤⣤⣤⣀⣀⠈⠋⠉⣁⣠⣤⣤⣤⣀⡀⠀⠀
⠀⢠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀
⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀
⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣀
⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁
⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠀
⠀⠀⠀⠈⠙⢿⣿⣿⣿⠿⠟⠛⠻⠿⣿⣿⣿⡿⠋⠀⠀⠀`}
                      </pre>
                    </div>
                  </div>
                  
                  {/* System Info - Right Side */}
                  <div className='flex-1'>
                    <div className="space-y-1">
                      {formatSystemInfo(fastfetchOutput)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SSH Connection Card - Right Side */}
              <div className='w-44 bg-black/30 border border-[rgba(122,0,255,0.25)] rounded-lg p-3 text-xs font-mono'>
                {/* Header with Status */}
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-magenta-bright text-xs font-semibold'>SSH</span>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-terminal-green animate-pulse' />
                    <span className='text-terminal-green text-[10px] font-bold'>ONLINE</span>
                  </div>
                </div>
                
                {/* Network Info */}
                <div className='space-y-1'>
                  <div className='flex justify-between text-[10px]'>
                    <span className='text-text-soft'>Down:</span>
                    <span className='text-cyan-bright font-mono'>1 Gbps</span>
                  </div>
                  <div className='flex justify-between text-[10px]'>
                    <span className='text-text-soft'>Up:</span>
                    <span className='text-cyan-bright font-mono'>100 Mbps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Cards Section */}
        <div className='flex gap-3 mt-4'>
          {/* Projects Card */}
          <div className='flex-1 bg-black/30 border border-[rgba(122,0,255,0.25)] rounded-lg p-3 text-xs font-mono'>
            <div className='text-magenta-bright text-xs font-semibold tracking-wide uppercase'>
              PROJECTS
            </div>
          </div>

          {/* Blog Card */}
          <div className='flex-1 bg-black/30 border border-[rgba(122,0,255,0.25)] rounded-lg p-3 text-xs font-mono'>
            <div className='text-magenta-bright text-xs font-semibold tracking-wide uppercase'>
              BLOG
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
