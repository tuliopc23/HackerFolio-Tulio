import { Link } from '@tanstack/react-router'
import { ArrowLeft, Code2, ExternalLink, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

import { fetchProjects } from '@/lib/api'

export default function Projects() {
  const [projectsData, setProjectsData] = useState<
    Array<{
      id: number | string
      name: string
      description?: string
      stack?: string[]
      tech_stack?: string[]
      links?: Record<string, string>
      featured?: boolean
      role?: string
      image?: string
      stats?: Record<string, unknown>
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
      .then(items => {
        // Map API shape to UI shape
        setProjectsData(
          items.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description ?? '',
            stack: p.tech_stack ?? [],
            featured: p.status === 'active',
            role: 'Full Stack Developer', // Default role
            ...(p.image && { image: p.image }),
            ...(p.stats && { stats: p.stats }),
            links: Object.fromEntries(
              Object.entries({
                github: p.github_url,
                demo: p.live_url,
                appstore: p.appstore_url,
              }).filter(([, value]) => value !== undefined)
            ) as Record<string, string>,
          }))
        )
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Failed to load projects'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className='min-h-screen bg-black text-text-cyan p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-cyan-soft hover:text-cyan-bright transition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Terminal
          </Link>
          <h1 className='text-3xl font-bold text-cyan-bright phosphor-glow mb-2'>Projects</h1>
          <p className='text-text-soft'>
            A collection of my work spanning web development, mobile apps, and systems programming.
          </p>
        </div>

        {/* State */}
        {loading && <div className='text-text-soft'>Loading projects...</div>}
        {error && <div className='text-terminal-red'>{error}</div>}

        {/* Projects Grid */}
        <div className='grid gap-6 md:grid-cols-2'>
          {projectsData.map(project => (
            <div
              key={project.id}
              className='pane-border rounded-lg p-6 bg-[#0a0a0a] hover:border-cyan-bright transition-colors'
            >
              {/* Project Header */}
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <h3 className='text-xl font-semibold text-cyan-bright'>{project.name}</h3>
                    {project.featured && <Star className='w-4 h-4 text-terminal-orange' />}
                  </div>
                  <p className='text-text-soft text-sm'>{project.role}</p>
                </div>
              </div>

              {/* Description */}
              <p className='text-text-soft mb-4'>{project.description}</p>

              {/* Tech Stack */}
              <div className='mb-4'>
                <div className='flex flex-wrap gap-2'>
                  {(project.stack ?? []).map(tech => (
                    <span
                      key={tech}
                      className='px-2 py-1 bg-black border border-cyan-soft rounded text-xs text-cyan-bright'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Image */}
              {project.image && (
                <div className='mb-4'>
                  <img
                    src={project.image}
                    alt={`${project.name} preview`}
                    className='w-full h-48 object-cover rounded border border-cyan-soft opacity-80'
                  />
                </div>
              )}

              {/* Stats */}
              {project.stats && (
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <div className='text-center p-2 bg-black border border-cyan-soft rounded'>
                    <div className='text-[#33b1ff] font-medium'>
                      {typeof project.stats.performance === 'string' ||
                      typeof project.stats.performance === 'number'
                        ? String(project.stats.performance)
                        : ''}
                    </div>
                    <div className='text-text-soft text-xs'>Performance</div>
                  </div>
                  <div className='text-center p-2 bg-black border border-cyan-soft rounded'>
                    <div className='text-terminal-green font-medium'>
                      {typeof project.stats.accessibility === 'string' ||
                      typeof project.stats.accessibility === 'number'
                        ? String(project.stats.accessibility)
                        : ''}
                    </div>
                    <div className='text-text-soft text-xs'>Accessibility</div>
                  </div>
                </div>
              )}

              {/* Action Links */}
              <div className='flex gap-2'>
                {project.links?.demo && (
                  <a
                    href={project.links.demo}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex-1 px-4 py-2 bg-[#33b1ff] text-[#f2f4f8] rounded hover:bg-cyan-bright transition-colors flex items-center justify-center gap-2 text-sm font-medium'
                  >
                    <ExternalLink className='w-4 h-4' />
                    View Demo
                  </a>
                )}
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='px-4 py-2 border border-cyan-soft text-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors flex items-center justify-center'
                  >
                    <Code2 className='w-4 h-4' />
                  </a>
                )}
                {project.links?.appstore && (
                  <a
                    href={project.links.appstore}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='px-4 py-2 border border-cyan-soft text-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors text-sm'
                  >
                    App Store
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='mt-12 text-center'>
          <p className='text-text-soft'>More projects coming soon...</p>
          <Link
            to='/'
            className='inline-block mt-4 px-6 py-2 border border-cyan-soft text-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors'
          >
            Return to Terminal
          </Link>
        </div>
      </div>
    </div>
  )
}
