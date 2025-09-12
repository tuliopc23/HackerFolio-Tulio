import { useState, useEffect, memo } from 'react'

import { useProjects } from '@/lib/queries'

interface Project {
  id: number | string
  name: string
  description?: string | null | undefined
  tech_stack?: string[] | undefined
  github_url?: string | null | undefined
  live_url?: string | null | undefined
  status?: string | null | undefined
  created_at?: string | null | undefined
  updated_at?: string | null | undefined
}

// Lightweight world clock that updates itself without re-rendering the whole pane
const WorldClock = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const formatTime = (time: Date, timezone: string) => {
    try {
      return time.toLocaleTimeString('en-US', { hour12: false, timeZone: timezone })
    } catch {
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
    <div className='space-y-2 mb-4'>
      <div className='text-pink-400 text-[10px] font-medium tracking-wide uppercase'>
        WORLD CLOCK
      </div>
      <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs'>
        {timezones.map(tz => (
          <div key={tz.name} className='flex items-center justify-between'>
            <div className='text-[#f2f4f8] text-[10px] uppercase tracking-wide font-medium'>
              {tz.city}
            </div>
            <div
              className='text-green-400 font-mono font-semibold text-sm glow-soft'
              suppressHydrationWarning
            >
              {formatTime(currentTime, tz.timezone)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
WorldClock.displayName = 'WorldClock'

function SystemInfoPane() {
  const [showFastfetch, setShowFastfetch] = useState(false)

  // Use TanStack Query for projects data
  const { data: projectsData = [], isLoading: projectsLoading } = useProjects()

  // Process projects data for display (use all projects; rotate in UI)
  const projects: Project[] = projectsData.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    tech_stack: project.techStack ? (JSON.parse(project.techStack) as string[]) : [],
    github_url: project.githubUrl,
    live_url: project.liveUrl,
    status: project.status ?? undefined,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  }))

  // Rotate through projects one at a time
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)

  // Current project (safe selection with fallback)
  const currentProject: Project | undefined =
    projects.length > 0 ? projects[currentProjectIndex % projects.length] : undefined

  // Reset to first project when data changes
  useEffect(() => {
    setCurrentProjectIndex(0)
  }, [projectsData.length])

  // Auto-advance the displayed project
  useEffect(() => {
    const total = projectsData.length
    if (total <= 1) return
    const intervalMs = 3000
    const id = setInterval(() => {
      setCurrentProjectIndex(idx => (idx + 1) % total)
    }, intervalMs)
    return () => {
      clearInterval(id)
    }
  }, [projectsData.length])

  useEffect(() => {
    // Trigger fastfetch display after component mounts
    const timeout = setTimeout(() => {
      setShowFastfetch(true)
    }, 500)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div
      className='h-full flex flex-col font-mono text-[12.5px] leading-[1.5] text-[#f2f4f8]'
      aria-label='System Information'
    >
      <div className='flex-1 overflow-y-auto'>
        {/* World Clock */}
        <WorldClock />
        {/* Fastfetch Output */}
        {showFastfetch && (
          <div className='space-y-2'>
            <div className='text-pink-400 text-xs font-medium tracking-wide phosphor-glow'>
              SYSTEM INFO
            </div>
            <div className='flex gap-3'>
              {/* Main System Info Card */}
              <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs text-[#f2f4f8] font-mono'>
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
                      <div className='text-[#393939]'>────────────────────────────────────────</div>

                      {/* OS Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>OS:</span>
                        <span className='text-[#42be65] ml-1 font-mono glow-soft'>
                          macOS Tahoe 26.0 ARM64
                        </span>
                      </div>

                      {/* Host Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>Host:</span>
                        <span className='text-[#42be65] ml-1 font-mono glow-soft'>
                          MacBook Pro (14-inch, 2023)
                        </span>
                      </div>

                      {/* CPU Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>CPU:</span>
                        <span className='text-[#be95ff] ml-1 font-mono glow-soft'>
                          Apple M4 Pro (12) @ 3.50 GHz
                        </span>
                      </div>

                      {/* GPU Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>GPU:</span>
                        <span className='text-[#be95ff] ml-1 font-mono glow-soft'>
                          Apple M4 Pro
                        </span>
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
                    <span className='text-green-400 text-[9px] font-bold glow-soft'>SECURE</span>
                  </div>
                </div>

                {/* Connection Info */}
                <div className='space-y-1.5'>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#f2f4f8]'>Protocol:</span>
                    <span className='text-green-400 font-mono glow-soft'>SSH-2.0</span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#f2f4f8]'>Cipher:</span>
                    <span className='text-pink-400 font-mono glow-soft'>AES-256</span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#f2f4f8]'>Latency:</span>
                    <span className='text-green-400 font-mono glow-soft'>12ms</span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#f2f4f8]'>Uptime:</span>
                    <span className='text-pink-400 font-mono glow-soft' suppressHydrationWarning>
                      {Math.floor((Date.now() - 1704067200000) / 86400000).toString()}d
                    </span>
                  </div>

                  {/* Separator */}
                  <div className='border-t border-[#393939] my-2' />

                  {/* Network Stats */}
                  <div className='space-y-1'>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#f2f4f8]'>TX:</span>
                      <span className='text-green-400 font-mono glow-soft'>1.2GB</span>
                    </div>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#f2f4f8]'>RX:</span>
                      <span className='text-green-400 font-mono glow-soft'>3.4GB</span>
                    </div>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#f2f4f8]'>Sessions:</span>
                      <span className='text-pink-400 font-mono glow-soft'>4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Cards Section */}
        <div className='flex gap-3 mt-4 items-stretch flex-1'>
          {/* Recent Projects Card */}
          <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-[12px] font-mono pane-border min-h-[200px] h-full'>
            <div className='text-[#be95ff] text-xs font-semibold tracking-wide uppercase mb-2 phosphor-glow'>
              RECENT PROJECTS
            </div>
            {projectsLoading ? (
              <div className='text-[#f2f4f8]'>Loading...</div>
            ) : currentProject ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-[12px] text-[#f2f4f8]'>
                  <span>
                    Showing {currentProjectIndex + 1} / {projects.length}
                  </span>
                  <span className='h-1 w-12 bg-[#393939] rounded overflow-hidden'>
                    <span className='block h-full w-1/3 bg-[#33b1ff] animate-pulse' />
                  </span>
                </div>
                <div key={currentProject.id} className='border-l-2 border-[#33b1ff] pl-2'>
                  <div className='text-[#33b1ff] text-[13px] font-medium whitespace-normal break-words multiline-ellipsis-2 glow-soft'>
                    {currentProject.name}
                  </div>
                  <div className='text-[#f2f4f8] text-[12px] whitespace-normal break-words multiline-ellipsis-3'>
                    {currentProject.description ?? 'No description'}
                  </div>
                  <div className='flex items-center gap-2 mt-1'>
                    {currentProject.status && (
                      <span
                        className={`text-[12px] px-1 rounded ${
                          currentProject.status === 'active'
                            ? 'bg-green-400/20 text-green-400'
                            : currentProject.status === 'completed'
                              ? 'bg-blue-400/20 text-blue-400'
                              : 'bg-yellow-400/20 text-yellow-400'
                        } glow-soft`}
                      >
                        {currentProject.status}
                      </span>
                    )}
                    {currentProject.tech_stack && currentProject.tech_stack.length > 0 && (
                      <span className='text-[12px] text-pink-400 whitespace-normal break-words multiline-ellipsis-2 glow-soft'>
                        {currentProject.tech_stack.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-[#f2f4f8]'>No projects found</div>
            )}
          </div>

          {/* Project Stats Card */}
          <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3 text-[12px] font-mono min-h-[200px] h-full'>
            <div className='text-[#be95ff] text-xs font-semibold tracking-wide uppercase mb-2'>
              PROJECT STATS
            </div>
            {projectsLoading ? (
              <div className='text-[#f2f4f8]'>Loading...</div>
            ) : (
              <div className='space-y-1.5'>
                <div className='flex justify-between text-[12px]'>
                  <span className='text-[#f2f4f8]'>Total:</span>
                  <span className='text-green-400 font-mono glow-soft'>{projects.length}</span>
                </div>
                <div className='flex justify-between text-[12px]'>
                  <span className='text-[#f2f4f8]'>Active:</span>
                  <span className='text-green-400 font-mono glow-soft'>
                    {projects.filter(p => p.status === 'active').length}
                  </span>
                </div>
                <div className='flex justify-between text-[12px]'>
                  <span className='text-[#f2f4f8]'>Completed:</span>
                  <span className='text-blue-400 font-mono glow-soft'>
                    {projects.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className='flex justify-between text-[12px]'>
                  <span className='text-[#f2f4f8]'>Technologies:</span>
                  <span className='text-pink-400 font-mono glow-soft'>
                    {new Set(projects.flatMap(p => p.tech_stack ?? [])).size}
                  </span>
                </div>

                {/* Most Recent Update */}
                {projects.length > 0 && projects[0]?.updated_at && (
                  <>
                    <div className='border-t border-[#393939] my-2' />
                    <div className='flex justify-between text-[12px]'>
                      <span className='text-[#f2f4f8]'>Last Update:</span>
                      <span className='text-pink-400 font-mono glow-soft' suppressHydrationWarning>
                        {new Date(projects[0].updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC',
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
