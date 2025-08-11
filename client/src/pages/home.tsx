import { useState } from 'react';
import TerminalPane from '@/components/terminal/terminal-pane';
import StatusPane from '@/components/terminal/status-pane';
import FeaturedPane from '@/components/terminal/featured-pane';
import ResizeHandle from '@/components/ui/resize-handle';

export default function Home() {
  const [leftPaneWidth, setLeftPaneWidth] = useState(66.666667); // 2fr equivalent in percentage

  const handleResize = (delta: number) => {
    const windowWidth = window.innerWidth;
    const deltaPercent = (delta / windowWidth) * 100;
    const newWidth = Math.max(30, Math.min(80, leftPaneWidth + deltaPercent));
    setLeftPaneWidth(newWidth);
  };

  return (
    <div className="h-screen overflow-hidden" style={{ background: 'var(--lumon-dark)' }}>
      <div 
        className="h-full grid gap-0 p-4"
        style={{
          gridTemplateColumns: `${leftPaneWidth}% 4px ${100 - leftPaneWidth - 0.4}%`
        }}
      >
        {/* Terminal Pane */}
        <div className="min-w-0" id="main-terminal" role="main" aria-label="Interactive Terminal">
          <TerminalPane />
        </div>

        {/* Resize Handle */}
        <ResizeHandle onResize={handleResize} />

        {/* Right Panes Container */}
        <div className="grid grid-rows-2 gap-4 min-w-0">
          <StatusPane />
          <FeaturedPane />
        </div>
      </div>
    </div>
  );
}
