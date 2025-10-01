import { ArrowUpRight, CalendarClock, Clock4, FolderOpen, Globe2, Link2 } from 'lucide-react'
import { memo, useEffect, useState } from 'react'

import appleLogo from '@/assets/pngwing.com.png'
import { renderIcon } from '@/lib/icon-registry'
import { useProjects } from '@/lib/queries'
import type { IconKey } from 'shared/iconography/registry'

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
      <div className='text-[#ff7eb6] text-terminal-body font-bold tracking-wide uppercase flex items-center gap-2'>
        <Clock4 className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
        <span>WORLD CLOCK</span>
      </div>
      <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-terminal-body'>
        {timezones.map(tz => (
          <div key={tz.name} className='flex items-center justify-between'>
            <div
              className='text-[#f2f4f8] text-terminal-label uppercase tracking-wide'
              style={{
                fontSize: 'calc(var(--text-terminal-label) + 1px)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {tz.city}
            </div>
            <div
              className='text-[#42be65] font-mono text-terminal-body terminal-command'
              style={{
                fontSize: 'calc(var(--text-terminal-body) + 1px)',
                fontWeight: 'var(--font-weight-bold)',
              }}
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

  const baseTechIcons = {
    react: 'simple/react',
    bun: 'simple/bun',
    vite: 'simple/vite',
    tailwind: 'simple/tailwindcss',
    typescript: 'simple/typescript',
    swift: 'simple/swift',
    svelte: 'simple/svelte',
    drizzle: 'simple/drizzle',
    router: 'simple/reactrouter',
    elysia: 'lucide/route',
    macos: 'lucide/apple',
    terminal: 'lucide/terminal',
    go: 'simple/go',
    rust: 'simple/rust',
    zig: 'simple/zig',
    python: 'simple/python',
    gin: 'simple/gin',
    hono: 'simple/hono',
    vapor: 'simple/vapor',
    actix: 'simple/actix',
    fastify: 'simple/fastify',
    remix: 'simple/remix',
    nextjs: 'simple/nextdotjs',
    nuxt: 'simple/nuxt',
    vue: 'simple/vuedotjs',
    solid: 'simple/solid',
    deno: 'simple/deno',
    node: 'simple/nodedotjs',
    podman: 'simple/podman',
    terraform: 'simple/terraform',
    tanstack: 'lucide/tree-palm',
  } as const satisfies Record<string, IconKey>

  const techIconMap: Record<string, IconKey> = {
    react: baseTechIcons.react,
    'react.js': baseTechIcons.react,
    'react js': baseTechIcons.react,
    'react router': baseTechIcons.router,
    'tanstack router': baseTechIcons.router,
    bun: baseTechIcons.bun,
    vite: baseTechIcons.vite,
    tailwind: baseTechIcons.tailwind,
    typescript: baseTechIcons.typescript,
    'tailwind css': baseTechIcons.tailwind,
    tailwindcss: baseTechIcons.tailwind,
    swift: baseTechIcons.swift,
    swiftui: baseTechIcons.swift,
    svelte: baseTechIcons.svelte,
    drizzle: baseTechIcons.drizzle,
    'drizzle orm': baseTechIcons.drizzle,
    go: baseTechIcons.go,
    rust: baseTechIcons.rust,
    zig: baseTechIcons.zig,
    python: baseTechIcons.python,
    gin: baseTechIcons.gin,
    hono: baseTechIcons.hono,
    vapor: baseTechIcons.vapor,
    actix: baseTechIcons.actix,
    fastify: baseTechIcons.fastify,
    remix: baseTechIcons.remix,
    next: baseTechIcons.nextjs,
    nuxt: baseTechIcons.nuxt,
    vue: baseTechIcons.vue,
    solid: baseTechIcons.solid,
    deno: baseTechIcons.deno,
    node: baseTechIcons.node,
    podman: baseTechIcons.podman,
    terraform: baseTechIcons.terraform,
    macos: baseTechIcons.macos,
    'apple platform': baseTechIcons.macos,
    terminal: baseTechIcons.terminal,
    'terminal interface': baseTechIcons.terminal,
    elysia: baseTechIcons.elysia,
    tanstack: baseTechIcons.tanstack,
  }

  const resolveTechIconKey = (label: string): IconKey | undefined => {
    const normalized = label.toLowerCase().trim()
    if (techIconMap[normalized]) return techIconMap[normalized]
    if (normalized.includes('react')) return baseTechIcons.react
    if (normalized.includes('tailwind')) return baseTechIcons.tailwind
    if (normalized.includes('typescript') || normalized.includes('ts'))
      return baseTechIcons.typescript
    if (normalized.includes('bun')) return baseTechIcons.bun
    if (normalized.includes('vite')) return baseTechIcons.vite
    if (normalized.includes('swift')) return baseTechIcons.swift
    if (normalized.includes('svelte')) return baseTechIcons.svelte
    if (normalized.includes('drizzle')) return baseTechIcons.drizzle
    if (normalized.includes('router')) return baseTechIcons.router
    if (normalized.includes('elysia')) return baseTechIcons.elysia
    if (normalized.includes('macos') || normalized.includes('apple')) return baseTechIcons.macos
    if (normalized.includes('terminal')) return baseTechIcons.terminal
    if (normalized.includes('tanstack')) return baseTechIcons.tanstack
    return undefined
  }

  const renderTechBadge = (tech: string, index: number) => {
    const iconKey = resolveTechIconKey(tech)

    if (!iconKey) {
      return (
        <span
          key={`tech-${String(index)}-${tech}`}
          className='inline-flex items-center gap-1 px-2 py-1 bg-black/40 border border-[#393939] rounded text-xs text-[#f2f4f8]'
        >
          {tech}
        </span>
      )
    }

    const iconNode = renderIcon(iconKey, { className: 'h-4 w-4', label: tech })

    return (
      <span
        key={`tech-${String(index)}-${tech}`}
        className='inline-flex h-8 w-8 items-center justify-center rounded border border-[#393939] bg-black/40 text-[#33b1ff]'
        title={tech}
      >
        {iconNode && typeof iconNode !== 'string' ? (
          iconNode
        ) : (
          <span className='sr-only'>{tech}</span>
        )}
      </span>
    )
  }

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
      className='h-full flex flex-col font-mono text-terminal-body text-[#f2f4f8] font-medium'
      aria-label='System Information'
    >
      <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
        {/* World Clock */}
        <WorldClock />
        {/* Fastfetch Output */}
        {showFastfetch && (
          <div className='space-y-2'>
            <div className='text-[#ff7eb6] text-terminal-body font-bold tracking-wide uppercase'>
              SYSTEM INFO
            </div>
            <div className='flex gap-3 overflow-hidden'>
              {/* Main System Info Card - Optimized Height */}
              <div className='flex-1 bg-black/30 border border-[#393939] rounded-lg p-3.5 text-terminal-body terminal-body text-[#f2f4f8] font-mono min-h-[12.5rem] min-w-0 overflow-hidden'>
                <div className='flex gap-4 h-full min-w-0'>
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
                      className='select-none w-[6rem] h-[6rem] sm:w-[8rem] sm:h-[8rem] md:w-[10rem] md:h-[10rem] lg:w-[12rem] lg:h-[12rem] xl:w-[14rem] xl:h-[14rem] object-contain drop-shadow-[0_0_0.5rem_rgba(221,225,230,0.35)]'
                    />
                  </div>

                  {/* System Info - Right Side - Compact */}
                  <div className='flex-1 flex flex-col justify-between min-w-0 overflow-hidden'>
                    <div className='space-y-1.5'>
                      {/* Username@hostname */}
                      <div className='terminal-body text-terminal-body mb-1.5 truncate'>
                        <span className='text-[#33b1ff]'>tuliopinheirocunha</span>
                        <span className='text-[#393939]'>@</span>
                        <span className='text-[#be95ff]'>MacBook-Pro</span>
                      </div>

                      {/* Separator - responsive border instead of text */}
                      <div className='border-t border-[#393939] w-full' />

                      {/* Core System Info */}
                      <div className='truncate'>
                        <span className='text-[#33b1ff] terminal-subtitle'>OS:</span>
                        <span className='text-[#42be65] ml-1 font-mono'>
                          macOS Tahoe 26.0 ARM64
                        </span>
                      </div>

                      <div className='truncate'>
                        <span className='text-[#33b1ff] terminal-subtitle'>Host:</span>
                        <span className='text-[#42be65] ml-1 font-mono'>
                          MacBook Pro (14-inch, 2023)
                        </span>
                      </div>

                      <div className='truncate'>
                        <span className='text-[#33b1ff] terminal-subtitle'>CPU:</span>
                        <span className='text-[#be95ff] ml-1 font-mono'>
                          Apple M4 Pro (12) @ 3.50 GHz
                        </span>
                      </div>

                      <div className='truncate'>
                        <span className='text-[#33b1ff] terminal-subtitle'>Memory:</span>
                        <span className='text-[#42be65] ml-1 font-mono'>36 GB Unified</span>
                      </div>

                      <div className='truncate'>
                        <span className='text-[#33b1ff] terminal-subtitle'>Terminal:</span>
                        <span className='text-[#be95ff] ml-1 font-mono'>Ghostty 1.0.0</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar - Compact */}
                    <div className='mt-2 pt-2 border-t border-[#393939]'>
                      <div className='flex justify-between items-center text-terminal-meta'>
                        <div className='flex gap-3'>
                          <span className='text-[#f2f4f8]'>
                            Load: <span className='text-[#42be65] font-mono'>1.2</span>
                          </span>
                          <span className='text-[#f2f4f8]'>
                            Temp: <span className='text-[#42be65] font-mono'>42°C</span>
                          </span>
                        </div>
                        <span className='text-[#33b1ff] font-mono' suppressHydrationWarning>
                          {Math.floor((Date.now() - 1704067200000) / 3600000)}h uptime
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SSH Connection Card - Right Side - Compact */}
              <div className='w-[11rem] bg-black/30 border border-[#393939] rounded-lg p-3 text-terminal-body terminal-body font-mono min-h-[12.5625rem] flex flex-col flex-shrink-0 overflow-hidden'>
                {/* Header with Status */}
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-[#ff7eb6] text-terminal-header font-bold uppercase tracking-wide'>
                    CONNECTION
                  </span>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-[#42be65] animate-pulse' />
                    <span
                      className='text-[#42be65] text-terminal-tiny terminal-command'
                      style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                    >
                      SECURE
                    </span>
                  </div>
                </div>

                {/* Connection Info - Compact */}
                <div className='space-y-2 flex-1'>
                  <div
                    className='flex justify-between text-terminal-tiny'
                    style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                  >
                    <span className='text-[#f2f4f8]'>Protocol:</span>
                    <span className='text-[#42be65] font-mono'>SSH-2.0</span>
                  </div>
                  <div
                    className='flex justify-between text-terminal-tiny'
                    style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                  >
                    <span className='text-[#f2f4f8]'>Cipher:</span>
                    <span className='text-[#ff7eb6] font-mono'>AES-256</span>
                  </div>
                  <div
                    className='flex justify-between text-terminal-tiny'
                    style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                  >
                    <span className='text-[#f2f4f8]'>Latency:</span>
                    <span className='text-[#42be65] font-mono'>12ms</span>
                  </div>
                  <div
                    className='flex justify-between text-terminal-tiny'
                    style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                  >
                    <span className='text-[#f2f4f8]'>Uptime:</span>
                    <span className='text-[#ff7eb6] font-mono' suppressHydrationWarning>
                      {Math.floor((Date.now() - 1704067200000) / 86400000).toString()}d
                    </span>
                  </div>

                  {/* Separator */}
                  <div className='border-t border-[#393939] my-2' />

                  {/* Network Stats - Reduced */}
                  <div className='space-y-1.5'>
                    <div
                      className='flex justify-between text-terminal-tiny'
                      style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                    >
                      <span className='text-[#f2f4f8]'>TX:</span>
                      <span className='text-[#42be65] font-mono'>1.2GB</span>
                    </div>
                    <div
                      className='flex justify-between text-terminal-tiny'
                      style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                    >
                      <span className='text-[#f2f4f8]'>RX:</span>
                      <span className='text-[#42be65] font-mono'>3.4GB</span>
                    </div>
                    <div
                      className='flex justify-between text-terminal-tiny'
                      style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                    >
                      <span className='text-[#f2f4f8]'>Sessions:</span>
                      <span className='text-[#ff7eb6] font-mono'>4</span>
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className='mt-auto pt-2 border-t border-[#393939]'>
                  <div
                    className='text-center text-terminal-tiny text-[#33b1ff] font-mono'
                    style={{ fontSize: 'calc(var(--text-terminal-tiny) + 1px)' }}
                  >
                    ◉ Active Session
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Cards Section - Compact */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 flex-1 min-h-0'>
          {/* Recent Projects Card - Compact */}
          <div className='bg-black/30 border border-[#393939] rounded-lg p-2.5 text-terminal-body terminal-body font-mono flex flex-col min-h-[18rem] min-w-0 pb-2'>
            <div className='text-[#be95ff] text-terminal-header font-bold tracking-wide uppercase mb-2 flex items-center gap-2'>
              <FolderOpen className='h-4 w-4' aria-hidden='true' />
              <span>RECENT PROJECTS</span>
            </div>
            <div className='flex-1 min-h-0'>
              {projectsLoading ? (
                <div className='text-[#f2f4f8]'>Loading...</div>
              ) : currentProject ? (
                <div className='space-y-2.5 h-full flex flex-col'>
                  <div
                    className='flex items-center gap-2 text-terminal-label'
                    style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                  >
                    <Link2 className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                    <span className='text-[#42be65] font-mono font-semibold hover:text-[#ff7eb6] transition-colors'>
                      {currentProject.name}
                    </span>
                  </div>

                  <div className='border-t border-[#393939]' />

                  <div className='space-y-2 flex-1'>
                    <div
                      className='text-[#f2f4f8] leading-relaxed line-clamp-3'
                      style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                    >
                      {currentProject.description ??
                        'The Next concept of excellence in Terminal Apps on Apple Platforms (early stages)'}
                    </div>

                    {currentProject.tech_stack && currentProject.tech_stack.length > 0 && (
                      <div
                        className='text-terminal-label'
                        style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                      >
                        <span className='text-[#ff7eb6] block mb-1'>Tech:</span>
                        <div className='flex flex-wrap gap-2'>
                          {currentProject.tech_stack
                            .slice(0, 6)
                            .map((tech, index) => renderTechBadge(tech, index))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='mt-auto pt-2 border-t border-[#393939]'>
                    <div
                      className='flex flex-col gap-2 text-terminal-label sm:flex-row sm:items-center sm:justify-between'
                      style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                    >
                      <span className='text-[#f2f4f8]'>
                        Showing {currentProjectIndex + 1} / {projects.length}
                      </span>
                      <div className='flex flex-wrap items-center gap-2'>
                        {currentProject.github_url && (
                          <a
                            href={currentProject.github_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-[#ff7eb6] font-mono font-semibold hover:text-[#be95ff] transition-colors inline-flex items-center gap-2'
                          >
                            {renderIcon('simple/github', {
                              className: 'h-4 w-4',
                              label: 'GitHub repository',
                            })}
                            <span>GitHub</span>
                            <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                          </a>
                        )}
                        {!currentProject.github_url && currentProject.live_url && (
                          <a
                            href={currentProject.live_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-[#ff7eb6] font-mono font-semibold hover:text-[#be95ff] transition-colors inline-flex items-center gap-2'
                          >
                            <Link2 className='h-4 w-4' aria-hidden='true' />
                            <span>Live</span>
                            <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-[#f2f4f8]'>No projects found</div>
              )}
            </div>
          </div>

          {/* Personal Website Card - Compact */}
          <div className='bg-black/30 border border-[#393939] rounded-lg p-2.5 text-terminal-body terminal-body font-mono flex flex-col min-h-[18rem] min-w-0 pb-2'>
            <div className='text-[#be95ff] text-terminal-header font-bold tracking-wide uppercase mb-2 flex items-center gap-2'>
              <Globe2 className='h-4 w-4 text-[#be95ff]' aria-hidden='true' />
              <span>PERSONAL WEBSITE</span>
            </div>
            <div className='flex-1 min-h-0'>
              <div className='space-y-2.5 h-full flex flex-col'>
                {/* Main Website Link */}
                <div
                  className='flex items-center gap-2 text-terminal-label'
                  style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                >
                  <Link2 className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                  <a
                    href='https://www.tuliocunha.dev'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[#42be65] font-mono font-semibold hover:text-[#ff7eb6] transition-colors'
                  >
                    www.tuliocunha.dev
                  </a>
                </div>

                <div className='border-t border-[#393939]' />

                {/* Navigation Links */}
                <div className='space-y-2 flex-1'>
                  <div
                    className='flex items-center justify-between text-terminal-label'
                    style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                  >
                    <span className='text-[#ff7eb6]'>Profile:</span>
                    <a
                      href='https://www.tuliocunha.dev'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#42be65] font-mono hover:text-[#ff7eb6] transition-colors flex items-center gap-2'
                    >
                      Home
                      <ArrowUpRight className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                    </a>
                  </div>
                  <div
                    className='flex items-center justify-between text-terminal-label'
                    style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                  >
                    <span className='text-[#ff7eb6]'>Projects:</span>
                    <a
                      href='https://www.tuliocunha.dev'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#42be65] font-mono hover:text-[#ff7eb6] transition-colors flex items-center gap-2'
                    >
                      View Projects
                      <ArrowUpRight className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                    </a>
                  </div>
                  <div
                    className='flex items-center justify-between text-terminal-label'
                    style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                  >
                    <span className='text-[#ff7eb6]'>Blog:</span>
                    <a
                      href='https://www.tuliocunha.dev'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#42be65] font-mono hover:text-[#ff7eb6] transition-colors flex items-center gap-2'
                    >
                      Read Articles
                      <ArrowUpRight className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                    </a>
                  </div>
                </div>
                {/* Book Time Section */}
                <div className='mt-auto pt-2 border-t border-[#393939]'>
                  <div
                    className='flex items-center justify-between text-terminal-label'
                    style={{ fontSize: 'calc(var(--text-terminal-label) + 1px)' }}
                  >
                    <span className='text-[#f2f4f8]'>Book Time:</span>
                    <a
                      href='https://fantastical.app/tuliocunha'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#ff7eb6] font-mono font-semibold glow-soft hover:text-[#be95ff] transition-colors flex items-center gap-2'
                    >
                      <CalendarClock className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                      <span>Schedule</span>
                      <ArrowUpRight className='h-4 w-4 text-[#ff7eb6]' aria-hidden='true' />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// OPTIMIZATION: Memoize component - only re-renders when projects data changes
export default memo(SystemInfoPane)
