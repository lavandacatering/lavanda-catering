/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const openNextDir = path.join(__dirname, '../.open-next')
const assetsDir = path.join(openNextDir, 'assets')

console.log('⚡ Running Cloudflare Pages adaptation script...')

// 1. Copy worker.js to _worker.js
const workerSrc = path.join(openNextDir, 'worker.js')
const workerDest = path.join(openNextDir, '_worker.js')
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest)
  console.log('✅ Successfully copied worker.js to _worker.js')
} else {
  console.error('❌ Error: worker.js not found in .open-next/')
  process.exit(1)
}

// 2. Recursive copy function
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 3. Copy all files from assets/ to .open-next/ root
if (fs.existsSync(assetsDir)) {
  copyDirSync(assetsDir, openNextDir)
  console.log('✅ Successfully promoted assets/ to .open-next/ root')
} else {
  console.warn('⚠️ Warning: assets/ directory not found in .open-next/')
}

console.log('🎉 Cloudflare Pages adaptation complete!')
