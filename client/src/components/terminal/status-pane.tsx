import SystemInfoPane from './system-info';
import { Monitor } from 'lucide-react';

export default function StatusPane() {
  return (
    <div
      aria-label="System Status"
      className="pane-border flex h-full flex-col overflow-hidden rounded-lg"
    >
      <div className="bg-lumon-border border-cyan-soft flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-02]</span>
          <span className="text-text-soft">system status</span>
        </div>
        <Monitor className="text-terminal-green h-4 w-4" />
      </div>

      <div className="bg-lumon-bg flex-1 overflow-hidden">
        <SystemInfoPane />
      </div>
    </div>
  );
}
