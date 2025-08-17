import { Star, Github, ExternalLink } from 'lucide-react';
import { projectsData } from '@/data/portfolio-data';

export default function FeaturedPane() {
  const featuredProject = projectsData.find((p) => p.featured) || projectsData[0];

  // Early return if no projects available
  if (!featuredProject) {
    return (
      <div className="h-full flex items-center justify-center text-terminal-dim">
        No projects available
      </div>
    );
  }

  const handleViewProject = () => {
    if (featuredProject.links?.demo) {
      window.open(featuredProject.links.demo, '_blank');
    }
  };

  const handleViewCode = () => {
    if (featuredProject.links?.github) {
      window.open(featuredProject.links.github, '_blank');
    }
  };

  return (
    <div
      aria-label="Featured Project"
      className="pane-border flex h-full flex-col overflow-hidden rounded-lg"
    >
      <div className="bg-lumon-border border-cyan-soft flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-03]</span>
          <span className="text-text-soft">featured</span>
        </div>
        <Star className="text-terminal-orange h-4 w-4" />
      </div>

      <div className="bg-lumon-bg flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="text-cyan-bright font-medium">{featuredProject.name}</div>
          <div className="text-text-soft text-xs">{featuredProject.description}</div>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1">
            {featuredProject.stack.map((tech) => (
              <span
                className="bg-lumon-dark border-cyan-soft text-cyan-bright rounded border px-2 py-1 text-xs"
                key={tech}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Project Image Placeholder */}
          <div className="bg-lumon-dark border-cyan-soft flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border">
            {featuredProject.image ? (
              <img
                alt={`${featuredProject.name} preview`}
                className="h-full w-full rounded-lg object-cover opacity-80"
                src={featuredProject.image}
              />
            ) : (
              <div className="text-cyan-soft text-xs">No preview available</div>
            )}
          </div>

          {/* Project Stats */}
          {featuredProject.stats && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-lumon-dark border-cyan-soft rounded border p-2 text-center">
                <div className="text-neon-blue font-medium">
                  {featuredProject.stats.performance}
                </div>
                <div className="text-text-soft">Performance</div>
              </div>
              <div className="bg-lumon-dark border-cyan-soft rounded border p-2 text-center">
                <div className="text-terminal-green font-medium">
                  {featuredProject.stats.accessibility}
                </div>
                <div className="text-text-soft">Accessibility</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 text-xs">
            {featuredProject.links?.demo && (
              <button
                aria-label={`View ${featuredProject.name} project`}
                className="bg-neon-blue text-lumon-dark hover:bg-cyan-bright flex flex-1 items-center justify-center gap-1 rounded px-3 py-2 transition-colors"
                onClick={handleViewProject}
              >
                <ExternalLink className="h-3 w-3" />
                View Project
              </button>
            )}
            {featuredProject.links?.github && (
              <button
                aria-label={`View ${featuredProject.name} source code`}
                className="border-cyan-soft text-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark rounded border px-3 py-2 transition-colors"
                onClick={handleViewCode}
              >
                <Github className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Project Role */}
          <div className="text-text-soft text-xs">
            <span className="text-cyan-bright">Role:</span> {featuredProject.role}
          </div>
        </div>
      </div>
    </div>
  );
}
