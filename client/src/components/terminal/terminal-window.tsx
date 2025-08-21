import React, { useState, useRef } from 'react'

interface TerminalWindowProps {
  children: React.ReactNode
  title?: string
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  className?: string
}

export default function TerminalWindow({
  children,
  title = 'Terminal',
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: TerminalWindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isMaximized, setIsMaximized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, windowX: 0, windowY: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return

    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: position.x,
      windowY: position.y,
    }
  }

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || isMaximized) return

      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      setPosition({
        x: Math.max(
          0,
          Math.min(
            (typeof window !== 'undefined' ? window.innerWidth : 1200) - 800,
            dragStartRef.current.windowX + deltaX
          )
        ),
        y: Math.max(
          0,
          Math.min(
            (typeof window !== 'undefined' ? window.innerHeight : 800) - 600,
            dragStartRef.current.windowY + deltaY
          )
        ),
      })
    },
    [isDragging, isMaximized]
  )

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach global mouse events for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return () => {
      /* intentional noop - cleanup not needed */
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
    if (onMaximize) onMaximize()
  }

  const windowStyle = isMaximized
    ? { top: 0, left: 0, width: '100vw', height: '100vh' }
    : {
        top: `${String(position.y)}px`,
        left: `${String(position.x)}px`,
        width: '90vw',
        maxWidth: '1400px',
        height: '80vh',
        maxHeight: '900px',
      }

  return (
    <div
      ref={windowRef}
      className={`fixed z-40 bg-lumon-bg border border-magenta-soft rounded-lg shadow-2xl overflow-hidden ${className}`}
      style={windowStyle}
    >
      {/* Window Title Bar */}
      <div
        className='bg-lumon-border border-b border-magenta-soft px-4 py-2 flex items-center justify-between cursor-move select-none'
        onMouseDown={handleMouseDown}
      >
        {/* Traffic Lights */}
        <div className='flex items-center gap-2'>
          <button
            onClick={onClose}
            className='w-3 h-3 rounded-full bg-terminal-red hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terminal-red focus:ring-opacity-50'
            aria-label='Close window'
            title='Close'
          />
          <button
            onClick={onMinimize}
            className='w-3 h-3 rounded-full bg-terminal-orange hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terminal-orange focus:ring-opacity-50'
            aria-label='Minimize window'
            title='Minimize'
          />
          <button
            onClick={handleMaximize}
            className='w-3 h-3 rounded-full bg-terminal-green hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-opacity-50'
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
            title={isMaximized ? 'Restore' : 'Maximize'}
          />
        </div>

        {/* Window Title */}
        <div className='absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-terminal-green animate-pulse' />
          <span className='text-magenta-bright font-medium text-sm'>{title}</span>
        </div>

        {/* Empty space for balance */}
        <div className='w-16'></div>
      </div>

      {/* Window Content */}
      <div className='h-full overflow-hidden'>{children}</div>
    </div>
  )
}
