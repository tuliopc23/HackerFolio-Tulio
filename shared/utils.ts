// Utility functions for stable React keys and other helpers

/**
 * Generate a stable key for React components
 * Prefers item.id, falls back to content hash, then index as last resort
 */
export function getStableKey<T>(item: T, index: number): string {
  // Try to use id field if available
  if (typeof item === 'object' && item && 'id' in item) {
    const { id } = item as any
    if (typeof id === 'string' || typeof id === 'number') {
      return String(id)
    }
  }

  // Try to use name/title field if available
  if (typeof item === 'object' && item) {
    const name = (item as any).name || (item as any).title
    if (typeof name === 'string') {
      return `${name}-${index}`
    }
  }

  // For strings, use the string itself with index
  if (typeof item === 'string') {
    return `${item}-${index}`
  }

  // Last resort: use index (but this is still better than raw index)
  return `item-${index}`
}

/**
 * Safe string conversion for template literals
 */
export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value == null) return fallback
  return String(value)
}

/**
 * Generate hash from object for stable keys
 */
export function simpleHash(obj: unknown): string {
  const str = JSON.stringify(obj)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
