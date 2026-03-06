import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import contentCollections from '@content-collections/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

// Bare-name Node.js built-in modules (without the node: prefix).
const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'crypto',
  'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https',
  'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process',
  'punycode', 'querystring', 'readline', 'repl', 'stream',
  'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url', 'util',
  'v8', 'vm', 'worker_threads', 'zlib',
])

// cloudflare:* modules only exist in the Workers runtime. During dev, the
// client environment's vite:import-analysis walks server-only code (e.g.
// src/db/index.ts) before TanStack Start strips it. @cloudflare/vite-plugin
// only resolves these for the SSR environment, so this plugin covers the
// client environment to prevent resolution failures.
const externalizeCloudflare = {
  name: 'externalize-cloudflare',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (id.startsWith('cloudflare:')) {
      return { id, external: true }
    }
  },
}

const config = defineConfig({
  plugins: [
    externalizeCloudflare,
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    contentCollections(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: './src/server.ts' },
    }),
    viteReact(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'cookie', 'baseLocale'],
      isServer: 'import.meta.env.SSR',
      disableAsyncLocalStorage: true,
      emitTsDeclarations: true,
    }),
  ],
  build: {
    rollupOptions: {
      // During the client build, Rollup walks the full import graph before
      // TanStack Start strips server-only code. Node.js built-ins referenced
      // by server packages must be externalized for the client bundle.
      // (cloudflare:* is already handled by the externalizeCloudflare plugin.)
      external: (id) => {
        if (id.startsWith('node:')) return true
        return NODE_BUILTINS.has(id)
      },
    },
  },
})

export default config
