import { useState, useEffect, memo } from 'react'

import { useProjects } from '@/lib/queries'

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

function SystemInfoPane() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFastfetch, setShowFastfetch] = useState(false)

  // Use TanStack Query for projects data
  const { data: projectsData = [], isLoading: projectsLoading } = useProjects()

  // Process projects data for display
  const projects: Project[] = projectsData.slice(0, 3).map(project => ({
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
⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀
⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣀
⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁
⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠀
⠀⠀⠀⠈⠙⢿⣿⣿⣿⠿⠟⠛⠻⠿⣿⣿⣿⣿⡿⠋⠀⠀⠀`}
                      </pre>
                    </div>
                  </div>

                  {/* System Info - Right Side */}
                  <div className='flex-1'>
                    <div className='space-y-1'>
                      {/* Username@hostname */}
                      <div className='font-normal text-xs mb-1'>
                        <span className='text-[#33b1ff]'>tuliopinheirocunha</span>
                        <span className='text-[#393939]'>@</span>
                        <span className='text-[#be95ff]'>MacBook-Pro</span>
                      </div>

                      {/* Separator */}
                      <div className='text-[#393939] opacity-60'>
                        ────────────────────────────────────────
                      </div>

                      {/* OS Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>OS:</span>
                        <span className='text-[#42be65] ml-1 font-mono'>
                          macOS Tahoe 26.0 ARM64
                        </span>
                      </div>

                      {/* Host Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>Host:</span>
                        <span className='text-[#42be65] ml-1 font-mono'>
                          MacBook Pro (14-inch, 2023)
                        </span>
                      </div>

                      {/* CPU Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>CPU:</span>
                        <span className='text-[#be95ff] ml-1 font-mono'>
                          Apple M4 Pro (12) @ 3.50 GHz
                        </span>
                      </div>

                      {/* GPU Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>GPU:</span>
                        <span className='text-[#be95ff] ml-1 font-mono'>Apple M4 Pro</span>
                      </div>
                    </div>
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
                      {Math.floor((Date.now() - 1704067200000) / 86400000).toString()}d
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

// OPTIMIZATION: Memoize component - only re-renders when projects data changes
export default memo(SystemInfoPane)
