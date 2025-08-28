import { useState } from 'react'

import FocusManager from '@/components/accessibility/focus-manager'
import SkipLinks from '@/components/accessibility/skip-links'
import DesktopBackground from '@/components/desktop/desktop-background'
import FloatingDockTerminal from '@/components/terminal/floating-dock-terminal'
import GhosttyTerminalWindow from '@/components/terminal/ghostty-terminal-window'
import SystemInfoPane from '@/components/terminal/system-info-pane'
import TerminalPane from '@/components/terminal/terminal-pane'

export default function Home() {
  const [terminalVisible, setTerminalVisible] = useState(true)
  const [terminalMinimized, setTerminalMinimized] = useState(false)

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

        {/* Ghostty Terminal Window */}
        {terminalVisible && !terminalMinimized && (
          <GhosttyTerminalWindow
            leftPane={<TerminalPane />}
            rightPane={<SystemInfoPane />}
            onClose={handleTerminalClose}
            onMinimize={handleTerminalMinimize}
            className='animate-in fade-in duration-300'
          />
        )}

        {/* Taskbar button to restore terminal */}
        {!terminalVisible && (
          <button
            onClick={handleRestoreTerminal}
            className='fixed bottom-4 left-4 px-4 py-2 bg-[#0a0a0a] border border-magenta-soft rounded-lg text-magenta-bright hover:bg-magenta-soft hover:bg-opacity-20 transition-colors animate-in fade-in focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50'
            aria-label='Open Terminal'
          >
            Open Terminal
          </button>
        )}
      </div>
    </FocusManager>
  )
}
