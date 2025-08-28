import { useState, useEffect } from 'react'

import { fetchProjects } from '@/lib/api'

interface Project {
  id: number | string
  name: string
  description?: string | null | undefined
  tech_stack?: string[] | undefined
  github_url?: string | undefined
  live_url?: string | undefined
  status?: string | null | undefined
  created_at?: string | undefined
  updated_at?: string | undefined
}

export default function SystemInfoPane() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFastfetch, setShowFastfetch] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

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

  useEffect(() => {
    // Fetch projects for dynamic cards
    fetchProjects()
      .then(data => {
        const processedProjects = data.slice(0, 3).map(project => ({
          id: project.id,
          name: project.name,
          description: project.description ?? undefined,
          tech_stack: project.tech_stack ?? [],
          github_url: project.github_url,
          live_url: project.live_url,
          status: project.status ?? undefined,
          created_at: project.created_at,
          updated_at: project.updated_at,
        }))
        setProjects(processedProjects)
        setProjectsLoading(false)
      })
      .catch(() => {
        setProjectsLoading(false)
      })
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

  const formatTime = (time: Date, timezone: string) => {
    try {
      return time.toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: timezone,
      })
    } catch {
      // Fallback to basic time format on error
      return time.toTimeString().slice(0, 8)
    }
  }

  const timezones = [
    { name: 'RIO', timezone: 'America/Sao_Paulo', city: 'Rio de Janeiro' },
    { name: 'SF', timezone: 'America/Los_Angeles', city: 'San Francisco' },
    { name: 'LON', timezone: 'Europe/London', city: 'London' },
    { name: 'TYO', timezone: 'Asia/Tokyo', city: 'Tokyo' },
  ]

  return (
    <div
      className='h-full flex flex-col font-mono text-[12.5px] leading-[1.5] text-[#f2f4f8]'
      aria-label='System Information'
    >
      <div className='flex-1 overflow-y-auto'>
        {/* World Clock */}
        <div className='space-y-2 mb-4'>
          <div className='text-pink-400 text-[10px] font-medium tracking-wide uppercase'>
            WORLD CLOCK
          </div>
          <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs'>
            {timezones.map(tz => (
              <div key={tz.name} className='flex items-center justify-between'>
                <div className='text-[#dde1e6] opacity-80 text-[10px] uppercase tracking-wide font-medium'>
                  {tz.city}
                </div>
                <div className='text-green-400 font-mono font-semibold text-sm'>
                  {formatTime(currentTime, tz.timezone)}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Fastfetch Output */}
        {showFastfetch && (
          <div className='space-y-2'>
            <div className='text-pink-400 text-xs font-medium tracking-wide'>SYSTEM INFO</div>
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
                  <span className='text-pink-400 text-[10px] font-semibold uppercase tracking-wide'>
                    CONNECTION
                  </span>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                    <span className='text-green-400 text-[9px] font-bold'>SECURE</span>
                  </div>
                </div>

                {/* Connection Info */}
                <div className='space-y-1.5'>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>Protocol:</span>
                    <span className='text-green-400 font-mono'>SSH-2.0</span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>Cipher:</span>
                    <span className='text-pink-400 font-mono'>AES-256</span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>Latency:</span>
                    <span className='text-green-400 font-mono'>12ms</span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>Uptime:</span>
                    <span className='text-pink-400 font-mono'>
                      {Math.floor((Date.now() - 1704067200000) / 86400000)}d
                    </span>
                  </div>

                  {/* Separator */}
                  <div className='border-t border-[#393939] my-2' />

                  {/* Network Stats */}
                  <div className='space-y-1'>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>TX:</span>
                      <span className='text-green-400 font-mono'>1.2GB</span>
                    </div>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>RX:</span>
                      <span className='text-green-400 font-mono'>3.4GB</span>
                    </div>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>Sessions:</span>
                      <span className='text-pink-400 font-mono'>4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Cards Section */}
        <div className='flex gap-3 mt-4'>
          {/* Recent Projects Card */}
          <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs font-mono'>
            <div className='text-[#be95ff] text-xs font-semibold tracking-wide uppercase mb-2'>
              RECENT PROJECTS
            </div>
            {projectsLoading ? (
              <div className='text-[#dde1e6] opacity-60 text-[9px]'>Loading...</div>
            ) : projects.length > 0 ? (
              <div className='space-y-2'>
                {projects.slice(0, 2).map(project => (
                  <div key={project.id} className='border-l-2 border-[#33b1ff] pl-2'>
                    <div className='text-[#33b1ff] text-[10px] font-medium truncate'>
                      {project.name}
                    </div>
                    <div className='text-[#dde1e6] opacity-70 text-[8px] truncate'>
                      {project.description ?? 'No description'}
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                      {project.status && (
                        <span
                          className={`text-[8px] px-1 rounded ${
                            project.status === 'active'
                              ? 'bg-green-400/20 text-green-400'
                              : project.status === 'completed'
                                ? 'bg-blue-400/20 text-blue-400'
                                : 'bg-yellow-400/20 text-yellow-400'
                          }`}
                        >
                          {project.status}
                        </span>
                      )}
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <span className='text-[8px] text-[#be95ff] opacity-70'>
                          {project.tech_stack.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {projects.length > 2 && (
                  <div className='text-[8px] text-[#dde1e6] opacity-50 text-center pt-1'>
                    +{projects.length - 2} more projects
                  </div>
                )}
              </div>
            ) : (
              <div className='text-[#dde1e6] opacity-60 text-[9px]'>No projects found</div>
            )}
          </div>

          {/* Project Stats Card */}
          <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs font-mono'>
            <div className='text-[#be95ff] text-xs font-semibold tracking-wide uppercase mb-2'>
              PROJECT STATS
            </div>
            {projectsLoading ? (
              <div className='text-[#dde1e6] opacity-60 text-[9px]'>Loading...</div>
            ) : (
              <div className='space-y-1.5'>
                <div className='flex justify-between text-[9px]'>
                  <span className='text-[#dde1e6] opacity-70'>Total:</span>
                  <span className='text-green-400 font-mono'>{projects.length}</span>
                </div>
                <div className='flex justify-between text-[9px]'>
                  <span className='text-[#dde1e6] opacity-70'>Active:</span>
                  <span className='text-green-400 font-mono'>
                    {projects.filter(p => p.status === 'active').length}
                  </span>
                </div>
                <div className='flex justify-between text-[9px]'>
                  <span className='text-[#dde1e6] opacity-70'>Completed:</span>
                  <span className='text-blue-400 font-mono'>
                    {projects.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className='flex justify-between text-[9px]'>
                  <span className='text-[#dde1e6] opacity-70'>Technologies:</span>
                  <span className='text-pink-400 font-mono'>
                    {new Set(projects.flatMap(p => p.tech_stack ?? [])).size}
                  </span>
                </div>

                {/* Most Recent Update */}
                {projects.length > 0 && projects[0]?.updated_at && (
                  <>
                    <div className='border-t border-[#393939] my-2' />
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>Last Update:</span>
                      <span className='text-pink-400 font-mono'>
                        {new Date(projects[0].updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
