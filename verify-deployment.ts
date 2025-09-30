#!/usr/bin/env bun
/**
 * Pre-deployment verification script
 * Checks that all required files exist before starting the server
 */

const REQUIRED_FILES = [
  'dist/public/index.html',
  'dist/server/entry-server.js',
  'server/app.ts',
  'database/portfolio.db',
]

const REQUIRED_DIRS = [
  'dist/public/assets',
  'dist/server',
]

console.log('🔍 Verifying deployment files...\n')

let allGood = true

// Check required files
for (const filePath of REQUIRED_FILES) {
  const file = Bun.file(filePath)
  const exists = await file.exists()
  const status = exists ? '✅' : '❌'
  console.log(`${status} ${filePath}`)

  if (!exists) {
    allGood = false
  } else if (filePath === 'dist/public/index.html') {
    // Check if index.html has asset references
    const content = await file.text()
    const hasAssets = content.includes('/assets/')
    const assetStatus = hasAssets ? '✅' : '⚠️'
    console.log(`   ${assetStatus} Contains asset references: ${hasAssets}`)
    if (!hasAssets) {
      console.log('   ⚠️  Warning: index.html may not load properly without asset references')
    }
  }
}

console.log('')

// Check required directories
for (const dirPath of REQUIRED_DIRS) {
  try {
    const glob = new Bun.Glob('*')
    const files = Array.from(glob.scanSync({ cwd: dirPath }))
    const exists = files.length > 0
    const status = exists ? '✅' : '❌'
    console.log(`${status} ${dirPath}/`)

    if (!exists) {
      allGood = false
    } else if (dirPath === 'dist/public/assets') {
      // Count files in assets directory
      const allFilesGlob = new Bun.Glob('**/*')
      const allFiles = Array.from(allFilesGlob.scanSync({ cwd: dirPath }))
      console.log(`   📦 ${allFiles.length} asset files found`)

      // Check for CSS and JS files
      const cssFiles = allFiles.filter(f => f.endsWith('.css'))
      const jsFiles = allFiles.filter(f => f.endsWith('.js'))
      console.log(`   📄 ${cssFiles.length} CSS files, ${jsFiles.length} JS files`)
    }
  } catch (e) {
    console.log(`❌ ${dirPath}/`)
    allGood = false
  }
}

console.log('')

// Environment checks
console.log('🔧 Environment Configuration:')
console.log(`   NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`)
console.log(`   PORT: ${process.env.PORT || '3001'}`)
console.log(`   PWD: ${process.cwd()}`)

console.log('')

if (!allGood) {
  console.error('❌ Deployment verification FAILED!')
  console.error('   Required files are missing. Build may have failed.')
  process.exit(1)
}

console.log('✅ Deployment verification PASSED!')
console.log('   All required files are present.')
console.log('')
