import { useState, useEffect, memo } from 'react'

import appleLogo from '@/assets/pngwing.com.png'
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
      <div className='text-pink-400 text-[10px] text-terminal-semibold tracking-wide uppercase'>
        WORLD CLOCK
      </div>
      <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs'>
        {timezones.map(tz => (
          <div key={tz.name} className='flex items-center justify-between'>
            <div className='text-[#f2f4f8] text-[10px] uppercase tracking-wide text-terminal-medium'>
              {tz.city}
            </div>
            <div
              className='text-green-400 font-mono text-terminal-semibold text-sm glow-soft'
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
      className='h-full flex flex-col font-mono text-[12.5px] terminal-body text-[#f2f4f8]'
      aria-label='System Information'
    >
      <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
        {/* World Clock */}
        <WorldClock />
        {/* Fastfetch Output */}
        {showFastfetch && (
          <div className='space-y-2'>
            <div className='text-pink-400 text-xs text-terminal-semibold tracking-wide phosphor-glow'>
              SYSTEM INFO
            </div>
            <div className='flex gap-3'>
              {/* Main System Info Card - Optimized Height */}
              <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3.5 text-xs text-[#f2f4f8] font-mono min-h-[200px]'>
                <div className='flex gap-4 h-full'>
                  {/* Apple Logo - Left Side */}
                  <div className='flex-shrink-0 flex items-center'>
                    <img
                      src={appleLogo}
                      alt='Apple logo'
                      width={256}
                      height={256}
                      loading='lazy'
                      decoding='async'
                      draggable={false}
                      className='select-none w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain drop-shadow-[0_0_8px_rgba(221,225,230,0.35)]'
                    />
                  </div>

                  {/* System Info - Right Side - Compact */}
                  <div className='flex-1 flex flex-col justify-between'>
                    <div className='space-y-1.5'>
                      {/* Username@hostname */}
                      <div className='font-normal text-xs mb-1.5'>
                        <span className='text-[#33b1ff]'>tuliopinheirocunha</span>
                        <span className='text-[#393939]'>@</span>
                        <span className='text-[#be95ff]'>MacBook-Pro</span>
                      </div>

                      {/* Separator */}
                      <div className='text-[#393939]'>────────────────────────────────────────</div>

                      {/* Core System Info */}
                      <div>
                        <span className='text-[#82cfff] text-terminal-medium'>OS:</span>
                        <span className='text-[#42be65] ml-1 font-mono glow-soft'>
                          macOS Tahoe 26.0 ARM64
                        </span>
                      </div>

                      <div>
                        <span className='text-[#82cfff] text-terminal-medium'>Host:</span>
                        <span className='text-[#42be65] ml-1 font-mono glow-soft'>
                          MacBook Pro (14-inch, 2023)
                        </span>
                      </div>

                      <div>
                        <span className='text-[#82cfff] text-terminal-medium'>CPU:</span>
                        <span className='text-[#be95ff] ml-1 font-mono glow-soft'>
                          Apple M4 Pro (12) @ 3.50 GHz
                        </span>
                      </div>

                      <div>
                        <span className='text-[#82cfff] text-terminal-medium'>Memory:</span>
                        <span className='text-[#42be65] ml-1 font-mono glow-soft'>
                          36 GB Unified
                        </span>
                      </div>

                      <div>
                        <span className='text-[#82cfff] text-terminal-medium'>Terminal:</span>
                        <span className='text-[#be95ff] ml-1 font-mono glow-soft'>
                          Ghostty 1.0.0
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status Bar - Compact */}
                    <div className='mt-2 pt-2 border-t border-[#393939]'>
                      <div className='flex justify-between items-center text-[10px]'>
                        <div className='flex gap-3'>
                          <span className='text-[#f2f4f8]'>
                            Load: <span className='text-green-400 font-mono glow-soft'>1.2</span>
                          </span>
                          <span className='text-[#f2f4f8]'>
                            Temp: <span className='text-green-400 font-mono glow-soft'>42°C</span>
                          </span>
                        </div>
                        <span className='text-[#82cfff] font-mono' suppressHydrationWarning>
                          {Math.floor((Date.now() - 1704067200000) / 3600000)}h uptime
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SSH Connection Card - Right Side - Compact */}
              <div className='w-44 bg-black/30 border border-[#393939] rounded-lg p-3 text-xs font-mono min-h-[200px] flex flex-col'>
                {/* Header with Status */}
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-pink-400 text-[10px] text-terminal-semibold uppercase tracking-wide'>
                    CONNECTION
                  </span>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                    <span className='text-green-400 text-[9px] text-terminal-bold glow-soft'>
                      SECURE
                    </span>
                  </div>
                </div>

                {/* Connection Info - Compact */}
                <div className='space-y-2 flex-1'>
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

                  {/* Network Stats - Reduced */}
                  <div className='space-y-1.5'>
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

                {/* Status Footer */}
                <div className='mt-auto pt-2 border-t border-[#393939]'>
                  <div className='text-center text-[8px] text-[#82cfff] font-mono'>
                    ◉ Active Session
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Cards Section - Compact */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 flex-1 min-h-0 h-full'>
          {/* Recent Projects Card - Compact */}
          <div className='bg-black/30 border border-[#393939] rounded-lg p-2.5 text-[12px] font-mono pane-border flex flex-col min-h-0 h-full'>
            <div className='text-[#be95ff] text-xs text-terminal-semibold tracking-wide uppercase mb-2 phosphor-glow'>
              RECENT PROJECTS
            </div>
            <div className='flex-1 min-h-0'>
              {projectsLoading ? (
                <div className='text-[#f2f4f8]'>Loading...</div>
              ) : currentProject ? (
                <div className='space-y-2 h-full flex flex-col'>
                  <div className='flex items-center justify-between text-[11px] text-[#f2f4f8]'>
                    <span>
                      Showing {currentProjectIndex + 1} / {projects.length}
                    </span>
                    <span className='h-1 w-12 bg-[#393939] rounded overflow-hidden'>
                      <span className='block h-full w-1/3 bg-[#33b1ff] animate-pulse' />
                    </span>
                  </div>
                  <div key={currentProject.id} className='border-l-2 border-[#33b1ff] pl-2 flex-1'>
                    <div className='text-[#33b1ff] text-[13px] text-terminal-medium whitespace-normal break-words glow-soft mb-1.5'>
                      {currentProject.name}
                    </div>
                    <div className='text-[#f2f4f8] text-[11px] whitespace-normal break-words leading-relaxed mb-2'>
                      {currentProject.description ?? 'No description'}
                    </div>
                    <div className='space-y-1.5'>
                      {currentProject.status && (
                        <div className='flex items-center gap-2'>
                          <span className='text-[#82cfff] text-[10px]'>Status:</span>
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded ${
                              currentProject.status === 'active'
                                ? 'bg-green-400/20 text-green-400'
                                : currentProject.status === 'completed'
                                  ? 'bg-blue-400/20 text-blue-400'
                                  : 'bg-yellow-400/20 text-yellow-400'
                            } glow-soft`}
                          >
                            {currentProject.status}
                          </span>
                        </div>
                      )}
                      {currentProject.tech_stack && currentProject.tech_stack.length > 0 && (
                        <div>
                          <span className='text-[#82cfff] text-[10px] block mb-1'>Tech:</span>
                          <div className='flex flex-wrap gap-1'>
                            {currentProject.tech_stack.slice(0, 3).map(tech => (
                              <span
                                key={`${String(currentProject.id)}-${tech}`}
                                className='text-[10px] text-pink-400 bg-pink-400/10 px-1.5 py-0.5 rounded glow-soft'
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentProject.github_url ?? currentProject.live_url) && (
                        <div className='pt-1.5 border-t border-[#393939]'>
                          <div className='flex gap-3 text-[10px]'>
                            {currentProject.github_url && (
                              <span className='text-[#82cfff]'>→ GitHub</span>
                            )}
                            {currentProject.live_url && (
                              <span className='text-green-400'>→ Live</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-[#f2f4f8]'>No projects found</div>
              )}
            </div>
          </div>

          {/* Project Stats Card - Compact */}
          <div className='bg-black/30 border border-[#393939] rounded-lg p-2.5 text-[12px] font-mono flex flex-col min-h-0 h-full'>
            <div className='text-[#be95ff] text-xs text-terminal-semibold tracking-wide uppercase mb-2'>
              PROJECT STATS
            </div>
            <div className='flex-1 min-h-0'>
              {projectsLoading ? (
                <div className='text-[#f2f4f8]'>Loading...</div>
              ) : (
                <div className='space-y-2 h-full flex flex-col'>
                  <div className='space-y-1.5 flex-1'>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-[#f2f4f8]'>Total:</span>
                      <span className='text-green-400 font-mono glow-soft'>{projects.length}</span>
                    </div>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-[#f2f4f8]'>Active:</span>
                      <span className='text-green-400 font-mono glow-soft'>
                        {projects.filter(p => p.status === 'active').length}
                      </span>
                    </div>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-[#f2f4f8]'>Completed:</span>
                      <span className='text-blue-400 font-mono glow-soft'>
                        {projects.filter(p => p.status === 'completed').length}
                      </span>
                    </div>
                    <div className='flex justify-between text-[11px]'>
                      <span className='text-[#f2f4f8]'>Technologies:</span>
                      <span className='text-pink-400 font-mono glow-soft'>
                        {new Set(projects.flatMap(p => p.tech_stack ?? [])).size}
                      </span>
                    </div>

                    {/* Technology Breakdown - Reduced */}
                    {projects.length > 0 && (
                      <>
                        <div className='border-t border-[#393939] my-2' />
                        <div className='space-y-1'>
                          <div className='text-[#82cfff] text-[10px] text-terminal-medium'>
                            Popular Tech:
                          </div>
                          {Array.from(new Set(projects.flatMap(p => p.tech_stack ?? [])))
                            .slice(0, 4)
                            .map(tech => (
                              <div
                                key={`tech-${tech}`}
                                className='flex justify-between text-[10px]'
                              >
                                <span className='text-[#f2f4f8]'>{tech}:</span>
                                <span className='text-pink-400 font-mono glow-soft'>
                                  {projects.filter(p => p.tech_stack?.includes(tech)).length}
                                </span>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Most Recent Update */}
                  {projects.length > 0 && projects[0]?.updated_at && (
                    <div className='mt-auto pt-2 border-t border-[#393939]'>
                      <div className='flex justify-between text-[11px]'>
                        <span className='text-[#f2f4f8]'>Last Update:</span>
                        <span
                          className='text-pink-400 font-mono glow-soft'
                          suppressHydrationWarning
                        >
                          {new Date(projects[0].updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'UTC',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// OPTIMIZATION: Memoize component - only re-renders when projects data changes
export default memo(SystemInfoPane)
