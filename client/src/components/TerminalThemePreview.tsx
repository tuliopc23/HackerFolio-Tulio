import React from 'react'

interface ColorRowProps {
  idx: number
  name: string
}

const ColorRow: React.FC<ColorRowProps> = ({ idx, name }) => (
  <div className="flex items-center gap-4 p-2">
    <span className={`ansi-fg-${name} text-sm font-mono min-w-[120px]`}>
      {name} (#{idx})
    </span>
    <span className={`ansi-fg-bright-${name} text-sm font-mono min-w-[140px]`}>
      bright {name} (#{idx + 8})
    </span>
    <span className={`ansi-bg-${name} text-white px-2 py-1 rounded text-sm`}>bg {name}</span>
    <span className={`ansi-bg-bright-${name} text-black px-2 py-1 rounded text-sm`}>
      bg bright {name}
    </span>
  </div>
)

export default function TerminalThemePreview() {
  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

  return (
    <div
      className="terminal min-h-screen p-6 font-mono"
      style={{ background: 'var(--term-bg)', color: 'var(--term-fg)' }}
    >
      <h1 className="text-2xl mb-6 phosphor-glow">ANSI Theme Preview - Ghostty Inspired</h1>
      
      <div className="mb-8">
        <h2 className="text-lg mb-4 text-cyan-bright">Color Palette</h2>
        <div className="space-y-1 bg-black/50 p-4 rounded border border-[color:var(--ansi-8)]">
          {names.map((n, i) => (
            <ColorRow key={n} idx={i} name={n} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg mb-4 text-cyan-bright">Selection & Cursor Test</h2>
        <div className="bg-black/50 p-4 rounded border border-[color:var(--ansi-8)]">
          <p className="mb-3">Select this text to verify selection colors.</p>
          <input
            className="px-3 py-2 bg-transparent border border-[color:var(--ansi-8)] rounded w-full max-w-md focus:border-[color:var(--ansi-6)] outline-none"
            placeholder="Type to see caret/cursor color"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg mb-4 text-cyan-bright">ANSI Color Demo</h2>
        <div className="bg-black/50 p-4 rounded border border-[color:var(--ansi-8)] space-y-2">
          <div className="flex gap-3 flex-wrap">
            <span className="ansi-fg-red">red (light blue)</span>
            <span className="ansi-fg-green">green (pink)</span>
            <span className="ansi-fg-yellow">yellow (green)</span>
            <span className="ansi-fg-blue">blue (teal)</span>
            <span className="ansi-fg-magenta">magenta</span>
            <span className="ansi-fg-cyan">cyan</span>
            <span className="ansi-fg-white">white</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="ansi-fg-bright-red">bright red</span>
            <span className="ansi-fg-bright-green">bright green</span>
            <span className="ansi-fg-bright-yellow">bright yellow</span>
            <span className="ansi-fg-bright-blue">bright blue</span>
            <span className="ansi-fg-bright-magenta">bright magenta</span>
            <span className="ansi-fg-bright-cyan">bright cyan</span>
            <span className="ansi-fg-bright-white">bright white</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg mb-4 text-cyan-bright">Terminal Effects</h2>
        <div className="bg-black/50 p-4 rounded border border-[color:var(--ansi-8)]">
          <p className="phosphor-glow mb-2">Phosphor glow effect</p>
          <p className="terminal-output mb-2">Terminal output shadow</p>
          <div className="cursor-block inline-block"></div>
          <span className="ml-2">Blinking cursor</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg mb-4 text-cyan-bright">Focus States</h2>
        <div className="space-y-3">
          <button className="px-4 py-2 border border-[color:var(--ansi-8)] rounded hover:bg-[color:var(--ansi-8)] focus:outline-none focus-visible">
            Focus me (Tab)
          </button>
          <a href="#" className="text-cyan-bright underline ml-4">
            Link focus test
          </a>
        </div>
      </div>
    </div>
  )
}
