import type { KeyboardEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import type { CommandResult } from './command-processor';
import { CommandProcessor } from './command-processor';
import { useTheme } from "@/hooks/use-theme";

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
    inputRef.current?.focus();
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
        const themeName = result.navigate.substring(6) as 'lumon' | 'neon' | 'pico';
        setTheme(themeName);
      } else {
        setLocation(result.navigate);
      }
    }

    // Add to history
    setHistory((prev) => [
      ...prev,
      {
        command,
        output: result.output,
        timestamp: new Date(),
        error: result.error,
      },
    ]);

    setInput('');
  };

  const handleAutocomplete = () => {
    const suggestions = processor.getAutocomplete(input);
    if (suggestions.length === 1) {
      setInput(suggestions[0] || '');
    } else if (suggestions.length > 1) {
      // Show suggestions in output
      setHistory((prev) => [
        ...prev,
        {
          command: input,
          output: suggestions.join('  '),
          timestamp: new Date(),
        },
      ]);
    }
  };

  const formatOutput = (output: string) => {
    return output.split('\n').map((line, i) => (
      <div className="whitespace-pre-wrap" key={i}>
        {line}
      </div>
    ));
  };

  return (
    <div
      className="pane-border pane-focus flex h-full flex-col overflow-hidden rounded-lg"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Pane Header */}
      <div className="bg-lumon-border border-cyan-soft flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-bright font-medium">[pane-01]</span>
          <span className="text-text-soft">terminal</span>
        </div>
        <div className="flex gap-2">
          <div className="bg-terminal-red h-3 w-3 rounded-full" />
          <div className="bg-terminal-orange h-3 w-3 rounded-full" />
          <div className="bg-terminal-green h-3 w-3 rounded-full" />
        </div>
      </div>

      {/* Terminal Content */}
      <div
        aria-label="Terminal output"
        aria-live="polite"
        className="bg-lumon-bg flex-1 overflow-y-auto p-4"
        id="terminal-content"
        ref={outputRef}
        role="log"
      >
        {/* Boot Sequence */}
        <div className="terminal-output mb-4">
          <div className="text-cyan-bright mb-2">LUMON TERMINAL v2.1.7</div>
          <div className="text-text-soft mb-1 text-sm">Initializing secure connection...</div>
          <div className="text-terminal-green mb-4 text-sm">✓ Connection established</div>
        </div>

        {/* Welcome Message */}
        <div className="terminal-output mb-6">
          <div className="text-neon-blue phosphor-glow-enhanced mb-2 font-mono text-sm crt-glow">
            <pre>{`████████╗██╗   ██╗██╗     ██╗ ██████╗ 
╚══██╔══╝██║   ██║██║     ██║██╔═══██╗
   ██║   ██║   ██║██║     ██║██║   ██║
   ██║   ██║   ██║██║     ██║██║   ██║
   ██║   ╚██████╔╝███████╗██║╚██████╔╝
   ╚═╝    ╚═════╝ ╚══════╝╚═╝ ╚═════╝`}</pre>
          </div>
          <div className="text-text-soft mb-4">Full-stack Developer | Terminal Interface</div>
          <div className="text-cyan-soft">Type 'help' to see available commands</div>
        </div>

        {/* Command History */}
        <div className="terminal-output space-y-2">
          {history.map((entry, index) => (
            <div key={index}>
              <div className="flex">
                <span className="text-terminal-green phosphor-glow">user@portfolio:~$</span>
                <span className="text-text-cyan ml-2 phosphor-glow-enhanced">{entry.command}</span>
              </div>
              {entry.output && (
                <div
                  className={`mb-2 ml-4 ${entry.error ? 'text-terminal-red phosphor-glow' : 'text-text-soft'}`}
                >
                  {formatOutput(entry.output)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Command Line */}
        <div className="flex items-center crt-glow">
          <span className="text-terminal-green phosphor-glow">user@portfolio:~$</span>
          <input
            aria-label="Terminal command input"
            className="text-text-cyan phosphor-glow-enhanced ml-2 flex-1 border-none bg-transparent outline-none"
            placeholder="Type a command..."
            ref={inputRef}
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="cursor-block" />
        </div>
      </div>

      {/* Command Help Footer */}
      <div className="bg-lumon-border border-cyan-soft text-text-soft border-t px-4 py-2 text-xs">
        <div className="flex flex-wrap gap-4">
          <span>
            <kbd className="bg-lumon-dark rounded px-1">Tab</kbd> autocomplete
          </span>
          <span>
            <kbd className="bg-lumon-dark rounded px-1">↑↓</kbd> history
          </span>
          <span>
            <kbd className="bg-lumon-dark rounded px-1">Ctrl+C</kbd> clear
          </span>
          <span>
            <kbd className="bg-lumon-dark rounded px-1">Ctrl+L</kbd> clear screen
          </span>
        </div>
      </div>
    </div>
  );
}
