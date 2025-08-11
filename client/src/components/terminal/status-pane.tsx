import { useState, useEffect } from 'react';

export default function StatusPane() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const appleAscii = `                    'c.
                 ,xNMM.
               .OMMMMo
               OMMM0,
     .;loddo:' loolloddol;.
   cKMMMMMMMMMMNWMMMMMMMMMM0:
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.
 XMMMMMMMMMMMMMMMMMMMMMMMX.
;MMMMMMMMMMMMMMMMMMMMMMMM:
:MMMMMMMMMMMMMMMMMMMMMMMM:
.MMMMMMMMMMMMMMMMMMMMMMMMX.
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.
 .XMMMMMMMMMMMMMMMMMMMMMMMMMMk
  .XMMMMMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMMMMMd
     ;KMMMMMMMWXXWMMMMMMMk.
       .cooc,.    .,coo:.`;

  return (
    <div className="pane-border rounded-lg overflow-hidden flex flex-col h-full" aria-label="System Information">
      <div className="bg-lumon-border px-4 py-2 border-b border-cyan-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-02]</span>
          <span className="text-text-soft">fastfetch</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
      </div>

      <div className="flex-1 p-3 bg-lumon-bg overflow-y-auto">
        <div className="grid grid-cols-[auto_1fr] gap-4 text-xs">
          {/* Apple Logo */}
          <div className="text-text-soft leading-none font-mono whitespace-pre">
            {appleAscii}
          </div>

          {/* System Information */}
          <div className="space-y-1 min-w-0">
            <div className="flex">
              <span className="text-cyan-bright font-medium w-16 flex-shrink-0">tulio</span>
              <span className="text-text-soft">@</span>
              <span className="text-cyan-bright font-medium">MacBook-Pro</span>
            </div>
            
            <div className="border-t border-lumon-border my-1"></div>

            <div className="space-y-1">
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">OS</span>
                <span className="text-text-soft">macOS Sequoia 15.1</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Host</span>
                <span className="text-text-soft">MacBook Pro (16-in, 2023)</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Kernel</span>
                <span className="text-text-soft">Darwin 24.1.0</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Uptime</span>
                <span className="text-text-soft">3 days, 14 hours, 22 mins</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Packages</span>
                <span className="text-text-soft">127 (brew), 0 (mas)</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Shell</span>
                <span className="text-text-soft">zsh 5.9</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Resolution</span>
                <span className="text-text-soft">3456x2234 @ 120Hz</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">DE</span>
                <span className="text-text-soft">Aqua</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">WM</span>
                <span className="text-text-soft">Quartz Compositor</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Terminal</span>
                <span className="text-text-soft">WarpTerminal</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">CPU</span>
                <span className="text-text-soft">Apple M4 Max (16) @ 4.05GHz</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">GPU</span>
                <span className="text-text-soft">Apple M4 Max</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Memory</span>
                <span className="text-text-soft">12.59 GiB / 128.0 GiB</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Swap</span>
                <span className="text-text-soft">4.13 GiB / 9.00 GiB</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Disk (/)</span>
                <span className="text-text-soft">254.28 GiB / 4.0 TiB</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Battery</span>
                <span className="text-text-soft">100% [AC]</span>
              </div>
              
              <div className="flex">
                <span className="text-cyan-bright w-16 flex-shrink-0">Locale</span>
                <span className="text-text-soft">en_US.UTF-8</span>
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-2 pt-2 border-t border-lumon-border">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-black"></div>
                <div className="w-3 h-3 bg-red-500"></div>
                <div className="w-3 h-3 bg-green-500"></div>
                <div className="w-3 h-3 bg-yellow-500"></div>
                <div className="w-3 h-3 bg-blue-500"></div>
                <div className="w-3 h-3 bg-purple-500"></div>
                <div className="w-3 h-3 bg-cyan-500"></div>
                <div className="w-3 h-3 bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
