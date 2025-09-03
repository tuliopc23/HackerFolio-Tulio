export function TerminalLoadingSpinner({ text = 'Initializing...' }: { text?: string }) {
  return (
    <div className='flex items-center gap-3 text-cyan-bright'>
      {/* OPTIMIZATION: Replace motion with CSS animation */}
      <div className='flex gap-1 animate-pulse'>
        <div className='w-2 h-2 bg-magenta-bright rounded-full' />
        <div className='w-2 h-2 bg-cyan-bright rounded-full' />
        <div className='w-2 h-2 bg-magenta-bright rounded-full' />
      </div>
      <span className='text-sm font-mono'>{text}</span>
    </div>
  )
}
