import { useEffect, type ReactNode } from 'react'

import { useFocusManager } from '@/components/accessibility/focus-manager'

interface MobileTerminalLayoutProps {
  terminalPane: ReactNode
  systemPane: ReactNode
  onClose?: (() => void) | undefined
  onMinimize?: (() => void) | undefined
  onMaximize?: (() => void) | undefined
  className?: string | undefined
}

export default function MobileTerminalLayout({
  terminalPane,
  systemPane,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: MobileTerminalLayoutProps) {
  const { setTrapFocus } = useFocusManager()

  // Lock body scroll and trap focus when terminal is active
  useEffect(() => {
    document.body.classList.add('ghostty-active')
    setTrapFocus(true)
    return () => {
      document.body.classList.remove('ghostty-active')
      setTrapFocus(false)
    }
  }, [setTrapFocus])

  return (
    <div
      className={`fixed inset-0 bg-[#0a0a0a] overflow-y-auto ios-inertia mobile-terminal-container ${className}`}
      aria-label='Terminal window'
      aria-roledescription='Terminal window'
    >
      {/* Notch-aware header */}
      <header
        className='sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur mobile-header mobile-titlebar flex items-center justify-end px-4'
        aria-hidden='true'
        style={{
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          paddingBottom: '12px',
        }}
      >
        {/* Apple logo */}
        <div className='flex items-center'>
          <svg
            viewBox='0 0 24 24'
            className='w-5 h-5 text-white fill-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer'
            aria-label='Apple logo'
          >
            <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
          </svg>
        </div>
      </header>

      {/* Scrollable content area */}
      <main className='mobile-terminal-content pb-8' style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        {/* Terminal pane - full width */}
        <section className='mobile-section px-4'>
          <div
            className='bg-[#0a0a0a] border border-[#393939] rounded-2xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.15)] grid grid-rows-[auto_1fr] transition-colors duration-200 hover:border-[#be95ff]'
            role='group'
            aria-label='Terminal pane'
          >
            <div className='px-[14px] py-[10px] border-b border-white/[0.04] flex items-center justify-between flex-shrink-0'>
              <div>
                <span className='font-mono text-terminal-header terminal-subtitle text-[#be95ff] tracking-[0.3px]'>
                  [pane-01]
                </span>
                <span className='ml-2 text-terminal-label terminal-caption text-[#dde1e6] opacity-60'>
                  terminal
                </span>
              </div>
              <div
                className='w-2 h-2 rounded-full bg-[#42be65] shadow-[0_0_6px_rgba(66,190,101,0.6)]'
                aria-label='Terminal active'
              />
            </div>
            <div className='p-[14px] font-mono text-terminal-prompt terminal-body text-[#f2f4f8] overflow-y-auto overflow-x-hidden ios-inertia content-visibility-auto composite-layer min-h-[50vh]'>
              {terminalPane}
            </div>
          </div>
        </section>

        {/* System info pane - full width, cards rendered inline */}
        <section className='mobile-section px-4'>
          <div
            className='bg-[#0a0a0a] border border-[#393939] rounded-2xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.15)] grid grid-rows-[auto_1fr] transition-colors duration-200 hover:border-[#be95ff]'
            role='group'
            aria-label='System information pane'
          >
            <div className='px-[14px] py-[10px] border-b border-white/[0.04] flex items-center justify-between flex-shrink-0'>
              <div>
                <span className='font-mono text-terminal-header terminal-subtitle text-[#be95ff] tracking-[0.3px]'>
                  [pane-02]
                </span>
                <span className='ml-2 text-terminal-label terminal-caption text-[#dde1e6] opacity-60'>
                  system
                </span>
              </div>
              <div
                className='w-2 h-2 rounded-full bg-[#42be65] shadow-[0_0_6px_rgba(66,190,101,0.6)]'
                aria-label='System online'
              />
            </div>
            <div className='p-[14px] font-mono text-terminal-body terminal-body text-[#f2f4f8] overflow-y-auto overflow-x-hidden ios-inertia content-visibility-auto composite-layer'>
              {systemPane}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
