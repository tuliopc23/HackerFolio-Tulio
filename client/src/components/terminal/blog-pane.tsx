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
      excerpt: 'How to create authentic terminal experiences in the browser with modern web technologies.',
      date: '2024-08-10',
      readTime: '5 min',
      url: 'https://blog.tuliocunha.dev/terminal-ui-react',
      tags: ['React', 'Terminal', 'UI/UX']
    },
    {
      id: '2', 
      title: 'Rust for TypeScript Developers',
      excerpt: 'A practical guide to learning Rust coming from a JavaScript/TypeScript background.',
      date: '2024-08-05',
      readTime: '8 min',
      url: 'https://blog.tuliocunha.dev/rust-for-ts-devs',
      tags: ['Rust', 'TypeScript', 'Learning']
    },
    {
      id: '3',
      title: 'M4 Max Development Setup',
      excerpt: 'Complete development environment setup for Apple Silicon with all the tools you need.',
      date: '2024-07-28',
      readTime: '12 min',
      url: 'https://blog.tuliocunha.dev/m4-dev-setup',
      tags: ['macOS', 'Development', 'Tools']
    }
  ];

  const quickLinks = [
    { label: 'GitHub', url: 'https://github.com/tuliocunha', icon: Github },
    { label: 'Blog RSS', url: 'https://blog.tuliocunha.dev/rss', icon: Rss },
    { label: 'Dev.to', url: 'https://dev.to/tuliocunha', icon: BookOpen }
  ];

  const handlePostClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleQuickLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="pane-border rounded-lg overflow-hidden flex flex-col h-full" aria-label="Blog & Resources">
      <div className="bg-lumon-border px-4 py-2 border-b border-cyan-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-04]</span>
          <span className="text-text-soft">blog & resources</span>
        </div>
        <BookOpen className="w-4 h-4 text-cyan-bright" />
      </div>

      <div className="flex-1 p-4 bg-lumon-bg overflow-y-auto">
        <div className="grid grid-cols-[2fr_1fr] gap-6">
          {/* Recent Blog Posts */}
          <div className="space-y-3">
            <div className="text-cyan-bright font-medium text-sm mb-3">Latest Articles</div>
            
            {blogPosts.map((post) => (
              <div 
                key={post.id}
                className="p-3 bg-lumon-dark border border-lumon-border rounded hover:border-cyan-soft transition-colors cursor-pointer group"
                onClick={() => handlePostClick(post.url)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-cyan-bright text-sm font-medium group-hover:text-neon-blue transition-colors">
                    {post.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-text-soft group-hover:text-cyan-bright transition-colors flex-shrink-0 ml-2" />
                </div>
                
                <p className="text-text-soft text-xs mb-2 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-text-soft">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-lumon-bg border border-cyan-soft rounded text-xs text-cyan-bright"
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
              onClick={() => window.open('https://blog.tuliocunha.dev', '_blank')}
              className="w-full p-2 border border-cyan-soft text-cyan-soft rounded hover:bg-cyan-soft hover:text-lumon-dark transition-colors text-sm"
            >
              View All Posts →
            </button>
          </div>

          {/* Quick Links & Useful Info */}
          <div className="space-y-4">
            {/* Quick Links */}
            <div>
              <div className="text-cyan-bright font-medium text-sm mb-3">Quick Links</div>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleQuickLink(link.url)}
                    className="w-full flex items-center gap-2 p-2 border border-lumon-border rounded hover:border-cyan-soft hover:bg-lumon-border transition-colors text-sm group"
                  >
                    <link.icon className="w-4 h-4 text-cyan-bright group-hover:text-neon-blue transition-colors" />
                    <span className="text-text-soft group-hover:text-cyan-bright transition-colors">
                      {link.label}
                    </span>
                    <ExternalLink className="w-3 h-3 text-text-soft group-hover:text-cyan-bright transition-colors ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Writing Stats */}
            <div>
              <div className="text-cyan-bright font-medium text-sm mb-3">Writing Stats</div>
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
              <div className="text-cyan-bright font-medium text-sm mb-3">Popular Topics</div>
              <div className="flex flex-wrap gap-1">
                {['React', 'Rust', 'TypeScript', 'Swift', 'DevOps', 'macOS'].map((topic) => (
                  <span 
                    key={topic}
                    className="px-2 py-1 bg-lumon-dark border border-cyan-soft rounded text-xs text-cyan-bright cursor-pointer hover:bg-cyan-soft hover:text-lumon-dark transition-colors"
                    onClick={() => window.open(`https://blog.tuliocunha.dev/topics/${topic.toLowerCase()}`, '_blank')}
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
      <div className="bg-lumon-border px-4 py-2 border-t border-cyan-soft text-xs text-text-soft">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <span><kbd className="bg-lumon-dark px-1 rounded">Cmd+K</kbd> search blog</span>
            <span><kbd className="bg-lumon-dark px-1 rounded">Cmd+B</kbd> bookmark</span>
          </div>
          <div className="text-terminal-green">
            ✓ RSS feed available
          </div>
        </div>
      </div>
    </div>
  );
}