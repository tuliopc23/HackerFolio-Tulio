#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Terminal Portfolio Development Server...');

// Start the development server
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname),
  shell: true
});

devServer.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

devServer.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  devServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  devServer.kill('SIGTERM');
});