import { useState } from 'react'

import FocusManager from '@/components/accessibility/focus-manager'
import SkipLinks from '@/components/accessibility/skip-links'
import DesktopBackground from '@/components/desktop/desktop-background'
import FloatingDockTerminal from '@/components/terminal/floating-dock-terminal'
import ProjectsGridPane from '@/components/terminal/projects-grid-pane'
import SystemInfoPane from '@/components/terminal/system-info-pane'
import TerminalPane from '@/components/terminal/terminal-pane'
import TerminalWindow from '@/components/terminal/terminal-window'
import ResizeHandle from '@/components/ui/resize-handle'

export default function Home() {
  const [leftPaneWidth, setLeftPaneWidth] = useState(66.666667)
  const [terminalVisible, setTerminalVisible] = useState(true)
  const [terminalMinimized, setTerminalMinimized] = useState(false)

  const handleResize = (delta: number) => {
    const windowWidth = window.innerWidth
    const deltaPercent = (delta / windowWidth) * 100
    const newWidth = Math.max(30, Math.min(80, leftPaneWidth + deltaPercent))
    setLeftPaneWidth(newWidth)
  }

  const handleTerminalClose = () => {
    setTerminalVisible(false)
  }

  const handleTerminalMinimize = () => {
    setTerminalMinimized(!terminalMinimized)
  }

  const handleRestoreTerminal = () => {
    setTerminalVisible(true)
    setTerminalMinimized(false)
  }

  return (
    <FocusManager initialTrapFocus={false}>
      <SkipLinks />
      <div className='h-screen overflow-hidden'>
        {/* Desktop Background */}
        <DesktopBackground />

        {/* Floating Dock - Only show when terminal is minimized or closed */}
        {(!terminalVisible || terminalMinimized) && (
          <FloatingDockTerminal onRestoreTerminal={handleRestoreTerminal} />
        )}

        {/* Terminal Window */}
        {terminalVisible && !terminalMinimized && (
          <TerminalWindow
            title='HackerFolio Terminal v2.1.7'
            onClose={handleTerminalClose}
            onMinimize={handleTerminalMinimize}
            className='animate-in fade-in duration-300'
          >
            <div
              className='h-full grid gap-0 p-4'
              style={{
                gridTemplateColumns: `${String(leftPaneWidth)}% 4px ${String(100 - leftPaneWidth - 0.4)}%`,
                height: 'calc(100vh - 40px)', // Account for title bar
              }}
            >
              {/* Terminal Pane */}
              <div
                className='min-w-0'
                id='main-terminal'
                role='main'
                aria-label='Interactive Terminal'
              >
                <TerminalPane />
              </div>

              {/* Resize Handle */}
              <ResizeHandle onResize={handleResize} />

              {/* Right Panes Container */}
              <div className='grid grid-rows-2 gap-4 min-w-0'>
                <SystemInfoPane />
                <ProjectsGridPane />
              </div>
            </div>
          </TerminalWindow>
        )}

        {/* Taskbar button to restore terminal */}
        {!terminalVisible && (
          <button
            onClick={handleRestoreTerminal}
            className='fixed bottom-4 left-4 px-4 py-2 bg-lumon-bg border border-magenta-soft rounded-lg text-magenta-bright hover:bg-magenta-soft hover:bg-opacity-20 transition-colors animate-in fade-in focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50'
            aria-label='Open Terminal'
          >
            Open Terminal
          </button>
        )}
      </div>
    </FocusManager>
  )
}
