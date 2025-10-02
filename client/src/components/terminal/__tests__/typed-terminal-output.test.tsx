import { render, screen } from '@/test-utils/render-with-providers'

import { TypedTerminalOutput } from '../typed-terminal-output'

describe('TypedTerminalOutput icon tokens', () => {
  it('renders lucide icon tokens with accessible labels', () => {
    render(
      <TypedTerminalOutput output='[[icon:lucide/ghost|Terminal avatar]] ready' animate={false} />
    )

    expect(screen.getByText('ready')).toBeInTheDocument()
    expect(screen.getByText('Terminal avatar')).toBeInTheDocument()
    expect(screen.queryByText('[[icon:lucide/ghost|Terminal avatar]]')).not.toBeInTheDocument()
  })

  it('falls back to text when icon key is unknown', () => {
    render(
      <TypedTerminalOutput output='Status: [[icon:lucide/unknown|Mystery state]]' animate={false} />
    )

    expect(screen.getByText('Status: [icon] Mystery state')).toBeInTheDocument()
  })
})
