import { Link } from 'wouter';
import { ArrowLeft, Mail, Github, Twitter, Linkedin } from 'lucide-react';
import { contactContent, profileData } from '@/data/portfolio-data';

export default function Contact() {
  const formatMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1 className="text-cyan-bright phosphor-glow mb-4 text-3xl font-bold" key={index}>
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
      if (line.trim() === '') {
        return <div className="mb-4" key={index} />;
      }
      return (
        <p className="text-text-soft mb-2" key={index}>
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-lumon-dark text-text-cyan min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            className="text-cyan-soft hover:text-cyan-bright mb-4 inline-flex items-center gap-2 transition-colors"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Terminal
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Content */}
          <div className="pane-border bg-lumon-bg rounded-lg p-6">
            <div className="prose prose-invert max-w-none">{formatMarkdown(contactContent)}</div>
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <div className="pane-border bg-lumon-bg rounded-lg p-6">
              <h3 className="text-cyan-bright mb-4 text-xl font-semibold">Connect With Me</h3>

              <div className="space-y-3">
                <a
                  className="border-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark group flex items-center gap-3 rounded border p-3 transition-colors"
                  href={`mailto:${profileData.contact.email}`}
                >
                  <Mail className="text-cyan-bright group-hover:text-lumon-dark h-5 w-5" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-text-soft group-hover:text-lumon-dark text-sm">
                      {profileData.contact.email}
                    </div>
                  </div>
                </a>

                <a
                  className="border-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark group flex items-center gap-3 rounded border p-3 transition-colors"
                  href={profileData.contact.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="text-cyan-bright group-hover:text-lumon-dark h-5 w-5" />
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-text-soft group-hover:text-lumon-dark text-sm">
                      @tuliocunha
                    </div>
                  </div>
                </a>

                <a
                  className="border-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark group flex items-center gap-3 rounded border p-3 transition-colors"
                  href={profileData.contact.twitter}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Twitter className="text-cyan-bright group-hover:text-lumon-dark h-5 w-5" />
                  <div>
                    <div className="font-medium">Twitter</div>
                    <div className="text-text-soft group-hover:text-lumon-dark text-sm">
                      @tuliocunha
                    </div>
                  </div>
                </a>

                <a
                  className="border-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark group flex items-center gap-3 rounded border p-3 transition-colors"
                  href={profileData.contact.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Linkedin className="text-cyan-bright group-hover:text-lumon-dark h-5 w-5" />
                  <div>
                    <div className="font-medium">LinkedIn</div>
                    <div className="text-text-soft group-hover:text-lumon-dark text-sm">
                      tuliocunha
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Availability Status */}
            <div className="pane-border bg-lumon-bg rounded-lg p-6">
              <h3 className="text-cyan-bright mb-4 text-xl font-semibold">Current Availability</h3>
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-terminal-green h-3 w-3 animate-pulse rounded-full" />
                <span className="text-terminal-green font-medium">Available</span>
              </div>
              <p className="text-text-soft text-sm">
                Currently accepting new projects and consulting opportunities. Response time:
                Usually within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
