import { Link } from '@tanstack/react-router';
import { ArrowLeft, Download, Mail, Github, Linkedin } from 'lucide-react';
import { resumeContent as fallbackResume, profileData } from '@/data/portfolio-data';

export default function Resume() {
  const resumeContent = fallbackResume;
  const formatMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-cyan-bright phosphor-glow mb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-cyan-bright mb-3 mt-6">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-medium text-cyan-soft mb-2 mt-4">{line.substring(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-medium text-cyan-bright mb-1">{line.substring(5)}</h4>;
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div key={index} className="mb-1">
              <span className="text-cyan-bright font-medium">{match[1]}</span>
              <span className="text-text-soft">{match[2]}</span>
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return <div key={index} className="text-text-soft mb-1 ml-4">{line.substring(2)}</div>;
      }
      if (line.trim() === '') {
        return <div key={index} className="mb-3"></div>;
      }
      return <p key={index} className="text-text-soft mb-1">{line}</p>;
    });
  };

  const handleDownload = () => {
    // In a real application, this would download a PDF version
    alert('PDF download functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-lumon-dark text-text-cyan p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-cyan-soft hover:text-cyan-bright transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Terminal
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-cyan-bright phosphor-glow mb-2">Resume</h1>
              <p className="text-text-soft">Professional experience and qualifications</p>
            </div>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-lumon-dark rounded hover:bg-cyan-bright transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Main Content */}
          <div className="pane-border rounded-lg p-8 bg-lumon-bg">
            <div className="prose prose-invert max-w-none">
              {formatMarkdown(resumeContent)}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="pane-border rounded-lg p-6 bg-lumon-bg">
              <h3 className="text-lg font-semibold text-cyan-bright mb-4">Contact</h3>
              <div className="space-y-3 text-sm">
                <a 
                  href={`mailto:${profileData.contact.email}`}
                  className="flex items-center gap-2 text-text-soft hover:text-cyan-bright transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {profileData.contact.email}
                </a>
                <a 
                  href={profileData.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-soft hover:text-cyan-bright transition-colors"
                >
                  <Github className="w-4 h-4" />
                  github.com/tuliocunha
                </a>
                <a 
                  href={profileData.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-soft hover:text-cyan-bright transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  linkedin.com/in/tuliocunha
                </a>
              </div>
            </div>

            {/* Skills Summary */}
            <div className="pane-border rounded-lg p-6 bg-lumon-bg">
              <h3 className="text-lg font-semibold text-cyan-bright mb-4">Core Skills</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-cyan-soft text-sm font-medium mb-1">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.stack.languages.map(lang => (
                      <span key={lang} className="px-2 py-1 bg-lumon-dark border border-cyan-soft rounded text-xs text-cyan-bright">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-soft text-sm font-medium mb-1">Web Technologies</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.stack.web.slice(0, 3).map(tech => (
                      <span key={tech} className="px-2 py-1 bg-lumon-dark border border-cyan-soft rounded text-xs text-cyan-bright">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-soft text-sm font-medium mb-1">Cloud & DevOps</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.stack.cloud.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-lumon-dark border border-cyan-soft rounded text-xs text-cyan-bright">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pane-border rounded-lg p-6 bg-lumon-bg">
              <h3 className="text-lg font-semibold text-cyan-bright mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-soft">Experience:</span>
                  <span className="text-terminal-green font-medium">6+ years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-soft">Projects:</span>
                  <span className="text-terminal-green font-medium">50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-soft">Languages:</span>
                  <span className="text-terminal-green font-medium">{profileData.stack.languages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-soft">Available:</span>
                  <span className="text-terminal-green font-medium">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
