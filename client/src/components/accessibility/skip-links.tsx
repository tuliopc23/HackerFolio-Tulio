import React from 'react'
import { useSkipLinks } from '@/hooks/use-accessibility'

/**
 * Skip links component for keyboard navigation accessibility.
 * Provides quick navigation options for screen reader and keyboard users.
 */
export function SkipLinks() {
  const { skipToMain, skipToNavigation } = useSkipLinks()

  return (
    <div className="skip-links">
      <a
        href="#main-terminal"
        onClick={(e) => {
          e.preventDefault()
          skipToMain()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            skipToMain()
          }
        }}
        className="skip-link"
      >
        Skip to main terminal
      </a>
      <a
        href="#navigation"
        onClick={(e) => {
          e.preventDefault()
          skipToNavigation()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            skipToNavigation()
          }
        }}
        className="skip-link"
      >
        Skip to navigation
      </a>
      
      <style jsx>{`
        .skip-links {
          position: absolute;
          top: -100px;
          left: 0;
          z-index: 1000;
        }
        
        .skip-link {
          position: absolute;
          top: -100px;
          left: 6px;
          padding: 8px 16px;
          background: hsl(300, 100%, 60%);
          color: hsl(0, 0%, 0%);
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transform: translateY(-100%);
          transition: transform 0.2s ease-in-out;
          border: 2px solid hsl(180, 100%, 50%);
        }
        
        .skip-link:focus {
          transform: translateY(100px);
          outline: none;
        }
        
        .skip-link:hover {
          background: hsl(300, 80%, 70%);
        }
        
        .skip-link + .skip-link {
          left: 200px;
        }
      `}</style>
    </div>
  )
}

export default SkipLinks