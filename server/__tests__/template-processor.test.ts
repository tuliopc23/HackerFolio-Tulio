import { createTemplateProcessor } from '../utils/template-processor'
import { findIconTokens, parseIconToken } from '../utils/icon-registry'

describe('TemplateProcessor icon tokens', () => {
  it('preserves icon tokens during template processing', () => {
    const processor = createTemplateProcessor([])
    const template = 'Status: [[icon:lucide/ghost|Terminal avatar]] ready'

    const result = processor.processTemplate(template)

    expect(result).toContain('[[icon:lucide/ghost|Terminal avatar]]')
  })

  it('parses icon tokens and recognises unknown keys', () => {
    const known = parseIconToken('[[icon:lucide/bolt|Energy]]')
    const unknown = parseIconToken('[[icon:lucide/unknown|Mystery]]')

    expect(known?.iconKey).toBe('lucide/bolt')
    expect(unknown?.iconKey).toBeUndefined()

    const matches = findIconTokens(
      'Check [[icon:lucide/bolt|Energy]] and [[icon:lucide/missing|Fallback]].'
    )
    expect(matches).toHaveLength(2)
    expect(matches[1]?.iconKey).toBeUndefined()
    expect(matches[1]?.label).toBe('Fallback')
  })
})
