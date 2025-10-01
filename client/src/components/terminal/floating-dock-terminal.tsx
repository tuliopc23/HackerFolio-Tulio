import { useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'

import { Home, FolderOpen, Palette } from '@/components/icons/custom-icons'
import { useTerminalAccessibility } from '@/hooks/use-accessibility'

import { useTheme } from './theme-context'

// Terminal icon component - moved outside render to avoid recreation
const TerminalIcon = () => (
  <div className='w-4 h-4 border border-current rounded bg-current bg-opacity-20' />
)

interface FloatingDockTerminalProps {
  onRestoreTerminal?: () => void
}

export default function FloatingDockTerminal({ onRestoreTerminal }: FloatingDockTerminalProps) {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const [isMinimized, setIsMinimized] = useState(false)
  const { announceNavigation } = useTerminalAccessibility()

  // OPTIMIZATION: Memoize navigation items to prevent recreation on every render
  const navigationItems = useMemo(
    () => [
      { id: 'home', icon: Home, label: 'Home', path: '/' },
      { id: 'projects', icon: FolderOpen, label: 'Projects', path: '/projects' },
    ],
    []
  )

  // OPTIMIZATION: Memoize system items to prevent recreation on every render
  const systemItems = useMemo(
    () => [
      {
        id: 'terminal',
        icon: TerminalIcon,
        label: 'Terminal',
        action: () => {
          if (onRestoreTerminal) onRestoreTerminal()
        },
      },
      {
        id: 'theme',
        icon: Palette,
        label: 'Theme',
        action: () => {
          // Dark-only theme; no cycling
          setTheme('oxocarbon')
        },
      },
    ],
    [onRestoreTerminal, setTheme]
  )

  const trafficLights = [
    {
      color: 'bg-terminal-red',
      action: () => {
        // Close action placeholder
      },
    },
    {
      color: 'bg-terminal-orange',
      action: () => {
        setIsMinimized(!isMinimized)
      },
    },
    {
      color: 'bg-terminal-green',
      action: () => {
        // Maximize action placeholder
      },
    },
  ]

  return (
    <div className='fixed top-4 right-4 z-50 hidden md:block'>
      {/* Traffic Lights */}
      <div
        className='flex items-center gap-2 mb-2 bg-[#0a0a0a] border border-[#393939] rounded-lg p-2'
        role='toolbar'
        aria-label='Window controls'
      >
        {trafficLights.map((light, index) => {
          const labels = ['Close window', 'Minimize window', 'Maximize window']
          return (
            <button
              key={`traffic-light-${light.color}`}
              onClick={light.action}
              className={`w-3 h-3 rounded-full ${light.color} hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
              aria-label={labels[index]}
              tabIndex={0}
            />
          )
        })}
      </div>

      {/* Dock Container */}
      {!isMinimized && (
        <div
          className='bg-[#0a0a0a] border border-[#393939] rounded-lg p-2 space-y-2'
          role='navigation'
          aria-label='Main navigation dock'
        >
          {/* Navigation Section */}
          <div className='space-y-1' role='group' aria-labelledby='nav-heading'>
            <div
              id='nav-heading'
              className='text-terminal-meta terminal-subtitle text-[#be95ff] px-2 mb-1'
            >
              Navigation
            </div>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  void navigate({ to: item.path })
                  announceNavigation(item.label)
                }}
                className='w-full flex items-center gap-2 px-3 py-2 rounded text-terminal-body terminal-body text-[#33b1ff] hover:bg-[#393939] hover:bg-opacity-60 transition-colors group focus:outline-none focus:ring-2 focus:ring-[#33b1ff] focus:ring-opacity-50'
                title={item.label}
                aria-label={`Navigate to ${item.label}`}
              >
                <item.icon className='w-4 h-4' aria-hidden='true' />
                <span className='text-terminal-label terminal-body'>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className='h-px bg-[#393939] bg-opacity-60' role='separator' aria-hidden='true' />

          {/* System Section */}
          <div className='space-y-1' role='group' aria-labelledby='system-heading'>
            <div
              id='system-heading'
              className='text-terminal-meta terminal-subtitle text-[#be95ff] px-2 mb-1'
            >
              System
            </div>
            {systemItems.map(item => (
              <button
                key={item.id}
                onClick={item.action}
                className='w-full flex items-center gap-2 px-3 py-2 rounded text-terminal-body terminal-body text-[#33b1ff] hover:bg-[#393939] hover:bg-opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#33b1ff] focus:ring-opacity-50'
                title={item.label}
                aria-label={`System: ${item.label}`}
              >
                <item.icon className='w-4 h-4' />
                <span className='text-terminal-label terminal-body'>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
