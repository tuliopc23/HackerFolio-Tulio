import { useState, useEffect } from 'react'

import { TypedText } from '@/components/ui/typed-text'
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
            <TypedText strings={['WORLD CLOCK']} typeSpeed={400} showCursor startDelay={1000} />
          </div>
          <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs'>
            {timezones.map((tz, index) => (
              <div key={tz.name} className='flex items-center justify-between'>
                <div className='text-[#dde1e6] opacity-80 text-[10px] uppercase tracking-wide font-medium'>
                  <TypedText
                    strings={[tz.city]}
                    typeSpeed={300}
                    showCursor
                    startDelay={2000 + index * 1000}
                  />
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
            <div className='text-pink-400 text-xs font-medium tracking-wide'>
              <TypedText strings={['SYSTEM INFO']} typeSpeed={350} showCursor startDelay={6000} />
            </div>
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
                        <span className='text-[#33b1ff]'>
                          <TypedText
                            strings={['tuliopinheirocunha']}
                            typeSpeed={200}
                            showCursor
                            startDelay={7000}
                          />
                        </span>
                        <span className='text-[#393939]'>@</span>
                        <span className='text-[#be95ff]'>
                          <TypedText
                            strings={['MacBook-Pro']}
                            typeSpeed={200}
                            showCursor
                            startDelay={9000}
                          />
                        </span>
                      </div>

                      {/* Separator */}
                      <div className='text-[#393939] opacity-60'>
                        <TypedText
                          strings={['────────────────────────────────────────']}
                          typeSpeed={50}
                          showCursor={false}
                          startDelay={11000}
                        />
                      </div>

                      {/* OS Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>
                          <TypedText
                            strings={['OS:']}
                            typeSpeed={300}
                            showCursor
                            startDelay={12000}
                          />
                        </span>
                        <span className='text-[#42be65] ml-1 font-mono'>
                          <TypedText
                            strings={['macOS Tahoe 26.0 ARM64']}
                            typeSpeed={150}
                            showCursor
                            startDelay={13000}
                          />
                        </span>
                      </div>

                      {/* Host Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>
                          <TypedText
                            strings={['Host:']}
                            typeSpeed={300}
                            showCursor
                            startDelay={15000}
                          />
                        </span>
                        <span className='text-[#42be65] ml-1 font-mono'>
                          <TypedText
                            strings={['MacBook Pro (14-inch, 2023)']}
                            typeSpeed={150}
                            showCursor
                            startDelay={16000}
                          />
                        </span>
                      </div>

                      {/* CPU Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>
                          <TypedText
                            strings={['CPU:']}
                            typeSpeed={300}
                            showCursor
                            startDelay={18000}
                          />
                        </span>
                        <span className='text-[#be95ff] ml-1 font-mono'>
                          <TypedText
                            strings={['Apple M4 Pro (12) @ 3.50 GHz']}
                            typeSpeed={150}
                            showCursor
                            startDelay={19000}
                          />
                        </span>
                      </div>

                      {/* GPU Info */}
                      <div>
                        <span className='text-[#82cfff] font-medium'>
                          <TypedText
                            strings={['GPU:']}
                            typeSpeed={300}
                            showCursor
                            startDelay={21000}
                          />
                        </span>
                        <span className='text-[#be95ff] ml-1 font-mono'>
                          <TypedText
                            strings={['Apple M4 Pro']}
                            typeSpeed={150}
                            showCursor
                            startDelay={22000}
                          />
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
                    <TypedText
                      strings={['CONNECTION']}
                      typeSpeed={200}
                      showCursor
                      startDelay={24000}
                    />
                  </span>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                    <span className='text-green-400 text-[9px] font-bold'>
                      <TypedText
                        strings={['SECURE']}
                        typeSpeed={200}
                        showCursor
                        startDelay={26000}
                      />
                    </span>
                  </div>
                </div>

                {/* Connection Info */}
                <div className='space-y-1.5'>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>
                      <TypedText
                        strings={['Protocol:']}
                        typeSpeed={250}
                        showCursor
                        startDelay={28000}
                      />
                    </span>
                    <span className='text-green-400 font-mono'>
                      <TypedText
                        strings={['SSH-2.0']}
                        typeSpeed={200}
                        showCursor
                        startDelay={30000}
                      />
                    </span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>
                      <TypedText
                        strings={['Cipher:']}
                        typeSpeed={250}
                        showCursor
                        startDelay={32000}
                      />
                    </span>
                    <span className='text-pink-400 font-mono'>
                      <TypedText
                        strings={['AES-256']}
                        typeSpeed={200}
                        showCursor
                        startDelay={34000}
                      />
                    </span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>
                      <TypedText
                        strings={['Latency:']}
                        typeSpeed={250}
                        showCursor
                        startDelay={36000}
                      />
                    </span>
                    <span className='text-green-400 font-mono'>
                      <TypedText strings={['12ms']} typeSpeed={200} showCursor startDelay={38000} />
                    </span>
                  </div>
                  <div className='flex justify-between text-[9px]'>
                    <span className='text-[#dde1e6] opacity-70'>
                      <TypedText
                        strings={['Uptime:']}
                        typeSpeed={250}
                        showCursor
                        startDelay={40000}
                      />
                    </span>
                    <span className='text-pink-400 font-mono'>
                      <TypedText
                        strings={[
                          `${Math.floor((Date.now() - 1704067200000) / 86400000).toString()}d`,
                        ]}
                        typeSpeed={200}
                        showCursor
                        startDelay={42000}
                      />
                    </span>
                  </div>

                  {/* Separator */}
                  <div className='border-t border-[#393939] my-2' />

                  {/* Network Stats */}
                  <div className='space-y-1'>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>
                        <TypedText
                          strings={['TX:']}
                          typeSpeed={250}
                          showCursor
                          startDelay={44000}
                        />
                      </span>
                      <span className='text-green-400 font-mono'>
                        <TypedText
                          strings={['1.2GB']}
                          typeSpeed={200}
                          showCursor
                          startDelay={46000}
                        />
                      </span>
                    </div>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>
                        <TypedText
                          strings={['RX:']}
                          typeSpeed={250}
                          showCursor
                          startDelay={48000}
                        />
                      </span>
                      <span className='text-green-400 font-mono'>
                        <TypedText
                          strings={['3.4GB']}
                          typeSpeed={200}
                          showCursor
                          startDelay={50000}
                        />
                      </span>
                    </div>
                    <div className='flex justify-between text-[9px]'>
                      <span className='text-[#dde1e6] opacity-70'>
                        <TypedText
                          strings={['Sessions:']}
                          typeSpeed={250}
                          showCursor
                          startDelay={52000}
                        />
                      </span>
                      <span className='text-pink-400 font-mono'>
                        <TypedText strings={['4']} typeSpeed={200} showCursor startDelay={54000} />
                      </span>
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
              <TypedText
                strings={['RECENT PROJECTS']}
                typeSpeed={300}
                showCursor
                startDelay={8000}
              />
            </div>
            {projectsLoading ? (
              <div className='text-[#dde1e6] opacity-60 text-[9px]'>Loading...</div>
            ) : projects.length > 0 ? (
              <div className='space-y-2'>
                {projects.slice(0, 2).map((project, projectIndex) => (
                  <div key={project.id} className='border-l-2 border-[#33b1ff] pl-2'>
                    <div className='text-[#33b1ff] text-[10px] font-medium truncate'>
                      <TypedText
                        strings={[project.name]}
                        typeSpeed={150}
                        showCursor
                        startDelay={56000 + projectIndex * 3000}
                      />
                    </div>
                    <div className='text-[#dde1e6] opacity-70 text-[8px] truncate'>
                      <TypedText
                        strings={[project.description ?? 'No description']}
                        typeSpeed={100}
                        showCursor
                        startDelay={57000 + projectIndex * 3000}
                      />
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
                          <TypedText
                            strings={[project.status]}
                            typeSpeed={150}
                            showCursor
                            startDelay={58000 + projectIndex * 3000}
                          />
                        </span>
                      )}
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <span className='text-[8px] text-[#be95ff] opacity-70'>
                          <TypedText
                            strings={[project.tech_stack.slice(0, 2).join(', ')]}
                            typeSpeed={100}
                            showCursor
                            startDelay={59000 + projectIndex * 3000}
                          />
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
              <TypedText
                strings={['PROJECT STATS']}
                typeSpeed={300}
                showCursor
                startDelay={10000}
              />
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
