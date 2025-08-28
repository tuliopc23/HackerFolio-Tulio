import { useState, useEffect } from 'react'

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
Packages: 228 (brew), 101 (brew-cask)
Shell: fish 4.0.2
Terminal: Ghostty v1.0.0
CPU: Apple M4 Pro (12) @ 3.50 GHz
GPU: Apple M4 Pro`

  const formatSystemInfo = (text: string) => {
    return text.split('\n').map((line, index) => {
      const key = `${String(index)}-${line}`

      // Separator line
      if (line.includes('────')) {
        return (
          <div key={key} className='text-[#393939] opacity-60'>
            {line}
          </div>
        )
      }

      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const label = line.substring(0, colonIndex + 1)
        const value = line.substring(colonIndex + 1).trim()

        // Syntax highlighting for different types of values
        let valueClass = 'text-[#33b1ff]' // Default cyan

        // Operating System - Green
        if (label.includes('OS') || label.includes('Host') || label.includes('Kernel')) {
          valueClass = 'text-[#42be65]'
        }
        // Memory/Storage/Performance - Magenta
        else if (
          label.includes('Memory') ||
          label.includes('Disk') ||
          label.includes('CPU') ||
          label.includes('GPU') ||
          label.includes('Swap')
        ) {
          valueClass = 'text-[#be95ff]'
        }
        // Numbers/Percentages - Light Blue
        else if (/\d+%|\d+\.\d+|\d+ \w+/.exec(value)) {
          valueClass = 'text-[#78a9ff]'
        }
        // Applications/Software - Pink
        else if (
          label.includes('Shell') ||
          label.includes('Terminal') ||
          label.includes('Font') ||
          label.includes('Packages')
        ) {
          valueClass = 'text-[#ff7eb6]'
        }

        return (
          <div key={key}>
            <span className='text-[#82cfff] font-medium'>{label}</span>
            <span className={`${valueClass} ml-1 font-mono`}>{value}</span>
          </div>
        )
      }

      // Header line - user@hackerfolio with proper colors
      if (index === 0 && line.includes('@')) {
        const atIndex = line.indexOf('@')
        const username = line.substring(0, atIndex)
        const hostname = line.substring(atIndex + 1) // Remove the @ symbol
        return (
          <div key={key} className='font-normal text-xs mb-1'>
            <span className='text-[#33b1ff]'>{username}</span>
            <span className='text-[#393939]'>@</span>
            <span className='text-[#be95ff]'>{hostname}</span>
          </div>
        )
      }

      // Other lines
      return (
        <div key={key} className='text-[#dde1e6]'>
          {line}
        </div>
      )
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
      className='h-full flex flex-col font-mono text-[12.5px] leading-[1.5] text-[#f2f4f8]'
      aria-label='System Information'
    >
      <div className='flex-1 overflow-y-auto'>
        {/* Current Time */}
        <div className='space-y-2 mb-4'>
          <div className='text-[#be95ff] text-xs font-medium tracking-wide'>LOCAL TIME</div>
          <div className='text-[#33b1ff] text-lg font-mono font-semibold'>
            {formatTime(currentTime)}
          </div>
          <div className='text-[#dde1e6] text-xs opacity-70'>
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
            <div className='text-[#be95ff] text-xs font-medium tracking-wide'>SYSTEM INFO</div>
            <div className='flex gap-3'>
              {/* Main System Info Card */}
              <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs text-[#dde1e6] font-mono'>
                <div className='flex gap-4'>
                  {/* Apple ASCII Art - Left Side */}
                  <div className='flex-shrink-0'>
                    <div className='font-mono text-[8px] leading-[1.1]'>
                      <pre className='text-[#dde1e6] whitespace-pre drop-shadow-[0_0_8px_rgba(221,225,230,0.4)] hover:drop-shadow-[0_0_12px_rgba(221,225,230,0.6)] transition-all duration-300'>
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
                    <div className='space-y-1'>{formatSystemInfo(fastfetchOutput)}</div>
                  </div>
                </div>
              </div>

              {/* SSH Connection Card - Right Side */}
              <div className='w-44 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs font-mono'>
                {/* Header with Status */}
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-[#be95ff] text-xs font-semibold'>SSH</span>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-[#42be65] animate-pulse' />
                    <span className='text-[#42be65] text-[10px] font-bold'>ONLINE</span>
                  </div>
                </div>

                {/* Network Info */}
                <div className='space-y-1'>
                  <div className='flex justify-between text-[10px]'>
                    <span className='text-[#dde1e6] opacity-70'>Down:</span>
                    <span className='text-[#78a9ff] font-mono'>1 Gbps</span>
                  </div>
                  <div className='flex justify-between text-[10px]'>
                    <span className='text-[#dde1e6] opacity-70'>Up:</span>
                    <span className='text-[#78a9ff] font-mono'>100 Mbps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Cards Section */}
        <div className='flex gap-3 mt-4'>
          {/* Projects Card */}
          <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs font-mono'>
            <div className='text-[#be95ff] text-xs font-semibold tracking-wide uppercase'>
              PROJECTS
            </div>
          </div>

          {/* Blog Card */}
          <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs font-mono'>
            <div className='text-[#be95ff] text-xs font-semibold tracking-wide uppercase'>BLOG</div>
          </div>
        </div>
      </div>
    </div>
  )
}
