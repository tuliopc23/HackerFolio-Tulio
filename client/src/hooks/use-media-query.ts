import { useState, useEffect } from 'react'

/**
 * Custom hook to detect media query matches
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR-safe: return false during server-side rendering
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    // Skip if not in browser
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)

    // Update state when media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * Predefined breakpoints for common use cases
 */
export const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  tabletLandscape: '(min-width: 768px) and (max-width: 1023px) and (orientation: landscape)',
  tabletPortrait: '(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)',
  desktop: '(min-width: 1024px)',
  touchDevice: '(hover: none) and (pointer: coarse)',
  highRefreshRate: '(prefers-reduced-motion: no-preference)',
} as const

/**
 * Mobile detection hook (phones only, ≤767px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery(breakpoints.mobile)
}

/**
 * Check if device should use compact ASCII
 * Mobile phones OR iPad landscape
 */
export function useCompactASCII(): boolean {
  const isMobile = useMediaQuery(breakpoints.mobile)
  const isTabletLandscape = useMediaQuery(breakpoints.tabletLandscape)
  return isMobile || isTabletLandscape
}

/**
 * Tablet detection hook
 */
export function useIsTablet(): boolean {
  return useMediaQuery(breakpoints.tablet)
}

/**
 * Desktop detection hook
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.desktop)
}

/**
 * Touch device detection hook
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery(breakpoints.touchDevice)
}
