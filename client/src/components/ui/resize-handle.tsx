import { useState, useCallback, useEffect, type MouseEvent as ReactMouseEvent } from 'react'

interface ResizeHandleProps {
  onResize: (delta: number) => void
  className?: string
  currentLeftWidthPct?: number
  minPct?: number
  maxPct?: number
  stepPct?: number
}

export default function ResizeHandle({
  onResize,
  className = '',
  currentLeftWidthPct: _currentLeftWidthPct,
  minPct: _minPct = 20,
  maxPct: _maxPct = 80,
  stepPct = 2,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const delta = e.clientX - startX
      onResize(delta)
      setStartX(e.clientX)
    },
    [isDragging, startX, onResize]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse move and up listeners when dragging
  useEffect(() => {
    if (!isDragging) {
      return () => {
        /* intentional noop - no cleanup needed when not dragging */
      }
    }
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <button
      className={`resize-handle ${className} ${isDragging ? 'opacity-100' : ''}`}
      onMouseDown={handleMouseDown}
      type='button'
      aria-label='Resize panes'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // No-op: enter activates but resize is via arrows
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          const container = document.querySelector('[data-terminal-container]')
          const width = container?.clientWidth ?? 0
          if (!width) return
          const dir = e.key === 'ArrowLeft' ? -1 : 1
          const delta = (stepPct / 100) * width * dir
          onResize(delta)
        } else if (e.key === 'PageUp' || e.key === 'PageDown') {
          e.preventDefault()
          const container = document.querySelector('[data-terminal-container]')
          const width = container?.clientWidth ?? 0
          if (!width) return
          const dir = e.key === 'PageDown' ? -1 : 1
          const step = Math.max(stepPct * 2, 5)
          const delta = (step / 100) * width * dir
          onResize(delta)
        }
      }}
      style={{ cursor: 'col-resize' }}
    >
      {/* Visual indicator for resize handle */}
      <div className='w-full h-full flex items-center justify-center'>
        <div className='w-1 h-8 bg-current opacity-30' />
      </div>
    </button>
  )
}
