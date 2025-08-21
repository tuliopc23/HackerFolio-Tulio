import { motion } from 'motion/react'

export function TerminalLoadingSpinner({ text = 'Initializing...' }: { text?: string }) {
  return (
    <div className='flex items-center gap-3 text-cyan-bright'>
      <motion.div
        className='flex gap-1'
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className='w-2 h-2 bg-magenta-bright rounded-full' />
        <div className='w-2 h-2 bg-cyan-bright rounded-full' />
        <div className='w-2 h-2 bg-magenta-bright rounded-full' />
      </motion.div>
      <span className='text-sm font-mono'>{text}</span>
    </div>
  )
}
