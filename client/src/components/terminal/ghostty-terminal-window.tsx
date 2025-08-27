import React, { useEffect, useState } from 'react'
import ResizeHandle from '@/components/ui/resize-handle'

interface GhosttyTerminalWindowProps {
  leftPane: React.ReactNode
  rightPane: React.ReactNode
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
    <section
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,1600px)] h-[min(85vh,1200px)] bg-lumon-bg rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03),inset_0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col z-40 ${className}`}
      role='region'
      aria-label='Terminal window'
    >
      {/* Titlebar with traffic lights on LEFT */}
      <div
        className='flex items-center justify-start h-9 px-4 py-2 border-b border-white/[0.04]'
        aria-hidden='true'
      >
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
      </div>

      {/* Terminal content - scrollable */}
      <div 
        className='flex-1 overflow-hidden bg-lumon-bg'
        data-terminal-container
      >
        <div className='flex h-full p-4 gap-1'>
          {/* Left pane - Terminal */}
          <div
            className='bg-lumon-bg border border-[rgba(122,0,255,0.25)] rounded-2xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.15)] flex flex-col transition-colors duration-200 hover:border-[rgba(122,0,255,0.4)] focus-within:border-[rgba(122,0,255,0.4)]'
            role='group'
            aria-label='Terminal pane'
            style={{ width: `${leftPaneWidth}%` }}
          >
            <div className='px-[14px] py-[10px] border-b border-white/[0.04] flex items-center justify-between'>
              <div>
                <span className='font-mono text-[11px] font-semibold text-[rgba(122,0,255,0.9)] tracking-[0.3px]'>
                  [pane-01]
                </span>
                <span className='ml-2 text-[11px] text-[rgba(235,241,255,0.6)]'>terminal</span>
              </div>
              <div
                className='w-2 h-2 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.4)]'
                aria-label='Terminal active'
              />
            </div>
            <div className='flex-1 p-[14px] font-mono text-[12.5px] leading-[1.5] text-[rgba(235,241,255,0.9)] overflow-y-auto overflow-x-hidden'>
              {leftPane}
            </div>
          </div>

          {/* Resize Handle */}
          <div className='flex items-center justify-center w-2'>
            <ResizeHandle 
              onResize={handleResize}
              className='w-full h-16 flex items-center justify-center hover:bg-[rgba(122,0,255,0.1)] rounded text-[rgba(122,0,255,0.6)] hover:text-[rgba(122,0,255,0.9)] transition-colors duration-200'
            />
          </div>

          {/* Right pane - System */}
          <div
            className='bg-lumon-bg border border-[rgba(122,0,255,0.25)] rounded-2xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.15)] flex flex-col transition-colors duration-200 hover:border-[rgba(122,0,255,0.4)] focus-within:border-[rgba(122,0,255,0.4)]'
            role='group'
            aria-label='System information pane'
            style={{ width: `${100 - leftPaneWidth}%` }}
          >
            <div className='px-[14px] py-[10px] border-b border-white/[0.04] flex items-center justify-between'>
              <div>
                <span className='font-mono text-[11px] font-semibold text-[rgba(122,0,255,0.9)] tracking-[0.3px]'>
                  [pane-02]
                </span>
                <span className='ml-2 text-[11px] text-[rgba(235,241,255,0.6)]'>system</span>
              </div>
              <div
                className='w-2 h-2 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.4)]'
                aria-label='System online'
              />
            </div>
            <div className='flex-1 p-[14px] font-mono text-[12.5px] leading-[1.5] text-[rgba(235,241,255,0.9)] overflow-y-auto overflow-x-hidden'>
              {rightPane}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
