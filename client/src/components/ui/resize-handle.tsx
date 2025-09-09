import { useState, useCallback, useEffect, type MouseEvent as ReactMouseEvent } from 'react'

interface ResizeHandleProps {
  onResize: (delta: number) => void
  className?: string
}

export default function ResizeHandle({ onResize, className = '' }: ResizeHandleProps) {
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
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
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
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // Could implement keyboard resize here
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
