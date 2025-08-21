import { useState, useEffect } from 'react';
import { TypewriterText } from '@/hooks/use-typewriter';

export default function SystemInfoPane() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFastfetch, setShowFastfetch] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia ? 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Trigger fastfetch display after component mounts
    const timeout = setTimeout(() => setShowFastfetch(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  const fastfetchOutput = `tuliopinheirocunha@MacBook-Pro
────────────────────────────────────────
OS: macOS Tahoe 26.0 ARM64
Host: MacBook Pro (14-inch, 2023)
Kernel: Darwin 25.0.0
Uptime: 10 hours, 59 mins
Packages: 228 (brew), 101 (brew-cask)
Shell: fish 4.0.2
Resolution: 3024x1964 @ 120 Hz
DE: Aqua
WM: Quartz Compositor 341.0.1
WM Theme: Multicolor (Light)
Font: .AppleSystemUIFont [System], Helvetica [User]
Cursor: Fill - Black, Outline - White (32px)
Terminal: iTerm2
CPU: Apple M2 Pro (10) @ 3.50 GHz
GPU: Apple M2 Pro (16) @ 1.40 GHz [Integrated]
Memory: 16.57 GiB / 16.00 GiB (66%)
Swap: Disabled
Disk (/): 215.8B GiB / 460.40 GiB (47%) - apfs [Read-only]
Local IP (en0): 192.168.0.3/24`;

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
    <div className="pane-border rounded-lg overflow-hidden flex flex-col h-full" aria-label="System Information">
      {/* Pane Header */}
      <div className="bg-lumon-border px-4 py-2 border-b border-magenta-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-magenta-bright font-medium">[pane-02]</span>
          <span className="text-text-soft">system</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Apple Logo */}
          <svg className="w-4 h-4 text-cyan-bright" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-4 bg-lumon-bg overflow-y-auto">
        {/* Current Time */}
        <div className="space-y-2 mb-4">
          <div className="text-magenta-bright text-sm font-medium">LOCAL TIME</div>
          <div className="text-cyan-bright phosphor-glow text-sm sm:text-lg font-mono">
            {formatTime(currentTime)}
          </div>
          <div className="text-text-soft text-xs">
            {currentTime.toLocaleDateString('en-US', { 
              timeZoneName: 'short',
              timeZone: 'America/Sao_Paulo'
            })} | São Paulo
          </div>
        </div>

        {/* Fastfetch Output */}
        {showFastfetch && (
          <div className="space-y-2">
            <div className="text-magenta-bright text-sm font-medium">SYSTEM INFO</div>
            <div className="bg-lumon-dark border border-magenta-soft rounded p-2 sm:p-3 text-xs text-cyan-bright font-mono">
              <TypewriterText 
                text={fastfetchOutput}
                speed={prefersReducedMotion ? 0 : 15}
                enabled={!prefersReducedMotion}
                className="whitespace-pre-line"
              />
            </div>
          </div>
        )}

        {/* Network Status */}
        <div className="space-y-2 mt-4">
          <div className="text-magenta-bright text-sm font-medium">SSH CONNECTION</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
            <span className="text-terminal-green text-xs">ONLINE</span>
          </div>
          <div className="text-xs text-text-soft">Network: 1Gbps ↓ / 100Mbps ↑</div>
        </div>
      </div>
    </div>
  );
}