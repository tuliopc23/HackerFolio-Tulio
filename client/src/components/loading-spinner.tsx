import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-magenta-soft border-t-cyan-bright rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p 
          className="text-text-soft text-sm mt-3 font-mono"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function TerminalLoadingSpinner({ text = 'Initializing...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 text-cyan-bright">
      <motion.div
        className="flex gap-1"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-2 h-2 bg-magenta-bright rounded-full"></div>
        <div className="w-2 h-2 bg-cyan-bright rounded-full"></div>
        <div className="w-2 h-2 bg-magenta-bright rounded-full"></div>
      </motion.div>
      <span className="text-sm font-mono">{text}</span>
    </div>
  );
}

export default LoadingSpinner;