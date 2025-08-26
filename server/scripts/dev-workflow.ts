#!/usr/bin/env bun
/**
 * Enhanced Development Workflow Script
 *
 * This script provides an optimized development experience with:
 * - Intelligent startup sequence
 * - Health checks and dependency validation
 * - Real-time configuration monitoring
 * - Graceful error handling and recovery
 * - Hot reload coordination
 */

import { type ChildProcess, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { config } from '../../shared/config'

// ANSI colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

function logInfo(message: string): void {
  console.log(colorize(`ℹ ${message}`, 'blue'))
}

function logSuccess(message: string): void {
  console.log(colorize(`✓ ${message}`, 'green'))
}

function logWarning(message: string): void {
  console.log(colorize(`⚠ ${message}`, 'yellow'))
}

function logError(message: string): void {
  console.log(colorize(`✗ ${message}`, 'red'))
}

function logHeader(message: string): void {
  console.log('')
  console.log(colorize(`🚀 ${message}`, 'cyan'))
  console.log(colorize('='.repeat(message.length + 3), 'cyan'))
}

interface ProcessInfo {
  name: string
  process?: ChildProcess
  port?: number
  status: 'starting' | 'running' | 'failed' | 'stopped'
  startTime?: number
  restartCount: number
}

class DevelopmentWorkflow {
  private projectRoot: string
  private processes = new Map<string, ProcessInfo>()
  private shuttingDown = false

  constructor() {
    this.projectRoot = process.cwd()
    this.setupSignalHandlers()
  }

  private setupSignalHandlers(): void {
    // Graceful shutdown on SIGINT (Ctrl+C) and SIGTERM
    const shutdown = () => {
      if (this.shuttingDown) return
      this.shuttingDown = true

      console.log('')
      logInfo('Shutting down development servers...')
      this.stopAllProcesses()
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.on('SIGHUP', shutdown)
  }

  async run(): Promise<void> {
    logHeader('HackerFolio Development Environment')

    try {
      // Pre-flight checks
      await this.performPreflightChecks()

      // Start services in optimal order
      await this.startDevelopmentServices()

      // Monitor processes
      this.monitorProcesses()
    } catch (error) {
      logError(`Development workflow failed: ${error}`)
      this.stopAllProcesses()
      process.exit(1)
    }
  }

  private async performPreflightChecks(): Promise<void> {
    logHeader('Pre-flight Configuration Checks')

    // Validate environment configuration
    logInfo('Validating environment configuration...')
    try {
      const appConfig = config.get('app')
      const devConfig = config.get('development')
      const securityConfig = config.get('security')

      logSuccess(`Environment: ${appConfig.environment}`)
      logSuccess(`Server port: ${appConfig.port}`)
      logSuccess(`HMR: ${devConfig.hmr ? 'enabled' : 'disabled'}`)
      logSuccess(`CORS origins: ${securityConfig.corsOrigins.join(', ')}`)
    } catch (error) {
      logError(`Configuration validation failed: ${error}`)
      throw error
    }

    // Check critical dependencies
    logInfo('Checking dependencies...')
    await this.checkDependencies()

    // Validate build configuration
    logInfo('Validating build configuration...')
    await this.validateBuildConfig()

    // Check port availability
    logInfo('Checking port availability...')
    await this.checkPortAvailability()

    logSuccess('All pre-flight checks passed!')
  }

  private async checkDependencies(): Promise<void> {
    const criticalFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'server/app.ts',
      'client/src/entry-client.tsx',
    ]

    for (const file of criticalFiles) {
      const filePath = join(this.projectRoot, file)
      if (!existsSync(filePath)) {
        throw new Error(`Critical file missing: ${file}`)
      }
    }

    logSuccess('All critical dependencies present')
  }

  private async validateBuildConfig(): Promise<void> {
    try {
      const viteConfig = config.getViteConfig()
      const tsConfig = config.getTypeScriptPaths()

      // Check Vite configuration
      if (!viteConfig.root || !viteConfig.server || !viteConfig.resolve) {
        throw new Error('Vite configuration incomplete')
      }

      // Check TypeScript configuration
      if (!tsConfig.baseUrl || !tsConfig.paths) {
        throw new Error('TypeScript configuration incomplete')
      }

      logSuccess('Build configuration valid')
    } catch (error) {
      throw new Error(`Build configuration validation failed: ${error}`)
    }
  }

  private async checkPortAvailability(): Promise<void> {
    const appConfig = config.get('app')
    const serverPort = appConfig.port
    const vitePort = 5173 // Default Vite dev server port

    // Check server port
    if (await this.isPortInUse(serverPort)) {
      logWarning(`Port ${serverPort} is already in use. Server will handle this.`)
    } else {
      logSuccess(`Server port ${serverPort} is available`)
    }

    // Check Vite port
    if (await this.isPortInUse(vitePort)) {
      logWarning(`Port ${vitePort} is already in use. Vite will find alternative.`)
    } else {
      logSuccess(`Vite port ${vitePort} is available`)
    }
  }

  private async isPortInUse(port: number): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const server = Bun.serve({
          port,
          hostname: 'localhost',
          fetch: () => new Response('test'),
        })

        // If we can start the server, the port is available
        server.stop()
        resolve(false)
      } catch (error) {
        // If we can't start the server, the port is in use
        resolve(true)
      }
    })
  }

  private async startDevelopmentServices(): Promise<void> {
    logHeader('Starting Development Services')

    // Start backend server first
    await this.startBackendServer()

    // Wait for backend to be ready
    await this.waitForService('backend', config.get('app').port, 10000)

    // Start frontend development server
    await this.startFrontendServer()

    // Wait for frontend to be ready
    await this.waitForService('frontend', 5173, 15000)

    logSuccess('All development services started successfully!')
    this.showDevelopmentInfo()
  }

  private async startBackendServer(): Promise<void> {
    logInfo('Starting backend server...')

    const serverProcess = spawn('bun', ['--hot', 'server/app.ts'], {
      cwd: this.projectRoot,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env },
    })

    this.processes.set('backend', {
      name: 'Backend Server',
      process: serverProcess,
      port: config.get('app').port,
      status: 'starting',
      startTime: Date.now(),
      restartCount: 0,
    })

    // Handle process output
    serverProcess.stdout?.on('data', data => {
      const output = data.toString().trim()
      if (output) {
        console.log(colorize(`[SERVER] ${output}`, 'green'))
      }
    })

    serverProcess.stderr?.on('data', data => {
      const output = data.toString().trim()
      if (output && !output.includes('ExperimentalWarning')) {
        console.log(colorize(`[SERVER] ${output}`, 'yellow'))
      }
    })

    serverProcess.on('error', error => {
      logError(`Backend server error: ${error}`)
      this.processes.get('backend')!.status = 'failed'
    })

    serverProcess.on('exit', code => {
      const processInfo = this.processes.get('backend')!
      if (code !== 0 && !this.shuttingDown) {
        logError(`Backend server exited with code ${code}`)
        processInfo.status = 'failed'
        this.handleProcessFailure('backend')
      } else {
        processInfo.status = 'stopped'
      }
    })
  }

  private async startFrontendServer(): Promise<void> {
    logInfo('Starting frontend development server...')

    const viteProcess = spawn('bun', ['run', 'dev:client'], {
      cwd: this.projectRoot,
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env },
    })

    this.processes.set('frontend', {
      name: 'Frontend Server',
      process: viteProcess,
      port: 5173,
      status: 'starting',
      startTime: Date.now(),
      restartCount: 0,
    })

    // Handle process output
    viteProcess.stdout?.on('data', data => {
      const output = data.toString().trim()
      if (output) {
        console.log(colorize(`[VITE] ${output}`, 'cyan'))
      }
    })

    viteProcess.stderr?.on('data', data => {
      const output = data.toString().trim()
      if (output && !output.includes('ExperimentalWarning')) {
        console.log(colorize(`[VITE] ${output}`, 'magenta'))
      }
    })

    viteProcess.on('error', error => {
      logError(`Frontend server error: ${error}`)
      this.processes.get('frontend')!.status = 'failed'
    })

    viteProcess.on('exit', code => {
      const processInfo = this.processes.get('frontend')!
      if (code !== 0 && !this.shuttingDown) {
        logError(`Frontend server exited with code ${code}`)
        processInfo.status = 'failed'
        this.handleProcessFailure('frontend')
      } else {
        processInfo.status = 'stopped'
      }
    })
  }

  private async waitForService(serviceName: string, port: number, timeout: number): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`http://localhost:${port}`, {
          method: 'GET',
          signal: AbortSignal.timeout(1000),
        })

        if (response.ok || response.status < 500) {
          this.processes.get(serviceName === 'backend' ? 'backend' : 'frontend')!.status = 'running'
          logSuccess(`${serviceName} service is ready on port ${port}`)
          return
        }
      } catch {
        // Service not ready yet, continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    throw new Error(`${serviceName} service failed to start within ${timeout}ms`)
  }

  private handleProcessFailure(processName: string): void {
    const processInfo = this.processes.get(processName)
    if (!processInfo || this.shuttingDown) return

    processInfo.restartCount++

    if (processInfo.restartCount <= 3) {
      logWarning(`Restarting ${processInfo.name} (attempt ${processInfo.restartCount}/3)...`)

      setTimeout(() => {
        if (processName === 'backend') {
          this.startBackendServer()
        } else if (processName === 'frontend') {
          this.startFrontendServer()
        }
      }, 2000)
    } else {
      logError(`${processInfo.name} failed too many times. Manual intervention required.`)
    }
  }

  private monitorProcesses(): void {
    // Monitor process health every 30 seconds
    const healthCheckInterval = setInterval(() => {
      if (this.shuttingDown) {
        clearInterval(healthCheckInterval)
        return
      }

      this.performHealthCheck()
    }, 30000)

    // Keep the process alive
    process.stdin.resume()
  }

  private async performHealthCheck(): Promise<void> {
    for (const [name, processInfo] of this.processes) {
      if (processInfo.status === 'running' && processInfo.port) {
        try {
          const response = await fetch(`http://localhost:${processInfo.port}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          })

          if (!response.ok && response.status >= 500) {
            logWarning(`${processInfo.name} health check failed`)
          }
        } catch {
          logWarning(`${processInfo.name} is not responding`)
          processInfo.status = 'failed'
          this.handleProcessFailure(name)
        }
      }
    }
  }

  private showDevelopmentInfo(): void {
    const appConfig = config.get('app')
    const devConfig = config.get('development')

    console.log('')
    logHeader('Development Environment Ready')
    console.log('')
    logSuccess(`🌐 Frontend: http://localhost:5173`)
    logSuccess(`🚀 Backend:  http://localhost:${appConfig.port}`)
    logSuccess(`📊 API:      http://localhost:${appConfig.port}/api`)
    console.log('')
    logInfo(`Hot Module Replacement: ${devConfig.hmr ? 'enabled' : 'disabled'}`)
    logInfo(`Watch paths: ${devConfig.watchPaths.join(', ')}`)
    console.log('')
    console.log(colorize('Press Ctrl+C to stop all services', 'dim'))
  }

  private stopAllProcesses(): void {
    for (const [, processInfo] of this.processes) {
      if (processInfo.process && processInfo.status !== 'stopped') {
        logInfo(`Stopping ${processInfo.name}...`)
        processInfo.process.kill('SIGTERM')

        // Force kill after 5 seconds if process doesn't stop gracefully
        setTimeout(() => {
          if (processInfo.process && !processInfo.process.killed) {
            processInfo.process.kill('SIGKILL')
          }
        }, 5000)
      }
    }
  }
}

// Execute the development workflow
const workflow = new DevelopmentWorkflow()
await workflow.run()
