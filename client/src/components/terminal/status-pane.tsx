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
        <div className="font-mono text-xs leading-tight">
          <div className="flex">
            {/* Apple Logo Column */}
            <div className="text-text-soft whitespace-pre mr-4">
{`                    'c.
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
       .cooc,.    .,coo:.`}
            </div>

            {/* System Information Column */}
            <div className="flex-1 space-y-0">
              <div className="mb-1">
                <span className="text-cyan-bright font-medium">tulio</span>
                <span className="text-text-soft">@</span>
                <span className="text-cyan-bright font-medium">MacBook-Pro</span>
              </div>
              
              <div className="text-text-soft mb-1">-------------------------</div>

              <div><span className="text-cyan-bright">OS:</span> <span className="text-text-soft">macOS Tahoe 26.0 arm64</span></div>
              <div><span className="text-cyan-bright">Host:</span> <span className="text-text-soft">MacBook Pro (16-in)</span></div>
              <div><span className="text-cyan-bright">Kernel:</span> <span className="text-text-soft">Darwin 25.0.0</span></div>
              <div><span className="text-cyan-bright">Uptime:</span> <span className="text-text-soft">22 hours, 44 mins</span></div>
              <div><span className="text-cyan-bright">Packages:</span> <span className="text-text-soft">197 (brew), 75 (mas)</span></div>
              <div><span className="text-cyan-bright">Shell:</span> <span className="text-text-soft">fish 4.0.2</span></div>
              <div><span className="text-cyan-bright">Display (Color LCD):</span> <span className="text-text-soft">3024x1964</span></div>
              <div><span className="text-cyan-bright">DE:</span> <span className="text-text-soft">Liquid Glass</span></div>
              <div><span className="text-cyan-bright">WM:</span> <span className="text-text-soft">Quartz Compositor 340</span></div>
              <div><span className="text-cyan-bright">WM Theme:</span> <span className="text-text-soft">Multicolor (Dark)</span></div>
              <div><span className="text-cyan-bright">Font:</span> <span className="text-text-soft">.AppleSystemUIFont</span></div>
              <div><span className="text-cyan-bright">Cursor:</span> <span className="text-text-soft">Fill - Black, Outline</span></div>
              <div><span className="text-cyan-bright">Terminal:</span> <span className="text-text-soft">preview</span></div>
              <div><span className="text-cyan-bright">CPU:</span> <span className="text-text-soft">Apple M4 Max (16) @ 4.05GHz</span></div>
              <div><span className="text-cyan-bright">GPU:</span> <span className="text-text-soft">Apple M4 Max (40) @ 1.40GHz</span></div>
              <div><span className="text-cyan-bright">Memory:</span> <span className="text-text-soft">12.59 GiB / 128.0 GiB</span></div>
              <div><span className="text-cyan-bright">Swap:</span> <span className="text-text-soft">4.13 GiB / 9.00 GiB</span></div>
              <div><span className="text-cyan-bright">Disk (/):</span> <span className="text-text-soft">254.28 GiB / 4.0 TiB</span></div>
              <div><span className="text-cyan-bright">Local IP (utun6):</span> <span className="text-text-soft">100.120.x.x</span></div>
              <div><span className="text-cyan-bright">Battery (bq40z651):</span> <span className="text-text-soft">74% [AC]</span></div>
              <div><span className="text-cyan-bright">Locale:</span> <span className="text-text-soft">C</span></div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="mt-3 flex gap-1">
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
  );
}
