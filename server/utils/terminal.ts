// ANSI color helpers for terminal output
export const ansi = {
  wrap: (s: string, ...codes: number[]) => `\x1b[${codes.join(';')}m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[39m`,
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
  underline: (s: string) => `\x1b[4m${s}\x1b[24m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
}

// Safe JSON parsing helper
export function parseStringArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) && parsed.every(x => typeof x === 'string') ? parsed : []
  } catch {
    return []
  }
}

// Minimal request logging for /api routes
export const logApi = (
  method: string,
  path: string,
  status: number,
  durationMs: number,
  body?: unknown
) => {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  let line = `${time} [elysia] ${method} ${path} ${status} in ${String(durationMs)}ms`
  if (body) {
    const json = JSON.stringify(body)
    if (json.length <= 80) line += ` :: ${json}`
  }
  // Using structured logging would be better in production
  console.log(line)
}