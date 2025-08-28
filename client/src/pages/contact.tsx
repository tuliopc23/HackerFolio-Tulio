import { Link } from '@tanstack/react-router'
import { ArrowLeft, Mail, Code2, MessageCircle, Users } from 'lucide-react'

import { contactContent as fallbackContact, profileData } from '@/data/portfolio-data'

export default function Contact() {
  const contactContent = fallbackContact
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
    <div className='min-h-screen bg-black text-text-cyan p-6'>
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

        <div className='grid gap-8 md:grid-cols-2'>
          {/* Content */}
          <div className='pane-border rounded-lg p-6 bg-[#0a0a0a]'>
            <div className='prose prose-invert max-w-none'>{formatMarkdown(contactContent)}</div>
          </div>

          {/* Contact Links */}
          <div className='space-y-4'>
            <div className='pane-border rounded-lg p-6 bg-[#0a0a0a]'>
              <h3 className='text-xl font-semibold text-cyan-bright mb-4'>Connect With Me</h3>

              <div className='space-y-3'>
                <a
                  href={`mailto:${profileData.contact.email}`}
                  className='flex items-center gap-3 p-3 border border-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors group'
                >
                  <Mail className='w-5 h-5 text-cyan-bright group-hover:text-[#f2f4f8]' />
                  <div>
                    <div className='font-medium'>Email</div>
                    <div className='text-sm text-text-soft group-hover:text-[#f2f4f8]'>
                      {profileData.contact.email}
                    </div>
                  </div>
                </a>

                <a
                  href={profileData.contact.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 p-3 border border-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors group'
                >
                  <Code2 className='w-5 h-5 text-cyan-bright group-hover:text-[#f2f4f8]' />
                  <div>
                    <div className='font-medium'>GitHub</div>
                    <div className='text-sm text-text-soft group-hover:text-[#f2f4f8]'>
                      @tuliocunha
                    </div>
                  </div>
                </a>

                <a
                  href={profileData.contact.twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 p-3 border border-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors group'
                >
                  <MessageCircle className='w-5 h-5 text-cyan-bright group-hover:text-[#f2f4f8]' />
                  <div>
                    <div className='font-medium'>Twitter</div>
                    <div className='text-sm text-text-soft group-hover:text-[#f2f4f8]'>
                      @tuliocunha
                    </div>
                  </div>
                </a>

                <a
                  href={profileData.contact.linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 p-3 border border-cyan-soft rounded hover:bg-cyan-soft hover:text-[#f2f4f8] transition-colors group'
                >
                  <Users className='w-5 h-5 text-cyan-bright group-hover:text-[#f2f4f8]' />
                  <div>
                    <div className='font-medium'>LinkedIn</div>
                    <div className='text-sm text-text-soft group-hover:text-[#f2f4f8]'>
                      tuliocunha
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Availability Status */}
            <div className='pane-border rounded-lg p-6 bg-[#0a0a0a]'>
              <h3 className='text-xl font-semibold text-cyan-bright mb-4'>Current Availability</h3>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-3 h-3 rounded-full bg-terminal-green animate-pulse' />
                <span className='text-terminal-green font-medium'>Available</span>
              </div>
              <p className='text-text-soft text-sm'>
                Currently accepting new projects and consulting opportunities. Response time:
                Usually within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
