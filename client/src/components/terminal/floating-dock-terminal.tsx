import { useNavigate } from '@tanstack/react-router'
import { Home, FolderOpen, User, Mail, Palette } from 'lucide-react'
import { useState } from 'react'

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

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'projects', icon: FolderOpen, label: 'Projects', path: '/projects' },
    { id: 'about', icon: User, label: 'About', path: '/about' },
    { id: 'contact', icon: Mail, label: 'Contact', path: '/contact' },
  ]

  const systemItems = [
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
        setTheme('lumon')
      },
    },
  ]

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
        className='flex items-center gap-2 mb-2 bg-lumon-bg border border-magenta-soft rounded-lg p-2'
        role='toolbar'
        aria-label='Window controls'
      >
        {trafficLights.map((light, index) => (
          <button
            key={`traffic-light-${light.color}-${index}`}
            onClick={light.action}
            className={`w-3 h-3 rounded-full ${light.color} hover:brightness-110 transition-all duration-200`}
            aria-label={
              index === 0 ? 'Close window' : index === 1 ? 'Minimize window' : 'Maximize window'
            }
            tabIndex={0}
          />
        ))}
      </div>

      {/* Dock Container */}
      {!isMinimized && (
        <div
          className='bg-lumon-bg border border-magenta-soft rounded-lg p-2 space-y-2'
          role='navigation'
          aria-label='Main navigation dock'
        >
          {/* Navigation Section */}
          <div className='space-y-1' role='group' aria-labelledby='nav-heading'>
            <div id='nav-heading' className='text-xs text-magenta-soft px-2 mb-1'>
              Navigation
            </div>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => void navigate({ to: item.path })}
                className='w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-cyan-bright hover:bg-magenta-soft hover:bg-opacity-20 transition-colors group focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50'
                title={item.label}
                aria-label={`Navigate to ${item.label}`}
              >
                <item.icon className='w-4 h-4' />
                <span className='text-xs'>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className='h-px bg-magenta-soft bg-opacity-30' />

          {/* System Section */}
          <div className='space-y-1' role='group' aria-labelledby='system-heading'>
            <div id='system-heading' className='text-xs text-magenta-soft px-2 mb-1'>
              System
            </div>
            {systemItems.map(item => (
              <button
                key={item.id}
                onClick={item.action}
                className='w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-cyan-bright hover:bg-magenta-soft hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50'
                title={item.label}
                aria-label={`System: ${item.label}`}
              >
                <item.icon className='w-4 h-4' />
                <span className='text-xs'>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
