import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTheme } from './theme-context';
import { 
  Home, 
  FolderOpen, 
  User, 
  Mail, 
  Palette, 
  Minimize2, 
  Maximize2, 
  X 
} from 'lucide-react';

export default function FloatingDockTerminal() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMinimized, setIsMinimized] = useState(false);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'projects', icon: FolderOpen, label: 'Projects', path: '/projects' },
    { id: 'about', icon: User, label: 'About', path: '/about' },
    { id: 'contact', icon: Mail, label: 'Contact', path: '/contact' },
  ];

  const systemItems = [
    { 
      id: 'theme', 
      icon: Palette, 
      label: 'Theme', 
      action: () => {
        const themes = ['lumon', 'neon', 'mono'] as const;
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
      }
    },
  ];

  const trafficLights = [
    { color: 'bg-terminal-red', action: () => console.log('Close') },
    { color: 'bg-terminal-orange', action: () => setIsMinimized(!isMinimized) },
    { color: 'bg-terminal-green', action: () => console.log('Maximize') },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 hidden md:block">
      {/* Traffic Lights */}
      <div className="flex items-center gap-2 mb-2 bg-lumon-bg border border-magenta-soft rounded-lg p-2" role="toolbar" aria-label="Window controls">
        {trafficLights.map((light, index) => (
          <button
            key={index}
            onClick={light.action}
            className={`w-3 h-3 rounded-full ${light.color} hover:brightness-110 transition-all duration-200`}
            aria-label={index === 0 ? 'Close window' : index === 1 ? 'Minimize window' : 'Maximize window'}
            tabIndex={0}
          />
        ))}
      </div>

      {/* Dock Container */}
      {!isMinimized && (
        <div className="bg-lumon-bg border border-magenta-soft rounded-lg p-2 space-y-2" role="navigation" aria-label="Main navigation dock">
          {/* Navigation Section */}
          <div className="space-y-1" role="group" aria-labelledby="nav-heading">
            <div id="nav-heading" className="text-xs text-magenta-soft px-2 mb-1">Navigation</div>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-cyan-bright hover:bg-magenta-soft hover:bg-opacity-20 transition-colors group focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50"
                title={item.label}
                aria-label={`Navigate to ${item.label}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-magenta-soft bg-opacity-30"></div>

          {/* System Section */}
          <div className="space-y-1" role="group" aria-labelledby="system-heading">
            <div id="system-heading" className="text-xs text-magenta-soft px-2 mb-1">System</div>
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-cyan-bright hover:bg-magenta-soft hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-50"
                title={item.label}
                aria-label={`System: ${item.label}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
