import { useState, useEffect } from 'react';

export default function StatusPane() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStats] = useState({
    cpu: '12%',
    memory: '2.1GB',
    uptime: '47d 12h',
    latency: '23ms'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pane-border rounded-lg overflow-hidden flex flex-col h-full" aria-label="System Status">
      <div className="bg-lumon-border px-4 py-2 border-b border-cyan-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-02]</span>
          <span className="text-text-soft">status</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
      </div>

      <div className="flex-1 p-4 bg-lumon-bg space-y-4 overflow-y-auto">
        {/* System Info */}
        <div className="space-y-2">
          <div className="text-cyan-bright text-sm font-medium">SYSTEM STATUS</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-soft">CPU:</span>
              <span className="text-terminal-green">{systemStats.cpu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-soft">Memory:</span>
              <span className="text-terminal-green">{systemStats.memory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-soft">Uptime:</span>
              <span className="text-terminal-green">{systemStats.uptime}</span>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="space-y-2">
          <div className="text-cyan-bright text-sm font-medium">LOCAL TIME</div>
          <div className="text-neon-blue phosphor-glow text-lg font-mono">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-text-soft text-xs">
            {currentTime.toLocaleDateString('en-US', { 
              timeZoneName: 'short',
              timeZone: 'America/Sao_Paulo'
            })} | São Paulo
          </div>
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <div className="text-cyan-bright text-sm font-medium">NETWORK</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></div>
            <span className="text-terminal-green text-xs">CONNECTED</span>
          </div>
          <div className="text-xs text-text-soft">Latency: {systemStats.latency}</div>
        </div>

        {/* Git Status */}
        <div className="space-y-2">
          <div className="text-cyan-bright text-sm font-medium">GIT STATUS</div>
          <div className="text-xs space-y-1">
            <div className="text-terminal-green">✓ main branch</div>
            <div className="text-text-soft">No uncommitted changes</div>
            <div className="text-text-soft">Last commit: 2h ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
