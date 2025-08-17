import { BookOpen, ExternalLink, Calendar, Clock, Github, Rss } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  url: string;
  tags: string[];
}

export default function BlogPane() {
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Building Terminal UIs with React',
      excerpt:
        'How to create authentic terminal experiences in the browser with modern web technologies.',
      date: '2024-08-10',
      readTime: '5 min',
      url: 'https://blog.tuliocunha.dev/terminal-ui-react',
      tags: ['React', 'Terminal', 'UI/UX'],
    },
    {
      id: '2',
      title: 'Rust for TypeScript Developers',
      excerpt: 'A practical guide to learning Rust coming from a JavaScript/TypeScript background.',
      date: '2024-08-05',
      readTime: '8 min',
      url: 'https://blog.tuliocunha.dev/rust-for-ts-devs',
      tags: ['Rust', 'TypeScript', 'Learning'],
    },
    {
      id: '3',
      title: 'M4 Max Development Setup',
      excerpt:
        'Complete development environment setup for Apple Silicon with all the tools you need.',
      date: '2024-07-28',
      readTime: '12 min',
      url: 'https://blog.tuliocunha.dev/m4-dev-setup',
      tags: ['macOS', 'Development', 'Tools'],
    },
  ];

  const quickLinks = [
    { label: 'GitHub', url: 'https://github.com/tuliocunha', icon: Github },
    { label: 'Blog RSS', url: 'https://blog.tuliocunha.dev/rss', icon: Rss },
    { label: 'Dev.to', url: 'https://dev.to/tuliocunha', icon: BookOpen },
  ];

  const handlePostClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleQuickLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div
      aria-label="Blog & Resources"
      className="pane-border flex h-full flex-col overflow-hidden rounded-lg"
    >
      <div className="bg-lumon-border border-cyan-soft flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-04]</span>
          <span className="text-text-soft">blog & resources</span>
        </div>
        <BookOpen className="text-cyan-bright h-4 w-4" />
      </div>

      <div className="bg-lumon-bg flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-[2fr_1fr] gap-6">
          {/* Recent Blog Posts */}
          <div className="space-y-3">
            <div className="text-cyan-bright mb-3 text-sm font-medium">Latest Articles</div>

            {blogPosts.map((post) => (
              <div
                className="bg-lumon-dark border-lumon-border hover:border-cyan-soft group cursor-pointer rounded border p-3 transition-colors"
                key={post.id}
                onClick={() => handlePostClick(post.url)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-cyan-bright group-hover:text-neon-blue text-sm font-medium transition-colors">
                    {post.title}
                  </h4>
                  <ExternalLink className="text-text-soft group-hover:text-cyan-bright ml-2 h-3 w-3 flex-shrink-0 transition-colors" />
                </div>

                <p className="text-text-soft mb-2 text-xs leading-relaxed">{post.excerpt}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="text-text-soft flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        className="bg-lumon-bg border-cyan-soft text-cyan-bright rounded border px-2 py-1 text-xs"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* View All Posts Button */}
            <button
              className="border-cyan-soft text-cyan-soft hover:bg-cyan-soft hover:text-lumon-dark w-full rounded border p-2 text-sm transition-colors"
              onClick={() => window.open('https://blog.tuliocunha.dev', '_blank')}
            >
              View All Posts →
            </button>
          </div>

          {/* Quick Links & Useful Info */}
          <div className="space-y-4">
            {/* Quick Links */}
            <div>
              <div className="text-cyan-bright mb-3 text-sm font-medium">Quick Links</div>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <button
                    className="border-lumon-border hover:border-cyan-soft hover:bg-lumon-border group flex w-full items-center gap-2 rounded border p-2 text-sm transition-colors"
                    key={link.label}
                    onClick={() => handleQuickLink(link.url)}
                  >
                    <link.icon className="text-cyan-bright group-hover:text-neon-blue h-4 w-4 transition-colors" />
                    <span className="text-text-soft group-hover:text-cyan-bright transition-colors">
                      {link.label}
                    </span>
                    <ExternalLink className="text-text-soft group-hover:text-cyan-bright ml-auto h-3 w-3 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Writing Stats */}
            <div>
              <div className="text-cyan-bright mb-3 text-sm font-medium">Writing Stats</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-soft">Total Articles:</span>
                  <span className="text-terminal-green font-medium">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-soft">Total Views:</span>
                  <span className="text-terminal-green font-medium">15.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-soft">Avg. Read Time:</span>
                  <span className="text-terminal-green font-medium">7 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-soft">Last Updated:</span>
                  <span className="text-terminal-green font-medium">2 days ago</span>
                </div>
              </div>
            </div>

            {/* Topics */}
            <div>
              <div className="text-cyan-bright mb-3 text-sm font-medium">Popular Topics</div>
              <div className="flex flex-wrap gap-1">
                {['React', 'Rust', 'TypeScript', 'Swift', 'DevOps', 'macOS'].map((topic) => (
                  <span
                    className="bg-lumon-dark border-cyan-soft text-cyan-bright hover:bg-cyan-soft hover:text-lumon-dark cursor-pointer rounded border px-2 py-1 text-xs transition-colors"
                    key={topic}
                    onClick={() =>
                      window.open(
                        `https://blog.tuliocunha.dev/topics/${topic.toLowerCase()}`,
                        '_blank',
                      )
                    }
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with useful shortcuts */}
      <div className="bg-lumon-border border-cyan-soft text-text-soft border-t px-4 py-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <span>
              <kbd className="bg-lumon-dark rounded px-1">Cmd+K</kbd> search blog
            </span>
            <span>
              <kbd className="bg-lumon-dark rounded px-1">Cmd+B</kbd> bookmark
            </span>
          </div>
          <div className="text-terminal-green">✓ RSS feed available</div>
        </div>
      </div>
    </div>
  );
}
