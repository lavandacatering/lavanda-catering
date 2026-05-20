/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const openNextDir = path.join(__dirname, '../.open-next')
const assetsDir = path.join(openNextDir, 'assets')

console.log('⚡ Running Cloudflare Pages adaptation script...')

// 1. Copy worker.js to _worker.js with injected try-catch and console capture debugging
const workerSrc = path.join(openNextDir, 'worker.js')
const workerDest = path.join(openNextDir, '_worker.js')
if (fs.existsSync(workerSrc)) {
  let workerContent = fs.readFileSync(workerSrc, 'utf8')

  // Inject console logging capture at the very top of the worker
  const consoleOverride = `
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

globalThis.capturedLogs = [];

console.error = function(...args) {
    globalThis.capturedLogs.push("[ERROR] " + args.map(arg => arg instanceof Error ? arg.message + "\\n" + arg.stack : (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(" "));
    originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
    globalThis.capturedLogs.push("[WARN] " + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(" "));
    originalConsoleWarn.apply(console, args);
};

console.log = function(...args) {
    globalThis.capturedLogs.push("[LOG] " + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(" "));
    originalConsoleLog.apply(console, args);
};
`

  workerContent = consoleOverride + workerContent

  // Inject try-catch wrappers around the main fetch handler to catch startup and execution errors
  workerContent = workerContent.replace(
    'async fetch(request, env, ctx) {',
    'async fetch(request, env, ctx) {\n        globalThis.capturedLogs = [];\n        try {'
  )

  workerContent = workerContent.replace(
    'return runWithCloudflareRequestContext(request, env, ctx, async () => {',
    'return await runWithCloudflareRequestContext(request, env, ctx, async () => {\n                try {'
  )

  workerContent = workerContent.replace(
    'return handler(reqOrResp, env, ctx, request.signal);\n        });\n    },',
    `const response = await handler(reqOrResp, env, ctx, request.signal);
                    if (response && response.status === 500) {
                        let bodyText = "";
                        try {
                            bodyText = await response.clone().text();
                        } catch (e) {
                            bodyText = "[Failed to read response body: " + e.message + "]";
                        }
                        return new Response(bodyText + "\\n\\n--- DEBUG CAPTURED LOGS ---\\n" + globalThis.capturedLogs.join("\\n"), {
                            status: 500,
                            headers: response.headers
                        });
                    }
                    return response;
                } catch (innerError) {
                    return new Response("INNER ERROR: " + (innerError instanceof Error ? innerError.message + "\\nStack: " + innerError.stack : String(innerError)) + "\\n\\n--- DEBUG CAPTURED LOGS ---\\n" + globalThis.capturedLogs.join("\\n"), { status: 500, headers: { "content-type": "text/plain" } });
                }
            });
        } catch (outerError) {
            return new Response("OUTER ERROR: " + (outerError instanceof Error ? outerError.message + "\\nStack: " + outerError.stack : String(outerError)) + "\\n\\n--- DEBUG CAPTURED LOGS ---\\n" + globalThis.capturedLogs.join("\\n"), { status: 500, headers: { "content-type": "text/plain" } });
        }
    },`
  )

  // Also catch and debug 500 errors returned directly from the middleware handler
  workerContent = workerContent.replace(
    'const reqOrResp = await middlewareHandler(request, env, ctx);\n            if (reqOrResp instanceof Response) {\n                return reqOrResp;\n            }',
    `const reqOrResp = await middlewareHandler(request, env, ctx);
            if (reqOrResp instanceof Response) {
                if (reqOrResp.status === 500) {
                    let bodyText = "";
                    try {
                        bodyText = await reqOrResp.clone().text();
                    } catch (e) {
                        bodyText = "[Failed to read middleware response body: " + e.message + "]";
                    }
                    return new Response(bodyText + "\\n\\n--- DEBUG CAPTURED LOGS ---\\n" + globalThis.capturedLogs.join("\\n"), {
                        status: 500,
                        headers: reqOrResp.headers
                    });
                }
                return reqOrResp;
            }`
  )

  fs.writeFileSync(workerDest, workerContent, 'utf8')
  console.log(
    '✅ Successfully copied and modified worker.js to _worker.js with try-catch & log capture reporting'
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
