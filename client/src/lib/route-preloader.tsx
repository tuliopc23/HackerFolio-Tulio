import { type Router } from '@tanstack/react-router'
import React from 'react'

/**
 * Route preloading utility for improved navigation performance
 */
export class RoutePreloader {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private router: Router<any, any>
  private preloadedRoutes = new Set<string>()
  private preloadTimeouts = new Map<string, NodeJS.Timeout>()
  private intersectionObserver?: IntersectionObserver

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(router: Router<any, any>) {
    this.router = router
    this.setupIntersectionObserver()
  }

  /**
   * Setup intersection observer for automatic preloading of visible links
   */
  private setupIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement
            const href = link.getAttribute('href')
            if (href?.startsWith('/')) {
              this.preloadRoute(href, { delay: 100 })
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )
  }

  /**
   * Preload a route with optional delay
   */
  preloadRoute(path: string, options: { delay?: number } = {}) {
    if (this.preloadedRoutes.has(path)) {
      return
    }

    const { delay = 0 } = options

    // Clear any existing timeout for this route
    const existingTimeout = this.preloadTimeouts.get(path)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const preloadFn = () => {
      try {
        void this.router.preloadRoute({ to: path, search: {} })
        this.preloadedRoutes.add(path)
        this.preloadTimeouts.delete(path)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to preload route ${path}:`, error)
      }
    }

    if (delay > 0) {
      const timeout = setTimeout(preloadFn, delay)
      this.preloadTimeouts.set(path, timeout)
    } else {
      preloadFn()
    }
  }

  /**
   * Preload routes on hover/focus
   */
  handleLinkHover = (path: string) => {
    this.preloadRoute(path, { delay: 50 })
  }

  /**
   * Preload routes on mouse down for instant navigation
   */
  handleLinkMouseDown = (path: string) => {
    this.preloadRoute(path)
  }

  /**
   * Observe links for automatic preloading
   */
  observeLinks(container: HTMLElement = document.body) {
    if (!this.intersectionObserver) {
      return
    }

    const links = container.querySelectorAll('a[href^="/"]')
    links.forEach(link => {
      this.intersectionObserver?.observe(link)
    })
  }

  /**
   * Stop observing links
   */
  unobserveLinks(container: HTMLElement = document.body) {
    if (!this.intersectionObserver) {
      return
    }

    const links = container.querySelectorAll('a[href^="/"]')
    links.forEach(link => {
      this.intersectionObserver?.unobserve(link)
    })
  }

  /**
   * Preload critical routes that are likely to be visited
   */
  preloadCriticalRoutes() {
    const criticalRoutes = ['/projects']

    criticalRoutes.forEach(route => {
      this.preloadRoute(route, { delay: 1000 })
    })
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Clear all timeouts
    this.preloadTimeouts.forEach(timeout => {
      clearTimeout(timeout)
    })
    this.preloadTimeouts.clear()

    // Disconnect intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }

    // Clear preloaded routes
    this.preloadedRoutes.clear()
  }
}

/**
 * Hook for using route preloader
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRoutePreloader(router: Router<any, any>) {
  const preloader = new RoutePreloader(router)

  // Preload critical routes on mount
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      preloader.preloadCriticalRoutes()
    }, 2000) // Wait 2 seconds after initial load
  }

  return preloader
}

/**
 * Enhanced Link component with preloading
 */
export interface PreloadLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  preloader?: RoutePreloader
  onMouseEnter?: () => void
  onMouseDown?: () => void
  onClick?: () => void
}

export function PreloadLink({
  to,
  children,
  className,
  preloader,
  onMouseEnter,
  onMouseDown,
  onClick,
  ...props
}: PreloadLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handleMouseEnter = () => {
    preloader?.handleLinkHover(to)
    onMouseEnter?.()
  }

  const handleMouseDown = () => {
    preloader?.handleLinkMouseDown(to)
    onMouseDown?.()
  }

  return (
    <a
      href={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  )
}
