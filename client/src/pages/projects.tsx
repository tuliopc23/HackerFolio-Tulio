import { Link } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Star } from 'lucide-react'
import { useMemo } from 'react'

import { renderIcon } from '@/lib/icon-registry'
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
    <div className='route-page'>
      <div className='min-h-screen bg-[#05060d] px-4 py-6 text-white md:px-8'>
        <div className='mx-auto max-w-6xl'>
          <div className='relative mb-10 overflow-hidden rounded-3xl border border-white/15 bg-black/45 p-6 backdrop-blur-xl md:p-10'>
            <div className='absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl' />
            <div className='absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-fuchsia-300/15 blur-3xl' />
            <Link
              to='/'
              className='font-ui mb-6 inline-flex items-center gap-2 text-cyan-200 transition-colors hover:text-cyan-100'
            >
              <ArrowLeft className='w-4 h-4' aria-hidden='true' />
              Back to Terminal
            </Link>
            <h1 className='font-display mb-3 text-4xl leading-[0.92] text-white md:text-6xl'>
              Projects engineered for product traction.
            </h1>
            <p className='font-ui max-w-2xl text-sm text-slate-200 md:text-base'>
              Shipping fast is easy. Shipping memorable products that convert is harder. This work
              focuses on that gap.
            </p>
          </div>

          {loading && <div className='font-ui text-slate-300'>Loading projects...</div>}
          {error && <div className='font-ui text-red-300'>{error.message}</div>}

          <div className='grid content-visibility-auto gap-6 md:grid-cols-2'>
            {transformedProjects.map(project => (
              <div
                key={project.id}
                className='panel-glow group relative overflow-hidden rounded-2xl border border-white/15 bg-black/45 p-6 backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/60 contain-paint'
              >
                <div className='absolute -right-10 top-0 h-24 w-24 rounded-full bg-cyan-300/15 blur-2xl transition-opacity duration-300 group-hover:opacity-100' />
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='font-display text-2xl text-cyan-100 whitespace-normal break-words multiline-ellipsis-2'>
                        {project.name}
                      </h3>
                      {project.featured && (
                        <Star className='h-4 w-4 text-amber-300' aria-hidden='true' />
                      )}
                    </div>
                    <p className='font-ui text-sm text-slate-300'>{project.role}</p>
                  </div>
                </div>

                <p className='font-ui mb-5 whitespace-normal break-words text-slate-200 multiline-ellipsis-3'>
                  {project.description}
                </p>

                <div className='mb-5'>
                  <div className='flex flex-wrap gap-2'>
                    {project.stack.map((tech: string) => (
                      <span
                        key={tech}
                        className='font-ui rounded-full border border-cyan-200/30 bg-cyan-100/10 px-3 py-1 text-xs text-cyan-100'
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
                      className='font-ui flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-50 transition-colors duration-200 hover:bg-cyan-300/30'
                    >
                      <ExternalLink className='w-4 h-4' aria-hidden='true' />
                      View Demo
                    </a>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex cursor-pointer items-center justify-center rounded-full border border-fuchsia-200/40 px-4 py-2 text-fuchsia-100 transition-colors duration-200 hover:bg-fuchsia-300/25'
                    >
                      {renderIcon('simple/github', {
                        className: 'w-4 h-4',
                        label: `${project.name} GitHub repository`,
                      })}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className='mt-12 text-center'>
            <p className='font-ui text-slate-300'>More projects coming soon...</p>
            <Link
              to='/'
              className='font-ui mt-4 inline-block rounded-full border border-cyan-200/40 px-6 py-2 text-cyan-100 transition-colors duration-200 hover:bg-cyan-200/20'
            >
              Return to Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
