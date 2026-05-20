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
    `const nextResponse = await handler(reqOrResp, env, ctx, request.signal);
                    if (nextResponse && nextResponse.status === 500) {
                        let bodyText = "";
                        try {
                            bodyText = await nextResponse.clone().text();
                        } catch (e) {
                            bodyText = "[Failed to read response body: " + e.message + "]";
                        }
                        return new Response(bodyText + "\\n\\n--- DEBUG CAPTURED LOGS ---\\n" + globalThis.capturedLogs.join("\\n"), {
                            status: 500,
                            headers: nextResponse.headers
                        });
                    }
                    return nextResponse;
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

// 2. Patch require-hook.js to be edge-safe (root cause of 500 errors on Cloudflare Workers)
// Next.js's require-hook.js tries to access require('module').prototype.require which doesn't
// exist in Cloudflare Workers runtime, causing a fatal TypeError at worker initialization.
const requireHookPaths = [
  path.join(openNextDir, 'server-functions/default/node_modules/next/dist/server/require-hook.js'),
  path.join(__dirname, '../node_modules/next/dist/server/require-hook.js'),
]
const edgeSafeRequireHook = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Edge-safe no-op replacement for require-hook.js
// The original file uses require('module').prototype.require which is not available
// in Cloudflare Workers runtime. This no-op version exports the same interface.
const hookPropertyMap = new Map();
const defaultOverrides = {};
function addHookAliases(aliases = []) {
  for (const [key, value] of aliases) {
    hookPropertyMap.set(key, value);
  }
}
exports.addHookAliases = addHookAliases;
exports.defaultOverrides = defaultOverrides;
exports.hookPropertyMap = hookPropertyMap;
`

for (const requireHookPath of requireHookPaths) {
  if (fs.existsSync(requireHookPath)) {
    fs.writeFileSync(requireHookPath, edgeSafeRequireHook, 'utf8')
    console.log(`✅ Patched require-hook.js at ${requireHookPath} with edge-safe no-op version`)
  } else {
    console.warn(`⚠️ Warning: require-hook.js not found at ${requireHookPath}, skipping patch`)
  }
}

// Also patch setup-node-env.external.js which imports require-hook and may have its own issues
const setupNodeEnvPaths = [
  path.join(
    openNextDir,
    'server-functions/default/node_modules/next/dist/build/adapter/setup-node-env.external.js'
  ),
  path.join(__dirname, '../node_modules/next/dist/build/adapter/setup-node-env.external.js'),
]

for (const setupNodeEnvPath of setupNodeEnvPaths) {
  if (fs.existsSync(setupNodeEnvPath)) {
    let setupContent = fs.readFileSync(setupNodeEnvPath, 'utf8')
    // Wrap the entire content in a try-catch to prevent any Node.js-specific code from crashing
    if (!setupContent.includes('// EDGE-PATCHED')) {
      setupContent = `// EDGE-PATCHED: Wrapped in try-catch for Cloudflare Workers compatibility
try {
${setupContent}
} catch (e) {
  // Silently ignore Node.js-specific initialization errors in edge runtime
  if (typeof console !== 'undefined') {
    console.warn('[edge-patch] setup-node-env.external.js error suppressed:', e.message);
  }
}
`
      fs.writeFileSync(setupNodeEnvPath, setupContent, 'utf8')
      console.log(
        `✅ Patched setup-node-env.external.js at ${setupNodeEnvPath} with edge-safe try-catch wrapper`
      )
    }
  } else {
    console.warn(
      `⚠️ Warning: setup-node-env.external.js not found at ${setupNodeEnvPath}, skipping patch`
    )
  }
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
