import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import LoadingScreen from '../LoadingScreen'

describe('LoadingScreen', () => {
  it('renders the ASCII art and progressbar immediately', () => {
    render(<LoadingScreen onComplete={() => {}} />)
    expect(screen.getByRole('img', { name: /vintage macintosh/i })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('calls onComplete after approximately 4000ms', async () => {
    const onComplete = vi.fn()
    render(<LoadingScreen onComplete={onComplete} />)
    
    // Initially onComplete should not have been called
    expect(onComplete).not.toHaveBeenCalled()
    
    // Wait for the completion (with extra buffer for test timing)
    await waitFor(() => expect(onComplete).toHaveBeenCalled(), {
      timeout: 5000
    })
    
    // Should be called exactly once
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('has correct accessibility attributes', () => {
    render(<LoadingScreen onComplete={() => {}} />)
    
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-valuenow', '0') // initial value
    
    const asciiArt = screen.getByRole('img', { name: /vintage macintosh/i })
    expect(asciiArt).toHaveAttribute('aria-label', 'Vintage Macintosh')
  })

  it('contains the ASCII art content', () => {
    render(<LoadingScreen onComplete={() => {}} />)
    
    // Check for distinctive parts of the ASCII art
    expect(screen.getByText(/iBook/)).toBeInTheDocument()
    // Check for the top border pattern
    expect(screen.getByText(/\.-+===-+\./)).toBeInTheDocument()
  })

  it('cleans up properly on unmount', () => {
    const onComplete = vi.fn()
    const { unmount } = render(<LoadingScreen onComplete={onComplete} />)
    
    // Unmount immediately
    unmount()
    
    // Component should unmount without errors
    expect(() => unmount()).not.toThrow()
  })

  it('has correct test attributes for automation', () => {
    render(<LoadingScreen onComplete={() => {}} />)
    
    expect(screen.getByTestId('loading-root')).toBeInTheDocument()
    expect(screen.getByTestId('progress')).toBeInTheDocument()
    expect(screen.getByTestId('bar')).toBeInTheDocument()
  })
})
