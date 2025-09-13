import { useEffect, useState, type ReactNode } from 'react'

import ResizeHandle from '@/components/ui/resize-handle'

interface GhosttyTerminalWindowProps {
  leftPane: ReactNode
  rightPane: ReactNode
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  className?: string
}

export default function GhosttyTerminalWindow({
  leftPane,
  rightPane,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: GhosttyTerminalWindowProps) {
  const [leftPaneWidth, setLeftPaneWidth] = useState(50) // percentage

  // Lock body scroll when terminal is active
  useEffect(() => {
    document.body.classList.add('ghostty-active')
    return () => {
      document.body.classList.remove('ghostty-active')
    }
  }, [])

  const handleResize = (delta: number) => {
    // Convert pixel delta to percentage based on container width
    const container = document.querySelector('[data-terminal-container]')
    if (!container) return

    const containerWidth = container.clientWidth
    const deltaPercent = (delta / containerWidth) * 100

    const newWidth = Math.max(20, Math.min(80, leftPaneWidth + deltaPercent))
    setLeftPaneWidth(newWidth)
  }

  return (
    // Reserve space above the footer/status bar and keep centered
    <div className='fixed left-0 right-0 top-0 bottom-4 sm:bottom-6 md:bottom-10 grid place-items-center z-40'>
      {/* Outer wrapper uses drop-shadow to reduce Safari rasterization cost */}
      <div style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.6))' }}>
        <section
          className={`crt-screen w-[min(98vw,1800px)] h-[min(95dvh,1350px)] max-h-[calc(100dvh-16px)] sm:max-h-[calc(100dvh-24px)] md:max-h-[calc(100dvh-40px)] bg-[#0a0a0a] rounded-[20px] shadow-[0_0_0_1px_rgba(255,255,255,0.03),inset_0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col contain-paint ${className}`}
          aria-label='Terminal window'
          style={{ backgroundColor: '#0a0a0a' }}
        >
          {/* Titlebar with traffic lights on LEFT */}
          <div className='flex items-center justify-between h-9 px-4 py-2' aria-hidden='true'>
            <div className='flex gap-2 items-center'>
              <button
                className='w-[11px] h-[11px] rounded-full border-none cursor-pointer transition-all duration-150 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#ff5f56] to-[#e94b3c] hover:scale-110 hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-bright focus-visible:outline-offset-2'
                onClick={onClose}
                aria-label='Close window'
                title='Close'
              />
              <button
                className='w-[11px] h-[11px] rounded-full border-none cursor-pointer transition-all duration-150 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#ffbd2e] to-[#ffa500] hover:scale-110 hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-bright focus-visible:outline-offset-2'
                onClick={onMinimize}
                aria-label='Minimize window'
                title='Minimize'
              />
              <button
                className='w-[11px] h-[11px] rounded-full border-none cursor-pointer transition-all duration-150 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#27c93f] to-[#1db954] hover:scale-110 hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-bright focus-visible:outline-offset-2'
                onClick={onMaximize}
                aria-label='Maximize window'
                title='Maximize'
              />
            </div>

            {/* White Apple logo on the right */}
            <div className='flex items-center'>
              <svg
                viewBox='0 0 24 24'
                className='w-5 h-5 text-white fill-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer'
                aria-label='Apple logo'
              >
                <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
              </svg>
            </div>
          </div>

          {/* Terminal content - scrollable */}
          <div className='flex-1 overflow-hidden bg-[#0a0a0a]' data-terminal-container>
            <div className='flex h-full p-4 gap-1'>
              {/* Left pane - Terminal */}
              <div
                className='bg-[#0a0a0a] border border-[#393939] rounded-2xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.15)] flex flex-col transition-colors duration-200 hover:border-[#be95ff]'
                role='group'
                aria-label='Terminal pane'
                style={{ width: `${String(leftPaneWidth)}%` }}
              >
                <div className='px-[14px] py-[10px] border-b border-white/[0.04] flex items-center justify-between'>
                  <div>
                    <span className='font-mono text-[12px] font-semibold text-[#be95ff] tracking-[0.3px]'>
                      [pane-01]
                    </span>
                    <span className='ml-2 text-[12px] text-[#dde1e6] opacity-60'>terminal</span>
                  </div>
                  <div
                    className='w-2 h-2 rounded-full bg-[#42be65] shadow-[0_0_6px_rgba(66,190,101,0.6)]'
                    aria-label='Terminal active'
                  />
                </div>
                <div className='flex-1 p-[14px] font-mono text-[13.5px] leading-[1.5] text-[#f2f4f8] overflow-y-auto overflow-x-hidden ios-inertia composite-layer'>
                  {leftPane}
                </div>
              </div>

              {/* Resize Handle */}
              <div className='flex items-center justify-center w-2'>
                <ResizeHandle
                  onResize={handleResize}
                  className='w-full h-16 flex items-center justify-center hover:bg-[rgba(190,149,255,0.1)] rounded text-[#be95ff] hover:text-[#82cfff] transition-colors duration-200'
                />
              </div>

              {/* Right pane - System */}
              <div
                className='bg-[#0a0a0a] border border-[#393939] rounded-2xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.15)] flex flex-col transition-colors duration-200 hover:border-[#be95ff]'
                role='group'
                aria-label='System information pane'
                style={{ width: `${String(100 - leftPaneWidth)}%` }}
              >
                <div className='px-[14px] py-[10px] border-b border-white/[0.04] flex items-center justify-between'>
                  <div>
                    <span className='font-mono text-[12px] font-semibold text-[#be95ff] tracking-[0.3px]'>
                      [pane-02]
                    </span>
                    <span className='ml-2 text-[12px] text-[#dde1e6] opacity-60'>system</span>
                  </div>
                  <div
                    className='w-2 h-2 rounded-full bg-[#42be65] shadow-[0_0_6px_rgba(66,190,101,0.6)]'
                    aria-label='System online'
                  />
                </div>
                <div className='flex-1 p-[14px] font-mono text-[12.5px] leading-[1.5] text-[#f2f4f8] overflow-y-auto overflow-x-hidden ios-inertia composite-layer'>
                  {rightPane}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
