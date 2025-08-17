import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { aboutContent } from '@/data/portfolio-data';

export default function About() {
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
      if (line.startsWith('### ')) {
        return (
          <h3 className="text-cyan-soft mt-4 mb-2 text-xl font-medium" key={index}>
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div className="mb-2" key={index}>
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

        {/* Content */}
        <div className="pane-border bg-lumon-bg rounded-lg p-8">
          <div className="prose prose-invert max-w-none">{formatMarkdown(aboutContent)}</div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            className="bg-neon-blue text-lumon-dark hover:bg-cyan-bright inline-block rounded px-6 py-2 font-medium transition-colors"
            href="/contact"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
