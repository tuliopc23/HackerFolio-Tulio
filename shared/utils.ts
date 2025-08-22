// Utility functions for stable React keys and other helpers

/**
 * Generate a stable key for React components
 * Prefers item.id, falls back to content hash, then index as last resort
 */
export function getStableKey(item: unknown, index: number): string {
  // Try to use id field if available
  if (typeof item === 'object' && item && 'id' in item) {
    const { id } = item as Record<string, unknown>
    if (typeof id === 'string' || typeof id === 'number') {
      return String(id)
    }
  }

  // Try to use name/title field if available
  if (typeof item === 'object' && item) {
    const record = item as Record<string, unknown>
    const name = record.name ?? record.title
    if (typeof name === 'string') {
      return `${name}-${String(index)}`
    }
  }

  // For strings, use the string itself with index
  if (typeof item === 'string') {
    return `${item}-${String(index)}`
  }

  // Last resort: use index (but this is still better than raw index)
  return `item-${String(index)}`
}

/**
 * Safe string conversion for template literals
 */
export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'bigint') return String(value)
  if (value == null) return fallback
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return '[object Object]'
    }
  }
  if (typeof value === 'function') return '[Function]'
  if (typeof value === 'symbol') return value.toString()
  // This should never be reached, but just in case
  return fallback
}

/**
 * Generate hash from object for stable keys
 */
export function simpleHash(obj: unknown): string {
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
