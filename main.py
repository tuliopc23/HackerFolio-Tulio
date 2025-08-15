#!/usr/bin/env python3
import subprocess
import sys
import os
import signal

def signal_handler(sig, frame):
    print('\nShutting down development server...')
    sys.exit(0)

def main():
    """
    Wrapper script to run the Node.js development server
    This allows Replit to properly start the terminal portfolio application
    """
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("Starting Terminal Portfolio Development Server...")
    
    try:
        # Change to the project directory
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Run the npm dev command
        process = subprocess.Popen(['npm', 'run', 'dev'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.STDOUT,
                                 universal_newlines=True,
                                 bufsize=1)
        
        # Stream output in real-time
        for line in process.stdout:
            print(line, end='')
            
        process.wait()
        return process.returncode
        
    except FileNotFoundError:
        print("Error: npm not found. Make sure Node.js is installed.")
        return 1
    except KeyboardInterrupt:
        print("\nShutting down development server...")
        return 0
    except Exception as e:
        print(f"Error starting development server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())