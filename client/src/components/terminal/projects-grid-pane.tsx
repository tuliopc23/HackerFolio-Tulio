import { useState, useEffect } from 'react'

import { TerminalLoadingSpinner } from '@/components/loading-spinner'
import { LayoutGrid } from '@/components/ui/layout-grid'
import { fetchProjects } from '@/lib/api'

interface Project {
  id: number | string
  name: string
  description?: string | undefined
  tech_stack?: string[] | undefined
  github_url?: string | undefined
  live_url?: string | undefined
  status?: string | undefined
  image?: string | undefined
}

export default function ProjectsGridPane() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
      .then(data => {
        const processedData: Project[] = data.slice(0, 6).map(project => ({
          id: project.id,
          name: project.name,
          description: project.description ?? undefined,
          tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
          github_url: project.github_url,
          live_url: project.live_url,
          status: project.status ?? undefined,
          image: project.image,
        }))
        setProjects(processedData)
      })
      .catch(error => {
        console.error('Failed to fetch projects:', error)
        setError('Failed to load projects')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const cards = projects.map((project, index) => ({
    id: index,
    content: (
      <div className='bg-lumon-bg p-3 sm:p-4 h-full'>
        <h3 className='text-cyan-bright font-medium text-base sm:text-lg mb-2'>{project.name}</h3>
        <p className='text-text-soft text-sm mb-3'>{project.description}</p>

        {/* Tech Stack */}
        <div className='flex flex-wrap gap-1 mb-3'>
          {(project.tech_stack || []).slice(0, 3).map(tech => (
            <span
              key={tech}
              className='px-2 py-1 bg-magenta-soft bg-opacity-20 border border-magenta-soft rounded text-xs text-magenta-bright'
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className='flex gap-2 mt-auto'>
          {project.live_url && (
            <button
              onClick={e => {
                e.stopPropagation()
                if (typeof window !== 'undefined') {
                  try {
                    window.open(project.live_url, '_blank')
                  } catch (error) {
                    console.warn('Failed to open live URL:', project.live_url, error)
                  }
                }
              }}
              className='px-3 py-1 bg-cyan-bright text-lumon-dark rounded text-xs hover:bg-cyan-soft transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-bright focus:ring-opacity-50'
              aria-label={`View live demo of ${project.name}`}
            >
              Demo
            </button>
          )}
          {project.github_url && (
            <button
              onClick={e => {
                e.stopPropagation()
                if (typeof window !== 'undefined') {
                  try {
                    window.open(project.github_url, '_blank')
                  } catch (error) {
                    console.warn('Failed to open GitHub URL:', project.github_url, error)
                  }
                }
              }}
              className='px-3 py-1 border border-magenta-soft text-magenta-soft rounded text-xs hover:bg-magenta-soft hover:text-lumon-dark transition-colors focus:outline-none focus:ring-2 focus:ring-magenta-soft focus:ring-opacity-50'
              aria-label={`View source code of ${project.name} on GitHub`}
            >
              Code
            </button>
          )}
        </div>
      </div>
    ),
    className: index === 0 ? 'md:col-span-2' : '',
    thumbnail:
      project.image ||
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=500&auto=format&fit=crop',
  }))

  return (
    <div
      className='pane-border rounded-lg overflow-hidden flex flex-col h-full'
      aria-label='Projects Grid'
    >
      {/* Pane Header */}
      <div className='bg-lumon-border px-4 py-2 border-b border-magenta-soft flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-magenta-bright font-medium'>[pane-03]</span>
          <span className='text-text-soft'>projects</span>
        </div>
        <div className='text-xs text-text-soft'>{projects.length} items</div>
      </div>

      <div className='flex-1 bg-lumon-bg overflow-hidden'>
        {loading ? (
          <div className='p-4 flex items-center justify-center'>
            <TerminalLoadingSpinner text='Loading projects...' />
          </div>
        ) : error ? (
          <div className='p-4 text-center'>
            <div className='text-terminal-red text-sm mb-2'>⚠️ {error}</div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className='text-xs text-cyan-bright hover:text-cyan-soft underline focus:outline-none focus:ring-2 focus:ring-cyan-bright focus:ring-opacity-50 px-2 py-1 rounded'
              aria-label='Retry loading projects'
            >
              Retry
            </button>
          </div>
        ) : (
          <div className='h-full p-2 sm:p-0'>
            <LayoutGrid cards={cards} />
          </div>
        )}
      </div>
    </div>
  )
}
