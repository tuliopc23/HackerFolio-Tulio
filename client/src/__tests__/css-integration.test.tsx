import { describe, test, expect } from 'vitest'

import { useTheme } from '@/components/terminal/theme-context'
import { render, screen } from '@/test-utils/render-with-providers'

// Simple test component
function TestComponent() {
  const { theme } = useTheme()

  return (
    <div data-testid='test-component' className='bg-[#0a0a0a] text-magenta-bright'>
      Current theme: {theme}
    </div>
  )
}

describe('CSS and Build Integration', () => {
  test('Theme context works correctly', () => {
    render(<TestComponent />)

    expect(screen.getByTestId('test-component')).toHaveTextContent('Current theme: oxocarbon')
  })

  test('Tailwind classes are applied', () => {
    render(<TestComponent />)

    const testElement = screen.getByTestId('test-component')
    expect(testElement).toHaveClass('bg-[#0a0a0a]')
    expect(testElement).toHaveClass('text-magenta-bright')
  })
})
