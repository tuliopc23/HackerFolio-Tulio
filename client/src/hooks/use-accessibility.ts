import { useCallback, useEffect, useRef } from 'react'

export interface UseAccessibilityOptions {
  /** Whether to trap focus within the component */
  trapFocus?: boolean
  /** Initial element to focus on mount */
  autoFocus?: boolean
  /** Callback when Escape key is pressed */
  onEscape?: () => void
  /** Whether to restore focus on unmount */
  restoreFocus?: boolean
  /** Custom aria-label for screen readers */
  ariaLabel?: string
}

/**
 * Custom hook for managing accessibility features including focus management,
 * keyboard navigation, and screen reader support
 */
export function useAccessibility({
  trapFocus = false,
  autoFocus = false,
  onEscape,
  restoreFocus = true,
}: UseAccessibilityOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }, [])

  // Get all focusable elements within container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[contenteditable="true"]',
    ].join(', ')

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)).filter(
      (el): el is HTMLElement => {
        const element = el as HTMLElement
        return (
          element.offsetParent !== null &&
          getComputedStyle(element).visibility !== 'hidden' &&
          !element.hasAttribute('inert')
        )
      }
    )
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current) return

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break

        case 'Tab':
          if (trapFocus) {
            const focusableElements = getFocusableElements()
            if (focusableElements.length === 0) {
              event.preventDefault()
              return
            }

            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]

            if (event.shiftKey) {
              // Shift + Tab (backwards)
              if (document.activeElement === firstElement) {
                event.preventDefault()
                lastElement?.focus()
              }
            } else {
              // Tab (forwards)
              if (document.activeElement === lastElement) {
                event.preventDefault()
                firstElement?.focus()
              }
            }
          }
          break
      }
    },
    [trapFocus, onEscape, getFocusableElements]
  )

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      // Store previous focus
      if (restoreFocus) {
        previousFocusRef.current = document.activeElement as HTMLElement
      }

      // Focus container or first focusable element
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus()
      } else if (containerRef.current) {
        containerRef.current.focus()
      }
    }
  }, [autoFocus, restoreFocus, getFocusableElements])

  // Set up keyboard event listeners
  useEffect(() => {
    if (trapFocus || onEscape) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    return undefined // Explicit return for consistency
  }, [trapFocus, onEscape, handleKeyDown])

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [restoreFocus])

  return {
    containerRef,
    announce,
    getFocusableElements,
  }
}

/**
 * Hook for managing terminal-specific accessibility features
 */
export function useTerminalAccessibility() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `Terminal: ${message}`

    document.body.appendChild(announcement)

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }, [])

  const announceCommand = useCallback(
    (command: string) => {
      announce(`Command executed: ${command}`, 'assertive')
    },
    [announce]
  )

  const announceError = useCallback(
    (error: string) => {
      announce(`Error: ${error}`, 'assertive')
    },
    [announce]
  )

  const announceNavigation = useCallback(
    (location: string) => {
      announce(`Navigated to ${location}`, 'polite')
    },
    [announce]
  )

  return {
    announce,
    announceCommand,
    announceError,
    announceNavigation,
  }
}

/**
 * Hook for skip links functionality
 */
export function useSkipLinks() {
  const skipToMain = useCallback(() => {
    const mainContent =
      document.getElementById('main-terminal') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('main')

    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const skipToNavigation = useCallback(() => {
    const navigation =
      document.querySelector('[role="navigation"]') || document.querySelector('nav')

    if (navigation) {
      ;(navigation as HTMLElement).focus()
      navigation.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return {
    skipToMain,
    skipToNavigation,
  }
}
