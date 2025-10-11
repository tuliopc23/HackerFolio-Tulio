import clsx from 'clsx'
import {
  Apple,
  ArrowUpDown,
  Bolt,
  Briefcase,
  CalendarClock,
  ClipboardCopy,
  Dot,
  Ghost,
  GitBranch,
  Hammer,
  Keyboard,
  Lightbulb,
  Link,
  List,
  Mail,
  Palette,
  Route,
  Sparkles,
  Terminal,
  TerminalSquare,
  TreePalm,
  UserRound,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  siReact,
  siBun,
  siVite,
  siTailwindcss,
  siSwift,
  siSvelte,
  siDrizzle,
  siReactrouter,
  siTypescript,
  siGo,
  siRust,
  siZig,
  siPython,
  siGin,
  siHono,
  siVapor,
  siActix,
  siFastify,
  siRemix,
  siNextdotjs,
  siNuxt,
  siVuedotjs,
  siSolid,
  siDeno,
  siNodedotjs,
  siPodman,
  siTerraform,
  siGithub,
  siDocker,
  siAppstore,
  siUikit,
  type SimpleIcon,
} from 'simple-icons'

import { getIconMeta, type IconKey, isIconKey } from 'shared/iconography/registry'

const BASE_ICON_CLASS = 'h-[1em] w-[1em] align-middle'
const BASE_SIMPLE_ICON_CLASS = clsx(BASE_ICON_CLASS, 'fill-current')

const createSimpleIconRenderer = (icon: SimpleIcon) => {
  const renderer = (className?: string) => (
    <svg
      viewBox='0 0 24 24'
      className={clsx(BASE_SIMPLE_ICON_CLASS, className)}
      aria-hidden='true'
      focusable='false'
    >
      <path d={icon.path} />
    </svg>
  )

  renderer.displayName = `${icon.title}SimpleIcon`

  return renderer
}

const iconRenderers: Partial<Record<IconKey, (className?: string) => ReactNode>> = {
  'lucide/ghost': className => (
    <Ghost className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/bolt': className => (
    <Bolt className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/mail': className => (
    <Mail className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/linkedin': className => (
    <Briefcase className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/calendar-clock': className => (
    <CalendarClock
      className={clsx(BASE_ICON_CLASS, className)}
      aria-hidden='true'
      focusable='false'
    />
  ),
  'lucide/git-branch': className => (
    <GitBranch className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/lightbulb': className => (
    <Lightbulb className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/terminal': className => (
    <Terminal className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/apple': className => (
    <Apple className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/route': className => (
    <Route className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/list': className => (
    <List className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/dot': className => (
    <Dot className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/palette': className => (
    <Palette className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/terminal-square': className => (
    <TerminalSquare
      className={clsx(BASE_ICON_CLASS, className)}
      aria-hidden='true'
      focusable='false'
    />
  ),
  'lucide/wrench': className => (
    <Wrench className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/sparkles': className => (
    <Sparkles className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/clipboard-copy': className => (
    <ClipboardCopy
      className={clsx(BASE_ICON_CLASS, className)}
      aria-hidden='true'
      focusable='false'
    />
  ),
  'lucide/arrow-up-down': className => (
    <ArrowUpDown
      className={clsx(BASE_ICON_CLASS, className)}
      aria-hidden='true'
      focusable='false'
    />
  ),
  'lucide/keyboard': className => (
    <Keyboard className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/tree-palm': className => (
    <TreePalm className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/user-round': className => (
    <UserRound className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/hammer': className => (
    <Hammer className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/link': className => (
    <Link className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'lucide/briefcase': className => (
    <Briefcase className={clsx(BASE_ICON_CLASS, className)} aria-hidden='true' focusable='false' />
  ),
  'simple/react': createSimpleIconRenderer(siReact),
  'simple/bun': createSimpleIconRenderer(siBun),
  'simple/vite': createSimpleIconRenderer(siVite),
  'simple/tailwindcss': createSimpleIconRenderer(siTailwindcss),
  'simple/swift': createSimpleIconRenderer(siSwift),
  'simple/svelte': createSimpleIconRenderer(siSvelte),
  'simple/typescript': createSimpleIconRenderer(siTypescript),
  'simple/drizzle': createSimpleIconRenderer(siDrizzle),
  'simple/reactrouter': createSimpleIconRenderer(siReactrouter),
  'simple/go': createSimpleIconRenderer(siGo),
  'simple/rust': createSimpleIconRenderer(siRust),
  'simple/zig': createSimpleIconRenderer(siZig),
  'simple/python': createSimpleIconRenderer(siPython),
  'simple/gin': createSimpleIconRenderer(siGin),
  'simple/hono': createSimpleIconRenderer(siHono),
  'simple/vapor': createSimpleIconRenderer(siVapor),
  'simple/actix': createSimpleIconRenderer(siActix),
  'simple/fastify': createSimpleIconRenderer(siFastify),
  'simple/remix': createSimpleIconRenderer(siRemix),
  'simple/nextdotjs': createSimpleIconRenderer(siNextdotjs),
  'simple/nuxt': createSimpleIconRenderer(siNuxt),
  'simple/vuedotjs': createSimpleIconRenderer(siVuedotjs),
  'simple/solid': createSimpleIconRenderer(siSolid),
  'simple/deno': createSimpleIconRenderer(siDeno),
  'simple/nodedotjs': createSimpleIconRenderer(siNodedotjs),
  'simple/podman': createSimpleIconRenderer(siPodman),
  'simple/terraform': createSimpleIconRenderer(siTerraform),
  'simple/github': createSimpleIconRenderer(siGithub),
  'simple/docker': createSimpleIconRenderer(siDocker),
  'simple/appstore': createSimpleIconRenderer(siAppstore),
  'simple/uikit': createSimpleIconRenderer(siUikit),
}

iconRenderers['lucide/github'] = iconRenderers['simple/github']
iconRenderers['lucide/palm-tree'] = iconRenderers['lucide/tree-palm']

export interface RenderIconOptions {
  className?: string
  label?: string
}

const resolveFallbackLabel = (iconKey: IconKey): string => {
  const registryLabel = getIconMeta(iconKey)?.defaultLabel
  if (registryLabel) return registryLabel
  const [, derivedLabel] = iconKey.split('/')
  return (derivedLabel ?? iconKey).trim()
}

export function renderIcon(iconKey: IconKey, options: RenderIconOptions = {}): ReactNode {
  const fallbackLabel = resolveFallbackLabel(iconKey)
  const label = (options.label ?? fallbackLabel).trim()

  const renderer = iconRenderers[iconKey]
  if (!renderer) {
    return `[icon] ${label}`
  }

  const iconElement = renderer(options.className)

  return (
    <span className='inline-flex items-center align-middle icon-token'>
      {iconElement}
      <span className='sr-only'>{label}</span>
    </span>
  )
}

export function tryRenderIcon(
  rawKey: string,
  options: RenderIconOptions = {}
): ReactNode | undefined {
  if (!isIconKey(rawKey)) return undefined
  return renderIcon(rawKey, options)
}
