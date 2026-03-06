import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import contentCollections from '@content-collections/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// Bare-name Node.js built-in modules (without the node: prefix).
// The node: prefix is handled separately via id.startsWith('node:').
const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'crypto',
  'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https',
  'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process',
  'punycode', 'querystring', 'readline', 'repl', 'stream',
  'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url', 'util',
  'v8', 'vm', 'worker_threads', 'zlib',
])

const config = defineConfig({
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    contentCollections(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  build: {
    rollupOptions: {
      // During the client build, Rollup walks the full static import graph before
      // TanStack Start's server-function transform strips server-only code.
      // This means server-only packages and Cloudflare Workers runtime modules
      // end up in the module graph even though they'll be tree-shaken from the
      // final client bundle.
      //
      // Marking them as external prevents Rollup from failing on unresolved imports
      // during graph analysis. These modules are safe to externalize because:
      //   • cloudflare:* — provided by the Workers runtime (never runs in browser)
      //   • node:* / Node.js built-ins — tree-shaken from client, or provided by
      //     nodejs_compat in the Workers bundle
      external: (id) => {
        if (id.startsWith('cloudflare:') || id.startsWith('node:')) return true
        return NODE_BUILTINS.has(id)
      },
    },
  },
})

export default config
