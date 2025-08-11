import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useLocation } from 'wouter';
import { CommandProcessor, CommandResult } from './command-processor';
import { useTheme } from './theme-context';

interface TerminalHistory {
  command: string;
  output: string;
  timestamp: Date;
  error?: boolean;
}

export default function TerminalPane() {
  const [, setLocation] = useLocation();
  const { setTheme } = useTheme();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalHistory[]>([]);
  const [processor] = useState(() => new CommandProcessor());
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when history updates
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const historyCommand = processor.getHistoryCommand('up');
      setInput(historyCommand);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const historyCommand = processor.getHistoryCommand('down');
      setInput(historyCommand);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setInput('');
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
    }
  };

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    processor.addToHistory(command);
    const result: CommandResult = processor.processCommand(command);

    // Handle special commands
    if (result.output === 'CLEAR') {
      setHistory([]);
      setInput('');
      return;
    }

    // Handle navigation
    if (result.navigate) {
      if (result.navigate.startsWith('theme:')) {
        const themeName = result.navigate.substring(6) as 'lumon' | 'neon' | 'mono';
        setTheme(themeName);
      } else {
        setLocation(result.navigate);
      }
    }

    // Add to history
    setHistory(prev => [...prev, {
      command,
      output: result.output,
      timestamp: new Date(),
      error: result.error
    }]);

    setInput('');
  };

  const handleAutocomplete = () => {
    const suggestions = processor.getAutocomplete(input);
    if (suggestions.length === 1) {
      setInput(suggestions[0]);
    } else if (suggestions.length > 1) {
      // Show suggestions in output
      setHistory(prev => [...prev, {
        command: input,
        output: suggestions.join('  '),
        timestamp: new Date()
      }]);
    }
  };

  const formatOutput = (output: string) => {
    return output.split('\n').map((line, i) => (
      <div 
        key={i} 
        className="whitespace-pre-wrap terminal-text"
        dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
      />
    ));
  };

  return (
    <div className="pane-border pane-focus rounded-lg overflow-hidden flex flex-col h-full">
      {/* Pane Header */}
      <div className="bg-lumon-border px-4 py-2 border-b border-cyan-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-01]</span>
          <span className="text-text-soft">terminal</span>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-terminal-red"></div>
          <div className="w-3 h-3 rounded-full bg-terminal-orange"></div>
          <div className="w-3 h-3 rounded-full bg-terminal-green"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={outputRef}
        className="flex-1 p-4 bg-lumon-bg overflow-y-auto"
        id="terminal-content"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {/* Boot Sequence */}
        <div className="terminal-output mb-4">
          <div className="text-cyan-bright mb-2">LUMON TERMINAL v2.1.7</div>
          <div className="text-text-soft text-sm mb-1">Initializing secure connection...</div>
          <div className="text-terminal-green text-sm mb-4">✓ Connection established</div>
        </div>

        {/* Welcome Message */}
        <div className="terminal-output mb-6">
          <div className="text-neon-blue phosphor-glow mb-2 text-sm font-mono rgb-shift" data-text={`████████╗██╗   ██╗██╗     ██╗ ██████╗ 
╚══██╔══╝██║   ██║██║     ██║██╔═══██╗
   ██║   ██║   ██║██║     ██║██║   ██║
   ██║   ██║   ██║██║     ██║██║   ██║
   ██║   ╚██████╔╝███████╗██║╚██████╔╝
   ╚═╝    ╚═════╝ ╚══════╝╚═╝ ╚═════╝`}>
            <pre>{`████████╗██╗   ██╗██╗     ██╗ ██████╗ 
╚══██╔══╝██║   ██║██║     ██║██╔═══██╗
   ██║   ██║   ██║██║     ██║██║   ██║
   ██║   ██║   ██║██║     ██║██║   ██║
   ██║   ╚██████╔╝███████╗██║╚██████╔╝
   ╚═╝    ╚═════╝ ╚══════╝╚═╝ ╚═════╝`}</pre>
          </div>
          <div className="text-text-soft mb-4 glitch-hover">Full-stack Developer | Terminal Interface</div>
          <div className="text-cyan-soft terminal-prompt">Type 'help' to see available commands</div>
        </div>

        {/* Command History */}
        <div className="terminal-output space-y-2">
          {history.map((entry, index) => (
            <div key={index}>
              <div className="flex">
                <span className="text-terminal-green">user@portfolio:~$</span>
                <span className="ml-2 text-text-cyan">{entry.command}</span>
              </div>
              {entry.output && (
                <div className={`ml-4 mb-2 ${entry.error ? 'text-terminal-red' : 'text-text-soft'}`}>
                  {formatOutput(entry.output)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Command Line */}
        <div className="flex items-center">
          <span className="text-terminal-green">user@portfolio:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="ml-2 bg-transparent border-none outline-none text-text-cyan flex-1"
            placeholder="Type a command..."
            aria-label="Terminal command input"
          />
          <span className="cursor-block"></span>
        </div>
      </div>

      {/* Command Help Footer */}
      <div className="bg-lumon-border px-4 py-2 border-t border-cyan-soft text-xs text-text-soft">
        <div className="flex flex-wrap gap-4">
          <span><kbd className="bg-lumon-dark px-1 rounded">Tab</kbd> autocomplete</span>
          <span><kbd className="bg-lumon-dark px-1 rounded">↑↓</kbd> history</span>
          <span><kbd className="bg-lumon-dark px-1 rounded">Ctrl+C</kbd> clear</span>
          <span><kbd className="bg-lumon-dark px-1 rounded">Ctrl+L</kbd> clear screen</span>
        </div>
      </div>
    </div>
  );
}
