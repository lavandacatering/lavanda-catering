/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const openNextDir = path.join(__dirname, '../.open-next')
const assetsDir = path.join(openNextDir, 'assets')

console.log('⚡ Running Cloudflare Pages adaptation script...')

// 1. Copy worker.js to _worker.js with injected try-catch debugging
const workerSrc = path.join(openNextDir, 'worker.js')
const workerDest = path.join(openNextDir, '_worker.js')
if (fs.existsSync(workerSrc)) {
  let workerContent = fs.readFileSync(workerSrc, 'utf8')

  // Inject try-catch wrappers around the main fetch handler to catch startup and execution errors
  workerContent = workerContent.replace(
    'async fetch(request, env, ctx) {',
    'async fetch(request, env, ctx) {\n        try {'
  )

  workerContent = workerContent.replace(
    'return runWithCloudflareRequestContext(request, env, ctx, async () => {',
    'return await runWithCloudflareRequestContext(request, env, ctx, async () => {\n                try {'
  )

  workerContent = workerContent.replace(
    'return handler(reqOrResp, env, ctx, request.signal);\n        });\n    },',
    'return await handler(reqOrResp, env, ctx, request.signal);\n                } catch (innerError) {\n                    return new Response("INNER ERROR: " + (innerError instanceof Error ? innerError.message + "\\nStack: " + innerError.stack : String(innerError)), { status: 500, headers: { "content-type": "text/plain" } });\n                }\n            });\n        } catch (outerError) {\n            return new Response("OUTER ERROR: " + (outerError instanceof Error ? outerError.message + "\\nStack: " + outerError.stack : String(outerError)), { status: 500, headers: { "content-type": "text/plain" } });\n        }\n    },'
  )

  fs.writeFileSync(workerDest, workerContent, 'utf8')
  console.log(
    '✅ Successfully copied and modified worker.js to _worker.js with try-catch reporting'
  )
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
