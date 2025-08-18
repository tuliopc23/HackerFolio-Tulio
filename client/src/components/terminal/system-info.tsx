import { useState, useEffect } from 'react';

interface SystemInfo {
  hostname: string;
  os: string;
  arch: string;
  cores: number;
  memory: string;
  uptime: string;
  shell: string;
  terminal: string;
  resolution: string;
}

export default function SystemInfoPane() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    hostname: 'MacBook-Pro.local',
    os: 'macOS Sequoia 15.1',
    arch: 'arm64',
    cores: 12,
    memory: '64 GB',
    uptime: '3 days, 14:32',
    shell: '/bin/zsh',
    terminal: 'Terminal Portfolio v2.1',
    resolution: '3024x1964'
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const appleLogoAscii = `
       🍎
     ▄▄▄▄▄▄▄
   ▄█████████▄
  ███████████
  ███████████
  ███████████
   ▀█████████▀
     ▀▀▀▀▀▀▀
  `;

  const macInfoAscii = `
                ,'-.
               /  (
              o ._)
             _,'
        ,--.-'
       /  (
      o ._)
     _,'
,--.-'
 macOS
`;

  const formatUptime = () => {
    const now = Date.now();
    const startTime = now - (Math.random() * 86400000 * 5); // Random uptime up to 5 days
    const uptime = Math.floor((now - startTime) / 1000);
    
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      {/* ASCII Art Header */}
      <div className="ascii-art text-center mb-4 text-xs">
        <div className="typing-text fast">{macInfoAscii}</div>
      </div>

      {/* System Information Grid */}
      <div className="system-info flex-1">
        <div className="text-cyan-bright text-sm font-bold mb-3 typing-text">
          System Information
        </div>
        
        <div className="system-info-grid text-xs space-y-1">
          <span className="info-label">Hostname:</span>
          <span className="info-value">{systemInfo.hostname}</span>
          
          <span className="info-label">OS:</span>
          <span className="info-value">{systemInfo.os}</span>
          
          <span className="info-label">Architecture:</span>
          <span className="info-value">{systemInfo.arch}</span>
          
          <span className="info-label">CPU Cores:</span>
          <span className="info-value">{systemInfo.cores}</span>
          
          <span className="info-label">Memory:</span>
          <span className="info-value">{systemInfo.memory}</span>
          
          <span className="info-label">Uptime:</span>
          <span className="info-value">{formatUptime()}</span>
          
          <span className="info-label">Shell:</span>
          <span className="info-value">{systemInfo.shell}</span>
          
          <span className="info-label">Terminal:</span>
          <span className="info-value">{systemInfo.terminal}</span>
          
          <span className="info-label">Resolution:</span>
          <span className="info-value">{systemInfo.resolution}</span>
          
          <span className="info-label">Local Time:</span>
          <span className="info-value">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>

        {/* System Stats */}
        <div className="mt-4 pt-3 border-t border-cyan-soft">
          <div className="text-cyan-bright text-xs font-bold mb-2">Quick Stats</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-lumon-dark border border-cyan-soft rounded p-2 text-center">
              <div className="text-terminal-green font-bold">98%</div>
              <div className="text-text-soft">CPU Usage</div>
            </div>
            <div className="bg-lumon-dark border border-cyan-soft rounded p-2 text-center">
              <div className="text-terminal-orange font-bold">24GB</div>
              <div className="text-text-soft">RAM Used</div>
            </div>
            <div className="bg-lumon-dark border border-cyan-soft rounded p-2 text-center">
              <div className="text-terminal-yellow font-bold">512GB</div>
              <div className="text-text-soft">Storage</div>
            </div>
            <div className="bg-lumon-dark border border-cyan-soft rounded p-2 text-center">
              <div className="text-cyan-bright font-bold">Connected</div>
              <div className="text-text-soft">Network</div>
            </div>
          </div>
        </div>

        {/* Terminal Art */}
        <div className="mt-4 text-center">
          <div className="ascii-art text-xs opacity-60">
            <div className="typewriter-line">┌─────────────────────┐</div>
            <div className="typewriter-line">│   Terminal Ready    │</div>
            <div className="typewriter-line">│  ████████████████   │</div>
            <div className="typewriter-line">│  ██ System Info ██   │</div>
            <div className="typewriter-line">│  ████████████████   │</div>
            <div className="typewriter-line">└─────────────────────┘</div>
          </div>
        </div>
      </div>
    </div>
  );
}