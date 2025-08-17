import { useState, useEffect } from 'react';

export default function StatusPane() {
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-terminal-dim">
      <div className="text-xs font-mono">
        <div className="mb-2">System Status: Online</div>
        <div className="mb-2">Uptime: {Math.floor(Date.now() / 1000)} seconds</div>
        <div>Memory: 512MB Available</div>
      </div>
    </div>
  );
}
