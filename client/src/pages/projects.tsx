import { Link } from 'wouter';
import { ArrowLeft, Github, ExternalLink, Star } from 'lucide-react';
import { projectsData } from '@/data/portfolio-data';

export default function Projects() {
  return (
    <div className="bg-lumon-dark text-text-cyan min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            className="text-cyan-soft hover:text-cyan-bright mb-4 inline-flex items-center gap-2 transition-colors"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Terminal
          </Link>
          <h1 className="text-cyan-bright phosphor-glow mb-2 text-3xl font-bold">Projects</h1>
          <p className="text-text-soft">
            A collection of my work spanning web development, mobile apps, and systems programming.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projectsData.map((project) => (
            <div
              className="pane-border bg-lumon-bg hover:border-cyan-bright rounded-lg p-6 transition-colors"
              key={project.id}
            >
              {/* Project Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-cyan-bright text-xl font-semibold">{project.name}</h3>
                    {project.featured && <Star className="text-terminal-orange h-4 w-4" />}
                  </div>
                  <p className="text-text-soft text-sm">{project.role}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-text-soft mb-4">{project.description}</p>

              {/* Tech Stack */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      className="bg-lumon-dark border-cyan-soft text-cyan-bright rounded border px-2 py-1 text-xs"
                      key={tech}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Image */}
              {project.image && (
                <div className="mb-4">
                  <img
                    alt={`${project.name} preview`}
                    className="border-cyan-soft h-48 w-full rounded border object-cover opacity-80"
                    src={project.image}
                  />
                </div>
              )}

              {/* Stats */}
              {project.stats && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="bg-lumon-dark border-cyan-soft rounded border p-2 text-center">
                    <div className="text-neon-blue font-medium">{project.stats.performance}</div>
                    <div className="text-text-soft text-xs">Performance</div>
                  </div>
                  <div className="bg-lumon-dark border-cyan-soft rounded border p-2 text-center">
                    <div className="text-terminal-green font-medium">
                      {project.stats.accessibility}
                    </div>
                    <div className="text-text-soft text-xs">Accessibility</div>
                  </div>
                </div>
              )}

              {/* Action Links */}
              <div className="flex gap-2">
                {project.links?.demo && (
                  <a
                    className="bg-neon-blue text-lumon-dark hover:bg-cyan-bright flex flex-1 items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors"
                    href={project.links.demo}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Demo
                  </a>
                )}
                {project.links?.github && (
                  <a
                    className="border-cyan-soft text-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark flex items-center justify-center rounded border px-4 py-2 transition-colors"
                    href={project.links.github}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {project.links?.appstore && (
                  <a
                    className="border-cyan-soft text-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark rounded border px-4 py-2 text-sm transition-colors"
                    href={project.links.appstore}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    App Store
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-text-soft">More projects coming soon...</p>
          <Link
            className="border-cyan-soft text-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark mt-4 inline-block rounded border px-6 py-2 transition-colors"
            href="/"
          >
            Return to Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
