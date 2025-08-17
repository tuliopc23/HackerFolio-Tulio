import { Link } from 'wouter';
import { ArrowLeft, Download, Mail, Github, Linkedin } from 'lucide-react';
import { resumeContent, profileData } from '@/data/portfolio-data';

export default function Resume() {
  const formatMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1 className="text-cyan-bright phosphor-glow mb-2 text-3xl font-bold" key={index}>
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 className="text-cyan-bright mt-6 mb-3 text-2xl font-semibold" key={index}>
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 className="text-cyan-soft mt-4 mb-2 text-xl font-medium" key={index}>
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 className="text-cyan-bright mb-1 text-lg font-medium" key={index}>
            {line.substring(5)}
          </h4>
        );
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div className="mb-1" key={index}>
              <span className="text-cyan-bright font-medium">{match[1]}</span>
              <span className="text-text-soft">{match[2]}</span>
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div className="text-text-soft mb-1 ml-4" key={index}>
            {line.substring(2)}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div className="mb-3" key={index} />;
      }
      return (
        <p className="text-text-soft mb-1" key={index}>
          {line}
        </p>
      );
    });
  };

  const handleDownload = () => {
    // In a real application, this would download a PDF version
    alert('PDF download functionality would be implemented here');
  };

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

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-cyan-bright phosphor-glow mb-2 text-3xl font-bold">Resume</h1>
              <p className="text-text-soft">Professional experience and qualifications</p>
            </div>
            <button
              className="bg-neon-blue text-lumon-dark hover:bg-cyan-bright flex items-center gap-2 rounded px-4 py-2 font-medium transition-colors"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Main Content */}
          <div className="pane-border bg-lumon-bg rounded-lg p-8">
            <div className="prose prose-invert max-w-none">{formatMarkdown(resumeContent)}</div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="pane-border bg-lumon-bg rounded-lg p-6">
              <h3 className="text-cyan-bright mb-4 text-lg font-semibold">Contact</h3>
              <div className="space-y-3 text-sm">
                <a
                  className="text-text-soft hover:text-cyan-bright flex items-center gap-2 transition-colors"
                  href={`mailto:${profileData.contact.email}`}
                >
                  <Mail className="h-4 w-4" />
                  {profileData.contact.email}
                </a>
                <a
                  className="text-text-soft hover:text-cyan-bright flex items-center gap-2 transition-colors"
                  href={profileData.contact.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                  github.com/tuliocunha
                </a>
                <a
                  className="text-text-soft hover:text-cyan-bright flex items-center gap-2 transition-colors"
                  href={profileData.contact.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Linkedin className="h-4 w-4" />
                  linkedin.com/in/tuliocunha
                </a>
              </div>
            </div>

            {/* Skills Summary */}
            <div className="pane-border bg-lumon-bg rounded-lg p-6">
              <h3 className="text-cyan-bright mb-4 text-lg font-semibold">Core Skills</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-cyan-soft mb-1 text-sm font-medium">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.stack.languages.map((lang) => (
                      <span
                        className="bg-lumon-dark border-cyan-soft text-cyan-bright rounded border px-2 py-1 text-xs"
                        key={lang}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-soft mb-1 text-sm font-medium">Web Technologies</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.stack.web.slice(0, 3).map((tech) => (
                      <span
                        className="bg-lumon-dark border-cyan-soft text-cyan-bright rounded border px-2 py-1 text-xs"
                        key={tech}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-soft mb-1 text-sm font-medium">Cloud & DevOps</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileData.stack.cloud.map((tech) => (
                      <span
                        className="bg-lumon-dark border-cyan-soft text-cyan-bright rounded border px-2 py-1 text-xs"
                        key={tech}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pane-border bg-lumon-bg rounded-lg p-6">
              <h3 className="text-cyan-bright mb-4 text-lg font-semibold">Quick Stats</h3>
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
                  <span className="text-terminal-green font-medium">
                    {profileData.stack.languages.length}
                  </span>
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
