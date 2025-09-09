import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type RefObject,
} from 'react'

interface FocusManagerContextType {
  registerFocusable: (id: string, element: HTMLElement) => void
  unregisterFocusable: (id: string) => void
  focusElement: (id: string) => boolean
  focusNext: () => boolean
  focusPrevious: () => boolean
  restoreFocus: () => void
  trapFocus: boolean
  setTrapFocus: (trap: boolean) => void
}

const FocusManagerContext = createContext<FocusManagerContextType | undefined>(undefined)

interface FocusManagerProps {
  children: ReactNode
  initialTrapFocus?: boolean
  onEscape?: () => void
}

/**
 * Focus manager that handles focus trapping, navigation, and restoration
 * specifically designed for terminal interfaces
 */
export function FocusManager({ children, initialTrapFocus = false, onEscape }: FocusManagerProps) {
  const focusableElements = useRef<Map<string, HTMLElement>>(new Map())
  const focusHistory = useRef<string[]>([])
  const currentFocusIndex = useRef<number>(-1)
  const trapFocus = useRef<boolean>(initialTrapFocus)
  const previousFocus = useRef<HTMLElement | null>(null)

  const registerFocusable = useCallback((id: string, element: HTMLElement) => {
    focusableElements.current.set(id, element)
  }, [])

  const unregisterFocusable = useCallback((id: string) => {
    focusableElements.current.delete(id)
    const historyIndex = focusHistory.current.indexOf(id)
    if (historyIndex > -1) {
      focusHistory.current.splice(historyIndex, 1)
      if (currentFocusIndex.current >= historyIndex) {
        currentFocusIndex.current = Math.max(0, currentFocusIndex.current - 1)
      }
    }
  }, [])

  const focusElement = useCallback((id: string): boolean => {
    const element = focusableElements.current.get(id)
    if (element) {
      element.focus()

      // Update focus history
      const existingIndex = focusHistory.current.indexOf(id)
      if (existingIndex > -1) {
        focusHistory.current.splice(existingIndex, 1)
      }
      focusHistory.current.push(id)
      currentFocusIndex.current = focusHistory.current.length - 1

      return true
    }
    return false
  }, [])

  const getOrderedElements = useCallback((): HTMLElement[] => {
    return Array.from(focusableElements.current.values())
      .filter(el => {
        return (
          el.offsetParent !== null &&
          getComputedStyle(el).visibility !== 'hidden' &&
          !el.hasAttribute('disabled') &&
          !el.hasAttribute('inert')
        )
      })
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect()
        const bRect = b.getBoundingClientRect()

        // Sort by top position first, then left position
        if (Math.abs(aRect.top - bRect.top) > 10) {
          return aRect.top - bRect.top
        }
        return aRect.left - bRect.left
      })
  }, [])

  const focusNext = useCallback((): boolean => {
    const orderedElements = getOrderedElements()
    if (orderedElements.length === 0) return false

    const currentElement = document.activeElement as HTMLElement
    const currentIndex = orderedElements.indexOf(currentElement)

    let nextIndex: number
    if (currentIndex === -1) {
      nextIndex = 0
    } else {
      nextIndex = (currentIndex + 1) % orderedElements.length
    }

    const nextElement = orderedElements[nextIndex]
    if (nextElement) {
      nextElement.focus()
      return true
    }
    return false
  }, [getOrderedElements])

  const focusPrevious = useCallback((): boolean => {
    const orderedElements = getOrderedElements()
    if (orderedElements.length === 0) return false

    const currentElement = document.activeElement as HTMLElement
    const currentIndex = orderedElements.indexOf(currentElement)

    let prevIndex: number
    if (currentIndex === -1) {
      prevIndex = orderedElements.length - 1
    } else {
      prevIndex = currentIndex === 0 ? orderedElements.length - 1 : currentIndex - 1
    }

    const prevElement = orderedElements[prevIndex]
    if (prevElement) {
      prevElement.focus()
      return true
    }
    return false
  }, [getOrderedElements])

  const restoreFocus = useCallback(() => {
    if (previousFocus.current) {
      previousFocus.current.focus()
      previousFocus.current = null
    }
  }, [])

  const setTrapFocus = useCallback((trap: boolean) => {
    trapFocus.current = trap
    if (trap && !previousFocus.current) {
      previousFocus.current = document.activeElement as HTMLElement
    }
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break

        case 'Tab':
          if (trapFocus.current) {
            event.preventDefault()
            if (event.shiftKey) {
              focusPrevious()
            } else {
              focusNext()
            }
          }
          break

        case 'F6':
          // Common accessibility shortcut for moving between major sections
          event.preventDefault()
          if (event.shiftKey) {
            focusPrevious()
          } else {
            focusNext()
          }
          break
      }
    },
    [onEscape, focusNext, focusPrevious]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const contextValue: FocusManagerContextType = {
    registerFocusable,
    unregisterFocusable,
    focusElement,
    focusNext,
    focusPrevious,
    restoreFocus,
    trapFocus: trapFocus.current,
    setTrapFocus,
  }

  return (
    <FocusManagerContext.Provider value={contextValue}>{children}</FocusManagerContext.Provider>
  )
}

export function useFocusManager() {
  const context = useContext(FocusManagerContext)
  if (context === undefined) {
    throw new Error('useFocusManager must be used within a FocusManager')
  }
  return context
}

/**
 * Hook to register an element as focusable within the focus manager
 */
export function useFocusRegistration(id: string, elementRef: RefObject<HTMLElement>) {
  const { registerFocusable, unregisterFocusable } = useFocusManager()

  useEffect(() => {
    registerFocusable(id, elementRef.current)
    return () => {
      unregisterFocusable(id)
    }
  }, [id, elementRef, registerFocusable, unregisterFocusable])
}

export default FocusManager
