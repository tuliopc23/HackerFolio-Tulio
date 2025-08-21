import { useState, useEffect } from 'react';
import LetterGlitchBackground from '@/components/ui/letter-glitch-bg';

export default function DesktopBackground() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: Date) => {
    try {
      return time.toLocaleTimeString('en-US', { 
        hour12: false,
        timeZone: 'America/Sao_Paulo'
      });
    } catch (error) {
      console.warn('Failed to format time:', error);
      return time.toTimeString().slice(0, 8); // Fallback to basic time format
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* LetterGlitch Animated Background */}
      <div className="absolute inset-0">
        <LetterGlitchBackground 
          glitchSpeed={100}
          smooth={true}
          outerVignette={true}
          centerVignette={false}
        />
      </div>

      {/* Desktop Icons Area */}
      <div className="absolute top-8 left-8 space-y-4">
        {/* Desktop Icons can be added here */}
        <div className="flex flex-col items-center gap-1 p-2 rounded hover:bg-magenta-soft hover:bg-opacity-10 transition-colors cursor-pointer group">
          <div className="w-12 h-12 border-2 border-magenta-soft rounded bg-lumon-bg bg-opacity-50 flex items-center justify-center">
            <span className="text-magenta-bright font-mono text-xs">SYS</span>
          </div>
          <span className="text-text-soft text-xs group-hover:text-magenta-bright transition-colors">System</span>
        </div>
      </div>

      {/* Desktop Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-lumon-bg bg-opacity-80 border-t border-magenta-soft backdrop-blur-sm">
        <div className="px-6 py-2 flex items-center justify-between">
          {/* Left side - System status */}
          <div className="flex items-center gap-4 text-xs text-text-soft">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              <span>System Online</span>
            </div>
            <div>CPU: 23% • RAM: 4.2GB • Network: Active</div>
          </div>

          {/* Right side - Clock */}
          <div className="flex items-center gap-4 text-xs">
            <div className="text-magenta-bright font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-text-soft">
              {currentTime.toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}