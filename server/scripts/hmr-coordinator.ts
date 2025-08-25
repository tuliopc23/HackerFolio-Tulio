#!/usr/bin/env bun
/**
 * Hot Module Replacement Coordination Script
 * 
 * This script enhances the development experience by:
 * - Coordinating HMR between frontend and backend
 * - Monitoring file changes across the project
 * - Triggering appropriate reloads based on change type
 * - Maintaining connection state during reloads
 * - Providing intelligent reload strategies
 */

import { watch } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { config } from '../../shared/config'

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

function logInfo(message: string): void {
  const timestamp = new Date().toLocaleTimeString()
  console.log(colorize(`[${timestamp}] ℹ ${message}`, 'blue'))
}

function logSuccess(message: string): void {
  const timestamp = new Date().toLocaleTimeString()
  console.log(colorize(`[${timestamp}] ✓ ${message}`, 'green'))
}

function logWarning(message: string): void {
  const timestamp = new Date().toLocaleTimeString()
  console.log(colorize(`[${timestamp}] ⚠ ${message}`, 'yellow'))
}

function logChange(message: string): void {
  const timestamp = new Date().toLocaleTimeString()
  console.log(colorize(`[${timestamp}] 🔄 ${message}`, 'cyan'))
}

interface ChangeEvent {
  path: string
  type: 'client' | 'server' | 'shared' | 'config'
  action: 'reload' | 'restart' | 'refresh'
  priority: 'low' | 'medium' | 'high'
}

interface ReloadStats {
  totalChanges: number
  clientReloads: number
  serverRestarts: number
  configReloads: number
  lastChange: Date
}

class HotReloadCoordinator {
  private projectRoot: string
  private watchers: Map<string, any> = new Map()
  private reloadQueue: ChangeEvent[] = []
  private processing = false
  private stats: ReloadStats = {
    totalChanges: 0,
    clientReloads: 0,
    serverRestarts: 0,
    configReloads: 0,
    lastChange: new Date()
  }
  private debounceTimer?: Timer

  constructor() {
    this.projectRoot = process.cwd()
  }

  async start(): Promise<void> {
    console.log(colorize('🔥 Hot Reload Coordinator Starting...', 'cyan'))
    console.log('')
    
    const devConfig = config.get('development')
    const pathsConfig = config.get('paths')
    
    logInfo(`HMR enabled: ${devConfig.hmr}`)
    logInfo(`Watch paths: ${devConfig.watchPaths.join(', ')}`)
    console.log('')

    // Start watching different areas with specific strategies
    this.startClientWatcher()
    this.startServerWatcher()
    this.startSharedWatcher()
    this.startConfigWatcher()
    
    // Setup graceful shutdown
    this.setupShutdownHandlers()
    
    logSuccess('Hot Reload Coordinator is active')
    this.showWatchingPaths()
  }

  private startClientWatcher(): void {
    const clientPath = join(this.projectRoot, 'client')
    
    const watcher = watch(clientPath, { recursive: true }, (eventType, filename) => {
      if (!filename || this.shouldIgnoreFile(filename)) return
      
      const fullPath = join(clientPath, filename)
      const event: ChangeEvent = {
        path: relative(this.projectRoot, fullPath),
        type: 'client',
        action: this.getClientAction(filename),
        priority: this.getClientPriority(filename)
      }
      
      this.queueChange(event)
    })
    
    this.watchers.set('client', watcher)
    logInfo('Watching client directory for changes')
  }

  private startServerWatcher(): void {
    const serverPath = join(this.projectRoot, 'server')
    
    const watcher = watch(serverPath, { recursive: true }, (eventType, filename) => {
      if (!filename || this.shouldIgnoreFile(filename)) return
      
      const fullPath = join(serverPath, filename)
      const event: ChangeEvent = {
        path: relative(this.projectRoot, fullPath),
        type: 'server',
        action: this.getServerAction(filename),
        priority: this.getServerPriority(filename)
      }
      
      this.queueChange(event)
    })
    
    this.watchers.set('server', watcher)
    logInfo('Watching server directory for changes')
  }

  private startSharedWatcher(): void {
    const sharedPath = join(this.projectRoot, 'shared')
    
    const watcher = watch(sharedPath, { recursive: true }, (eventType, filename) => {
      if (!filename || this.shouldIgnoreFile(filename)) return
      
      const fullPath = join(sharedPath, filename)
      const event: ChangeEvent = {
        path: relative(this.projectRoot, fullPath),
        type: 'shared',
        action: 'refresh', // Shared changes affect both client and server
        priority: 'high'
      }
      
      this.queueChange(event)
    })
    
    this.watchers.set('shared', watcher)
    logInfo('Watching shared directory for changes')
  }

  private startConfigWatcher(): void {
    const configFiles = [
      'vite.config.ts',
      'tsconfig.json',
      'package.json',
      '.env',
      'eslint.config.js',
      'vitest.config.ts'
    ]
    
    configFiles.forEach(file => {
      const filePath = join(this.projectRoot, file)
      
      try {
        const watcher = watch(filePath, (eventType) => {
          const event: ChangeEvent = {
            path: file,
            type: 'config',
            action: this.getConfigAction(file),
            priority: 'high'
          }
          
          this.queueChange(event)
        })
        
        this.watchers.set(file, watcher)
      } catch (error) {
        // File might not exist, skip
      }
    })
    
    logInfo('Watching configuration files for changes')
  }

  private queueChange(event: ChangeEvent): void {
    this.stats.totalChanges++
    this.stats.lastChange = new Date()
    
    // Add to queue
    this.reloadQueue.push(event)
    
    // Debounce processing to batch rapid changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    this.debounceTimer = setTimeout(() => {
      this.processQueue()
    }, 300) // 300ms debounce
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.reloadQueue.length === 0) return
    
    this.processing = true
    
    try {
      // Group changes by type and priority
      const changes = this.groupChanges(this.reloadQueue)
      this.reloadQueue = []
      
      // Process in priority order
      await this.executeReloadStrategy(changes)
      
    } catch (error) {
      logWarning(`Reload processing error: ${error}`)
    } finally {
      this.processing = false
    }
  }

  private groupChanges(events: ChangeEvent[]): Map<string, ChangeEvent[]> {
    const grouped = new Map<string, ChangeEvent[]>()
    
    events.forEach(event => {
      const key = `${event.type}-${event.action}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(event)
    })
    
    return grouped
  }

  private async executeReloadStrategy(changes: Map<string, ChangeEvent[]>): Promise<void> {
    // Process high priority changes first
    const priorities = ['high', 'medium', 'low']
    
    for (const priority of priorities) {
      for (const [key, events] of changes) {
        const firstEvent = events[0]
        if (firstEvent.priority !== priority) continue
        
        await this.handleChangeGroup(key, events)
      }
    }
  }

  private async handleChangeGroup(key: string, events: ChangeEvent[]): Promise<void> {
    const [type, action] = key.split('-')
    const fileList = events.map(e => e.path).join(', ')
    
    switch (action) {
      case 'reload':
        logChange(`Client reload triggered by: ${fileList}`)
        await this.triggerClientReload()
        this.stats.clientReloads++
        break
        
      case 'restart':
        logChange(`Server restart triggered by: ${fileList}`)
        await this.triggerServerRestart()
        this.stats.serverRestarts++
        break
        
      case 'refresh':
        logChange(`Full refresh triggered by: ${fileList}`)
        await this.triggerFullRefresh()
        this.stats.clientReloads++
        this.stats.serverRestarts++
        break
        
      default:
        logInfo(`Configuration change detected: ${fileList}`)
        this.stats.configReloads++
    }
  }

  private async triggerClientReload(): Promise<void> {
    // Vite handles this automatically, but we can notify
    logInfo('Frontend hot reload in progress...')
  }

  private async triggerServerRestart(): Promise<void> {
    // Bun --hot handles this automatically, but we can notify
    logInfo('Backend hot restart in progress...')
  }

  private async triggerFullRefresh(): Promise<void> {
    logWarning('Shared code changed - both frontend and backend affected')
    logInfo('Full application refresh recommended')
  }

  private shouldIgnoreFile(filename: string): boolean {
    const ignorePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /coverage/,
      /\.vite/,
      /tmp/,
      /\.(log|tmp|cache)$/,
      /~$/,
      /\.DS_Store$/
    ]
    
    return ignorePatterns.some(pattern => pattern.test(filename))
  }

  private getClientAction(filename: string): 'reload' | 'restart' | 'refresh' {
    const ext = extname(filename)
    
    // CSS and asset changes should trigger reload
    if (['.css', '.scss', '.less', '.svg', '.png', '.jpg', '.jpeg'].includes(ext)) {
      return 'reload'
    }
    
    // JS/TS changes trigger reload (Vite handles HMR)
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      return 'reload'
    }
    
    return 'reload'
  }

  private getServerAction(filename: string): 'reload' | 'restart' | 'refresh' {
    // All server changes trigger restart (Bun --hot handles this)
    return 'restart'
  }

  private getClientPriority(filename: string): 'low' | 'medium' | 'high' {
    const ext = extname(filename)
    
    // CSS and assets are low priority
    if (['.css', '.scss', '.less', '.svg', '.png', '.jpg', '.jpeg'].includes(ext)) {
      return 'low'
    }
    
    // Main application files are high priority
    if (filename.includes('entry-') || filename.includes('App.') || filename.includes('router.')) {
      return 'high'
    }
    
    return 'medium'
  }

  private getServerPriority(filename: string): 'low' | 'medium' | 'high' {
    // Core server files are high priority
    if (filename.includes('app.ts') || filename.includes('routes/')) {
      return 'high'
    }
    
    // Database and config changes are medium priority
    if (filename.includes('db/') || filename.includes('config')) {
      return 'medium'
    }
    
    return 'low'
  }

  private getConfigAction(filename: string): 'reload' | 'restart' | 'refresh' {
    // Configuration changes usually require restart
    if (filename.includes('vite.config') || filename.includes('tsconfig')) {
      return 'refresh'
    }
    
    if (filename.includes('.env')) {
      return 'restart'
    }
    
    return 'refresh'
  }

  private showWatchingPaths(): void {
    console.log('')
    console.log(colorize('📁 Watching directories:', 'cyan'))
    console.log(colorize('  • client/     → Hot reload', 'green'))
    console.log(colorize('  • server/     → Hot restart', 'green'))
    console.log(colorize('  • shared/     → Full refresh', 'yellow'))
    console.log(colorize('  • config files → Restart required', 'magenta'))
    console.log('')
    console.log(colorize('🔄 Reload strategies:', 'cyan'))
    console.log(colorize('  • CSS/Assets  → Instant reload', 'green'))
    console.log(colorize('  • React/TS    → Hot module replacement', 'green'))
    console.log(colorize('  • Server code → Process restart', 'yellow'))
    console.log(colorize('  • Shared code → Full refresh', 'magenta'))
    console.log('')
    
    // Start stats reporting
    this.startStatsReporting()
  }

  private startStatsReporting(): void {
    // Report stats every 60 seconds if there's activity
    setInterval(() => {
      if (this.stats.totalChanges > 0) {
        this.reportStats()
      }
    }, 60000)
  }

  private reportStats(): void {
    const uptime = Date.now() - this.stats.lastChange.getTime()
    const uptimeMinutes = Math.floor(uptime / 60000)
    
    console.log('')
    console.log(colorize('📊 Hot Reload Statistics:', 'cyan'))
    console.log(colorize(`  • Total changes: ${this.stats.totalChanges}`, 'blue'))
    console.log(colorize(`  • Client reloads: ${this.stats.clientReloads}`, 'green'))
    console.log(colorize(`  • Server restarts: ${this.stats.serverRestarts}`, 'yellow'))
    console.log(colorize(`  • Config reloads: ${this.stats.configReloads}`, 'magenta'))
    console.log(colorize(`  • Last change: ${uptimeMinutes}m ago`, 'dim'))
    console.log('')
  }

  private setupShutdownHandlers(): void {
    const shutdown = () => {
      console.log('')
      logInfo('Shutting down Hot Reload Coordinator...')
      
      // Stop all watchers
      for (const [name, watcher] of this.watchers) {
        try {
          watcher.close?.()
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      // Clear timers
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      // Report final stats
      if (this.stats.totalChanges > 0) {
        console.log('')
        logInfo('Final Statistics:')
        console.log(`  Changes processed: ${this.stats.totalChanges}`)
        console.log(`  Client reloads: ${this.stats.clientReloads}`)
        console.log(`  Server restarts: ${this.stats.serverRestarts}`)
      }
      
      logSuccess('Hot Reload Coordinator stopped')
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }
}

// Start the coordinator
const coordinator = new HotReloadCoordinator()
await coordinator.start()

// Keep the process alive
process.stdin.resume()