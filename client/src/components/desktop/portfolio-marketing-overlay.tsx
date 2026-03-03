import { Link } from '@tanstack/react-router'
import { ArrowUpRight, CirclePlay, Layers3, Sparkles, Zap } from 'lucide-react'

interface PortfolioMarketingOverlayProps {
  onOpenTerminal?: (() => void) | undefined
}

export default function PortfolioMarketingOverlay({
  onOpenTerminal,
}: PortfolioMarketingOverlayProps) {
  return (
    <aside className='pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 md:px-8 md:pt-8'>
      <div className='mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[1.15fr_0.85fr]'>
        <section className='pointer-events-auto panel-glow showcase-enter rounded-3xl border border-white/15 bg-black/45 p-6 backdrop-blur-xl md:p-8'>
          <p className='font-display text-sm uppercase tracking-[0.28em] text-[#7dd3fc]'>
            Tulio Cunha Portfolio
          </p>
          <h1 className='font-display mt-4 text-4xl leading-[0.95] text-white md:text-6xl'>
            Terminal-native interfaces engineered to feel impossible to ignore.
          </h1>
          <p className='font-ui mt-4 max-w-2xl text-sm text-slate-200 md:text-base'>
            A live visual lab for frontend craft: typography precision, interaction systems, and
            production-grade implementation under one terminal-driven experience.
          </p>

          <div className='mt-6 flex flex-wrap items-center gap-3'>
            <Link
              to='/projects'
              className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#7dd3fc]/40 bg-[#7dd3fc]/15 px-5 py-2 font-ui text-sm font-semibold text-[#dff6ff] transition-colors duration-200 hover:bg-[#7dd3fc]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dd3fc]'
            >
              Explore Projects
              <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
            </Link>
            <button
              type='button'
              onClick={onOpenTerminal}
              className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-5 py-2 font-ui text-sm font-semibold text-fuchsia-100 transition-colors duration-200 hover:bg-fuchsia-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300'
            >
              Open Terminal Experience
              <CirclePlay className='h-4 w-4' aria-hidden='true' />
            </button>
          </div>
        </section>

        <section className='pointer-events-auto grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
          <article className='panel-glow showcase-enter showcase-delay-1 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md'>
            <p className='font-display flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#7dd3fc]'>
              <Sparkles className='h-4 w-4' aria-hidden='true' />
              Positioning
            </p>
            <p className='font-ui mt-2 text-sm text-slate-100'>
              Experimental visual direction with product-level finish.
            </p>
          </article>
          <article className='panel-glow showcase-enter showcase-delay-2 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md'>
            <p className='font-display flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#67e8f9]'>
              <Layers3 className='h-4 w-4' aria-hidden='true' />
              Stack
            </p>
            <p className='font-ui mt-2 text-sm text-slate-100'>
              React, Bun, and systems-minded engineering discipline.
            </p>
          </article>
          <article className='panel-glow showcase-enter showcase-delay-3 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md'>
            <p className='font-display flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c4b5fd]'>
              <Zap className='h-4 w-4' aria-hidden='true' />
              Delivery
            </p>
            <p className='font-ui mt-2 text-sm text-slate-100'>
              High-complexity visuals delivered with maintainable code.
            </p>
          </article>
        </section>
      </div>
    </aside>
  )
}
