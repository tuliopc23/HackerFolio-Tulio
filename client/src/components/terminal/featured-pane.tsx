import { Star, Github, ExternalLink } from 'lucide-react';
import { projectsData } from '@/data/portfolio-data';

export default function FeaturedPane() {
  const featuredProject = projectsData.find(p => p.featured) || projectsData[0];

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
    <div className="pane-border rounded-lg overflow-hidden flex flex-col h-full" aria-label="Featured Project">
      <div className="bg-lumon-border px-4 py-2 border-b border-cyan-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-03]</span>
          <span className="text-text-soft">featured</span>
        </div>
        <Star className="w-4 h-4 text-terminal-orange" />
      </div>

      <div className="flex-1 p-4 bg-lumon-bg overflow-y-auto">
        <div className="space-y-3">
          <div className="text-cyan-bright font-medium">{featuredProject.name}</div>
          <div className="text-xs text-text-soft">
            {featuredProject.description}
          </div>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1">
            {featuredProject.stack.map((tech) => (
              <span 
                key={tech}
                className="px-2 py-1 bg-lumon-dark border border-cyan-soft rounded text-xs text-cyan-bright"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Project Image Placeholder */}
          <div className="w-full h-24 bg-lumon-dark border border-cyan-soft rounded-lg flex items-center justify-center overflow-hidden">
            {featuredProject.image ? (
              <img 
                src={featuredProject.image}
                alt={`${featuredProject.name} preview`}
                className="w-full h-full object-cover rounded-lg opacity-80"
              />
            ) : (
              <div className="text-cyan-soft text-xs">No preview available</div>
            )}
          </div>

          {/* Project Stats */}
          {featuredProject.stats && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-lumon-dark border border-cyan-soft rounded">
                <div className="text-neon-blue font-medium">{featuredProject.stats.performance}</div>
                <div className="text-text-soft">Performance</div>
              </div>
              <div className="text-center p-2 bg-lumon-dark border border-cyan-soft rounded">
                <div className="text-terminal-green font-medium">{featuredProject.stats.accessibility}</div>
                <div className="text-text-soft">Accessibility</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 text-xs">
            {featuredProject.links?.demo && (
              <button 
                onClick={handleViewProject}
                className="flex-1 px-3 py-2 bg-neon-blue text-lumon-dark rounded hover:bg-cyan-bright transition-colors flex items-center justify-center gap-1"
                aria-label={`View ${featuredProject.name} project`}
              >
                <ExternalLink className="w-3 h-3" />
                View Project
              </button>
            )}
            {featuredProject.links?.github && (
              <button 
                onClick={handleViewCode}
                className="px-3 py-2 border border-cyan-soft text-cyan-soft rounded hover:bg-cyan-soft hover:text-lumon-dark transition-colors"
                aria-label={`View ${featuredProject.name} source code`}
              >
                <Github className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Project Role */}
          <div className="text-xs text-text-soft">
            <span className="text-cyan-bright">Role:</span> {featuredProject.role}
          </div>
        </div>
      </div>
    </div>
  );
}
