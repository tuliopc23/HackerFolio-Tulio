import { useState } from 'react';
import TerminalPane from '@/components/terminal/terminal-pane';
import StatusPane from '@/components/terminal/status-pane';
import FeaturedPane from '@/components/terminal/featured-pane';
import BlogPane from '@/components/terminal/blog-pane';
import ResizeHandle from '@/components/ui/resize-handle';

export default function Home() {
  const [leftPaneWidth, setLeftPaneWidth] = useState(60); // Optimized for 4-pane layout
  const [topRightHeight, setTopRightHeight] = useState(50); // For vertical resize in right column

  const handleHorizontalResize = (delta: number) => {
    const windowWidth = window.innerWidth;
    const deltaPercent = (delta / windowWidth) * 100;
    const newWidth = Math.max(40, Math.min(75, leftPaneWidth + deltaPercent));
    setLeftPaneWidth(newWidth);
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #1a1a1a 0%, #0f0f0f 100%)' }}>
      <div className="mac-screen-frame h-[95vh] w-[98vw] max-w-7xl">
        <div className="apple-logo"></div>
        <div className="ventilation"></div>
        <div className="power-led"></div>
        <div className="screen-content h-full w-full">
          <div
            className="grid h-full gap-0 p-4"
            style={{
              gridTemplateColumns: `${leftPaneWidth}% 4px ${100 - leftPaneWidth - 0.4}%`,
            }}
          >
        {/* Terminal Pane */}
        <div aria-label="Interactive Terminal" className="min-w-0" id="main-terminal" role="main">
          <TerminalPane />
        </div>

        {/* Horizontal Resize Handle */}
        <ResizeHandle onResize={handleHorizontalResize} />

        {/* Right Side - 2x2 Grid */}
        <div
          className="grid min-w-0 gap-4"
          style={{ gridTemplateRows: `${topRightHeight}% 4px ${100 - topRightHeight - 0.8}%` }}
        >
          {/* Top Right Row - 2 panes side by side */}
          <div className="grid grid-cols-2 gap-4">
            <StatusPane />
            <FeaturedPane />
          </div>

          {/* Vertical Resize Handle for right column */}
          <div
            className="resize-handle h-1 w-full cursor-row-resize opacity-50 transition-opacity hover:opacity-100"
            style={{ background: 'var(--cyan-soft)' }}
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startHeight = topRightHeight;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = e.clientY - startY;
                const containerHeight = window.innerHeight - 32;
                const deltaPercent = (deltaY / containerHeight) * 100;
                const newHeight = Math.max(30, Math.min(70, startHeight + deltaPercent));
                setTopRightHeight(newHeight);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />

          {/* Bottom Right Row - Blog pane spanning full width */}
          <div className="min-w-0">
            <BlogPane />
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
