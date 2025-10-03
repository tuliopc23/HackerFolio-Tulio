export type IconSource = 'lucide' | 'simple'

export type IconKey = `${IconSource}/${string}`

export interface IconMeta {
  source: IconSource
  name: string
  defaultLabel?: string
}

const iconRegistry: Record<IconKey, IconMeta> = {
  'lucide/ghost': { source: 'lucide', name: 'Ghost', defaultLabel: 'Terminal avatar' },
  'lucide/bolt': { source: 'lucide', name: 'Bolt', defaultLabel: 'Lightning' },
  'lucide/github': { source: 'lucide', name: 'Github', defaultLabel: 'GitHub' },
  'lucide/mail': { source: 'lucide', name: 'Mail', defaultLabel: 'Email' },
  'lucide/linkedin': { source: 'lucide', name: 'Linkedin', defaultLabel: 'LinkedIn' },
  'lucide/calendar-clock': { source: 'lucide', name: 'CalendarClock', defaultLabel: 'Calendar' },
  'lucide/git-branch': { source: 'lucide', name: 'GitBranch', defaultLabel: 'Git branch' },
  'lucide/lightbulb': { source: 'lucide', name: 'Lightbulb', defaultLabel: 'Tip' },
  'lucide/apple': { source: 'lucide', name: 'Apple', defaultLabel: 'Apple' },
  'lucide/terminal': { source: 'lucide', name: 'Terminal', defaultLabel: 'Terminal' },
  'lucide/palette': { source: 'lucide', name: 'Palette', defaultLabel: 'Design' },
  'lucide/dot': { source: 'lucide', name: 'Dot', defaultLabel: 'Item' },
  'lucide/list': { source: 'lucide', name: 'List', defaultLabel: 'List' },
  'lucide/terminal-square': { source: 'lucide', name: 'TerminalSquare', defaultLabel: 'CLI tools' },
  'lucide/wrench': { source: 'lucide', name: 'Wrench', defaultLabel: 'Dev tools' },
  'lucide/sparkles': { source: 'lucide', name: 'Sparkles', defaultLabel: 'Highlights' },
  'lucide/clipboard-copy': { source: 'lucide', name: 'ClipboardCopy', defaultLabel: 'Copy' },
  'lucide/arrow-up-down': {
    source: 'lucide',
    name: 'ArrowUpDown',
    defaultLabel: 'History navigation',
  },
  'lucide/keyboard': { source: 'lucide', name: 'Keyboard', defaultLabel: 'Keyboard shortcut' },
  'lucide/tree-palm': { source: 'lucide', name: 'Palmtree', defaultLabel: 'TanStack' },
  'lucide/palm-tree': { source: 'lucide', name: 'Palmtree', defaultLabel: 'TanStack' },
  'lucide/user-round': { source: 'lucide', name: 'UserRound', defaultLabel: 'About me' },
  'lucide/hammer': { source: 'lucide', name: 'Hammer', defaultLabel: 'Status' },
  'lucide/route': { source: 'lucide', name: 'Route', defaultLabel: 'Route' },
  'lucide/link': { source: 'lucide', name: 'Link', defaultLabel: 'Link' },
  'lucide/briefcase': { source: 'lucide', name: 'Briefcase', defaultLabel: 'My work' },
  'simple/react': { source: 'simple', name: 'react', defaultLabel: 'React logo' },
  'simple/bun': { source: 'simple', name: 'bun', defaultLabel: 'Bun logo' },
  'simple/vite': { source: 'simple', name: 'vite', defaultLabel: 'Vite logo' },
  'simple/tailwindcss': {
    source: 'simple',
    name: 'tailwindcss',
    defaultLabel: 'Tailwind CSS logo',
  },
  'simple/swift': { source: 'simple', name: 'swift', defaultLabel: 'Swift logo' },
  'simple/svelte': { source: 'simple', name: 'svelte', defaultLabel: 'Svelte logo' },
  'simple/drizzle': { source: 'simple', name: 'drizzle', defaultLabel: 'Drizzle ORM logo' },
  'simple/reactrouter': {
    source: 'simple',
    name: 'reactrouter',
    defaultLabel: 'React Router logo',
  },
  'simple/typescript': { source: 'simple', name: 'typescript', defaultLabel: 'TypeScript logo' },
  'simple/terraform': { source: 'simple', name: 'terraform', defaultLabel: 'Terraform logo' },
  'simple/podman': { source: 'simple', name: 'podman', defaultLabel: 'Podman logo' },
  'simple/nodedotjs': { source: 'simple', name: 'nodedotjs', defaultLabel: 'Node.js logo' },
  'simple/deno': { source: 'simple', name: 'deno', defaultLabel: 'Deno logo' },
  'simple/sveltekit': { source: 'simple', name: 'svelte', defaultLabel: 'Svelte logo' },
  'simple/solid': { source: 'simple', name: 'solid', defaultLabel: 'Solid logo' },
  'simple/vuedotjs': { source: 'simple', name: 'vuedotjs', defaultLabel: 'Vue.js logo' },
  'simple/nuxt': { source: 'simple', name: 'nuxt', defaultLabel: 'Nuxt logo' },
  'simple/nextdotjs': { source: 'simple', name: 'nextdotjs', defaultLabel: 'Next.js logo' },
  'simple/remix': { source: 'simple', name: 'remix', defaultLabel: 'Remix logo' },
  'simple/fastify': { source: 'simple', name: 'fastify', defaultLabel: 'Fastify logo' },
  'simple/actix': { source: 'simple', name: 'actix', defaultLabel: 'Actix logo' },
  'simple/vapor': { source: 'simple', name: 'vapor', defaultLabel: 'Vapor logo' },
  'simple/hono': { source: 'simple', name: 'hono', defaultLabel: 'Hono logo' },
  'simple/gin': { source: 'simple', name: 'gin', defaultLabel: 'Gin logo' },
  'simple/python': { source: 'simple', name: 'python', defaultLabel: 'Python logo' },
  'simple/zig': { source: 'simple', name: 'zig', defaultLabel: 'Zig logo' },
  'simple/rust': { source: 'simple', name: 'rust', defaultLabel: 'Rust logo' },
  'simple/go': { source: 'simple', name: 'go', defaultLabel: 'Go logo' },
  'simple/github': { source: 'simple', name: 'github', defaultLabel: 'GitHub' },
  'simple/docker': { source: 'simple', name: 'docker', defaultLabel: 'Docker logo' },
  'simple/appstore': { source: 'simple', name: 'appstore', defaultLabel: 'App Store' },
  'simple/uikit': { source: 'simple', name: 'uikit', defaultLabel: 'UIKit' },
}

export function getIconMeta(key: IconKey): IconMeta | undefined {
  return iconRegistry[key]
}

export function isIconKey(input: string): input is IconKey {
  return input in iconRegistry
}

export function listIconKeys(): IconKey[] {
  return Object.keys(iconRegistry) as IconKey[]
}
