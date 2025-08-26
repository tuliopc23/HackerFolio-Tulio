import { describe, test, expect } from 'vitest'

import { useTheme } from '@/components/terminal/theme-context'
import { render, screen } from '@/test-utils/render-with-providers'

// Simple test component
function TestComponent() {
  const { theme } = useTheme()

  return (
    <div data-testid='test-component' className='bg-lumon-bg text-magenta-bright'>
      Current theme: {theme}
    </div>
  )
}

describe('CSS and Build Integration', () => {
  test('CSS variables are accessible', () => {
    const computedStyle = window.getComputedStyle(document.documentElement)

    // Test CSS custom properties are loaded
    expect(computedStyle.getPropertyValue('--lumon-bg')).toBe('hsl(0, 0%, 3%)')
    expect(computedStyle.getPropertyValue('--magenta-bright')).toBe('hsl(300, 100%, 60%)')
  })

  test('Theme context works correctly', () => {
    render(<TestComponent />)

    expect(screen.getByTestId('test-component')).toHaveTextContent('Current theme: lumon')
  })

  test('Tailwind classes are applied', () => {
    render(<TestComponent />)

    const testElement = screen.getByTestId('test-component')
    expect(testElement).toHaveClass('bg-lumon-bg')
    expect(testElement).toHaveClass('text-magenta-bright')
  })
})
