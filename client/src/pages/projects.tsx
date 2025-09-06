import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'

import { ArrowLeft, Code2, ExternalLink, Star } from '@/components/icons/custom-icons'
import { useProjects } from '@/lib/queries'

export default function Projects() {
  const { data: projectsData, isLoading: loading, error } = useProjects()

  // Transform API data to UI shape with useMemo for performance
  const transformedProjects = useMemo(() => {
    if (!projectsData) return []

    return projectsData.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      stack: p.techStack ? (JSON.parse(p.techStack) as string[]) : [],
      featured: p.status === 'active',
      role: 'Full Stack Developer',
      links: Object.fromEntries(
        Object.entries({
          github: p.githubUrl,
          demo: p.liveUrl,
        }).filter(([, value]) => value != null)
      ) as Record<string, string>,
    }))
  }, [projectsData])

  return (
    <div className='min-h-screen bg-black text-text-cyan p-6'>
      <div className='max-w-4xl mx-auto'>
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

        {loading && <div className='text-text-soft'>Loading projects...</div>}
        {error && <div className='text-terminal-red'>{error.message}</div>}

        <div className='grid gap-6 md:grid-cols-2'>
          {transformedProjects.map(project => (
            <div
              key={project.id}
              className='pane-border rounded-lg p-6 bg-[#0a0a0a] hover:border-cyan-bright transition-colors'
            >
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <h3 className='text-xl font-semibold text-cyan-bright'>{project.name}</h3>
                    {project.featured && <Star className='w-4 h-4 text-terminal-orange' />}
                  </div>
                  <p className='text-text-soft text-sm'>{project.role}</p>
                </div>
              </div>

              <p className='text-text-soft mb-4'>{project.description}</p>

              <div className='mb-4'>
                <div className='flex flex-wrap gap-2'>
                  {project.stack.map((tech: string) => (
                    <span
                      key={tech}
                      className='px-2 py-1 bg-black border border-cyan-soft rounded text-xs text-cyan-bright'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className='flex gap-2'>
                {project.links.demo && (
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
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='px-4 py-2 border border-cyan-soft text-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors flex items-center justify-center'
                  >
                    <Code2 className='w-4 h-4' />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

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
