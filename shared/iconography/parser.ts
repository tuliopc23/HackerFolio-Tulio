import { getIconMeta, type IconKey, isIconKey } from './registry'

export interface ParsedIconToken {
  rawKey: string
  iconKey?: IconKey
  label: string
}

export interface IconTokenMatch extends ParsedIconToken {
  match: string
  index: number
}

const TOKEN_REGEX = /\[\[icon:([a-z-]+\/[a-z0-9-]+)\|([^\]]+)\]\]/gi

export function parseIconToken(raw: string): ParsedIconToken | undefined {
  const regex = /^\[\[icon:([a-z-]+\/[a-z0-9-]+)\|([^\]]+)\]\]$/i
  const match = regex.exec(raw.trim())
  if (!match) return undefined
  const rawKey = (match[1] ?? '').toLowerCase()
  const iconKey = isIconKey(rawKey as IconKey) ? (rawKey as IconKey) : undefined
  const providedLabel = match[2]?.trim()
  const fallback = iconKey
    ? (getIconMeta(iconKey)?.defaultLabel ?? iconKey.split('/')[1] ?? iconKey)
    : rawKey
  const label = providedLabel && providedLabel.length > 0 ? providedLabel : fallback

  const token: ParsedIconToken = {
    rawKey,
    label,
    ...(iconKey ? { iconKey } : {}),
  }

  return token
}

export function findIconTokens(text: string): IconTokenMatch[] {
  const matches: IconTokenMatch[] = []
  if (!text) return matches
  let execResult: RegExpExecArray | null
  TOKEN_REGEX.lastIndex = 0
  while ((execResult = TOKEN_REGEX.exec(text)) !== null) {
    const rawKey = (execResult[1] ?? '').toLowerCase()
    const providedLabel = (execResult[2] ?? '').trim()
    const iconKey = isIconKey(rawKey as IconKey) ? (rawKey as IconKey) : undefined
    const fallback = iconKey
      ? (getIconMeta(iconKey)?.defaultLabel ?? iconKey.split('/')[1] ?? iconKey)
      : rawKey
    const label = providedLabel && providedLabel.length > 0 ? providedLabel : fallback
    matches.push({
      match: execResult[0] ?? '',
      index: execResult.index,
      rawKey,
      label,
      ...(iconKey ? { iconKey } : {}),
    })
  }
  return matches
}

export const ICON_TOKEN_REGEX = TOKEN_REGEX
