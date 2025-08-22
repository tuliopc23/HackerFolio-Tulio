import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { aboutContent as fallbackAbout } from '@/data/portfolio-data'

export default function About() {
  const aboutContent = fallbackAbout
  const formatMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1
            key={`h1-${line.substring(2).slice(0, 20)}`}
            className='text-3xl font-bold text-cyan-bright phosphor-glow mb-4'
          >
            {line.substring(2)}
          </h1>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2
            key={`h2-${line.substring(3).slice(0, 20)}`}
            className='text-2xl font-semibold text-cyan-bright mb-3 mt-6'
          >
            {line.substring(3)}
          </h2>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h3
            key={`h3-${line.substring(4).slice(0, 20)}`}
            className='text-xl font-medium text-cyan-soft mb-2 mt-4'
          >
            {line.substring(4)}
          </h3>
        )
      }
      if (line.startsWith('- **')) {
        const match = /- \*\*(.*?)\*\*(.*)/.exec(line)
        if (match) {
          return (
            <div key={`list-${match[1]?.slice(0, 20) ?? 'unknown'}`} className='mb-2'>
              <span className='text-cyan-bright font-medium'>{match[1]}</span>
              <span className='text-text-soft'>{match[2]}</span>
            </div>
          )
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div
            key={`bullet-${line.substring(2).slice(0, 20)}`}
            className='text-text-soft mb-1 ml-4'
          >
            {line.substring(2)}
          </div>
        )
      }
      if (line.trim() === '') {
        return <div key={`empty-${String(index)}`} className='mb-4' />
      }
      return (
        <p key={`para-${line.slice(0, 20)}`} className='text-text-soft mb-2'>
          {line}
        </p>
      )
    })
  }

  return (
    <div className='min-h-screen bg-lumon-dark text-text-cyan p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-cyan-soft hover:text-cyan-bright transition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Terminal
          </Link>
        </div>

        {/* Content */}
        <div className='pane-border rounded-lg p-8 bg-lumon-bg'>
          <div className='prose prose-invert max-w-none'>{formatMarkdown(aboutContent)}</div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <Link
            to='/contact'
            className='inline-block px-6 py-2 bg-neon-blue text-lumon-dark rounded hover:bg-cyan-bright transition-colors font-medium'
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </div>
  )
}
