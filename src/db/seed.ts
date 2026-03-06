#!/usr/bin/env tsx
/**
 * Seed script for the tool directory.
 * Run with:  pnpm db:seed:local   (local D1)
 *            pnpm db:seed:remote  (remote D1)
 *
 * Uses wrangler d1 execute under the hood; pass --remote flag via the npm script.
 * All inserts use INSERT OR IGNORE so the script is idempotent.
 */

import { execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DB_NAME = 'damascus-db'

const isRemote = process.argv.includes('--remote')
const wranglerFlags = isRemote ? ['--remote'] : ['--local']

const categories: {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  parentId: string | null
  sortOrder: number
}[] = [
  // Top-level categories
  { id: 'cat-ai-writing', name: 'AI Writing', slug: 'ai-writing', description: 'AI-powered writing and content creation tools', icon: '✍️', parentId: null, sortOrder: 10 },
  { id: 'cat-ai-image', name: 'AI Image', slug: 'ai-image', description: 'AI image generation and editing tools', icon: '🎨', parentId: null, sortOrder: 20 },
  { id: 'cat-ai-video', name: 'AI Video', slug: 'ai-video', description: 'AI video generation, editing, and processing tools', icon: '🎬', parentId: null, sortOrder: 30 },
  { id: 'cat-ai-audio', name: 'AI Audio', slug: 'ai-audio', description: 'AI audio generation, transcription, and voice tools', icon: '🎵', parentId: null, sortOrder: 40 },
  { id: 'cat-ai-coding', name: 'AI Coding', slug: 'ai-coding', description: 'AI-powered coding assistants and development tools', icon: '💻', parentId: null, sortOrder: 50 },
  { id: 'cat-ai-chat', name: 'AI Chat', slug: 'ai-chat', description: 'AI chatbots and conversational AI platforms', icon: '💬', parentId: null, sortOrder: 60 },
  { id: 'cat-ai-research', name: 'AI Research', slug: 'ai-research', description: 'AI-powered research, summarization, and knowledge tools', icon: '🔬', parentId: null, sortOrder: 70 },
  { id: 'cat-ai-design', name: 'AI Design', slug: 'ai-design', description: 'AI design and UI/UX tools', icon: '🖌️', parentId: null, sortOrder: 80 },
  { id: 'cat-productivity', name: 'Productivity', slug: 'productivity', description: 'Tools to enhance personal and team productivity', icon: '⚡', parentId: null, sortOrder: 90 },
  { id: 'cat-developer', name: 'Developer Tools', slug: 'developer-tools', description: 'Tools for software development and engineering', icon: '🛠️', parentId: null, sortOrder: 100 },
  { id: 'cat-marketing', name: 'Marketing', slug: 'marketing', description: 'AI marketing, SEO, and growth tools', icon: '📈', parentId: null, sortOrder: 110 },
  { id: 'cat-data', name: 'Data & Analytics', slug: 'data-analytics', description: 'Data analysis, visualization, and BI tools', icon: '📊', parentId: null, sortOrder: 120 },
  { id: 'cat-education', name: 'Education', slug: 'education', description: 'AI learning and educational tools', icon: '📚', parentId: null, sortOrder: 130 },
  { id: 'cat-business', name: 'Business', slug: 'business', description: 'AI tools for business operations and automation', icon: '💼', parentId: null, sortOrder: 140 },
  { id: 'cat-security', name: 'Security', slug: 'security', description: 'Cybersecurity and privacy tools', icon: '🔒', parentId: null, sortOrder: 150 },

  // Sub-categories: AI Writing
  { id: 'cat-copywriting', name: 'Copywriting', slug: 'copywriting', description: 'AI copywriting and ad copy tools', icon: '', parentId: 'cat-ai-writing', sortOrder: 1 },
  { id: 'cat-blog-writing', name: 'Blog & Articles', slug: 'blog-articles', description: 'AI blog post and article writing tools', icon: '', parentId: 'cat-ai-writing', sortOrder: 2 },
  { id: 'cat-grammar', name: 'Grammar & Editing', slug: 'grammar-editing', description: 'Grammar checking and text editing tools', icon: '', parentId: 'cat-ai-writing', sortOrder: 3 },
  { id: 'cat-translation', name: 'Translation', slug: 'translation', description: 'AI translation and localization tools', icon: '', parentId: 'cat-ai-writing', sortOrder: 4 },

  // Sub-categories: AI Image
  { id: 'cat-image-gen', name: 'Image Generation', slug: 'image-generation', description: 'Text-to-image generation tools', icon: '', parentId: 'cat-ai-image', sortOrder: 1 },
  { id: 'cat-image-edit', name: 'Image Editing', slug: 'image-editing', description: 'AI-powered image editing and enhancement', icon: '', parentId: 'cat-ai-image', sortOrder: 2 },
  { id: 'cat-bg-removal', name: 'Background Removal', slug: 'background-removal', description: 'AI background removal tools', icon: '', parentId: 'cat-ai-image', sortOrder: 3 },
  { id: 'cat-upscaling', name: 'Upscaling', slug: 'upscaling', description: 'AI image upscaling and super-resolution tools', icon: '', parentId: 'cat-ai-image', sortOrder: 4 },

  // Sub-categories: AI Video
  { id: 'cat-video-gen', name: 'Video Generation', slug: 'video-generation', description: 'Text-to-video generation tools', icon: '', parentId: 'cat-ai-video', sortOrder: 1 },
  { id: 'cat-video-edit', name: 'Video Editing', slug: 'video-editing', description: 'AI-powered video editing tools', icon: '', parentId: 'cat-ai-video', sortOrder: 2 },
  { id: 'cat-video-bg', name: 'Video Background Removal', slug: 'video-background-removal', description: 'AI video matting and background removal tools', icon: '', parentId: 'cat-ai-video', sortOrder: 3 },

  // Sub-categories: AI Coding
  { id: 'cat-code-assistant', name: 'Code Assistants', slug: 'code-assistants', description: 'AI coding assistants and pair programmers', icon: '', parentId: 'cat-ai-coding', sortOrder: 1 },
  { id: 'cat-code-review', name: 'Code Review', slug: 'code-review', description: 'AI-powered code review tools', icon: '', parentId: 'cat-ai-coding', sortOrder: 2 },
]

const tags: { id: string; name: string; slug: string }[] = [
  { id: 'tag-free', name: 'Free', slug: 'free' },
  { id: 'tag-open-source', name: 'Open Source', slug: 'open-source' },
  { id: 'tag-api', name: 'Has API', slug: 'has-api' },
  { id: 'tag-chrome-ext', name: 'Chrome Extension', slug: 'chrome-extension' },
  { id: 'tag-no-signup', name: 'No Signup', slug: 'no-signup' },
  { id: 'tag-mobile-app', name: 'Mobile App', slug: 'mobile-app' },
  { id: 'tag-desktop-app', name: 'Desktop App', slug: 'desktop-app' },
  { id: 'tag-self-hosted', name: 'Self-Hosted', slug: 'self-hosted' },
  { id: 'tag-freemium', name: 'Freemium', slug: 'freemium' },
  { id: 'tag-b2b', name: 'B2B', slug: 'b2b' },
  { id: 'tag-cli', name: 'CLI', slug: 'cli' },
  { id: 'tag-vscode-ext', name: 'VS Code Extension', slug: 'vscode-extension' },
  { id: 'tag-realtime', name: 'Real-time', slug: 'real-time' },
  { id: 'tag-privacy', name: 'Privacy-focused', slug: 'privacy-focused' },
  { id: 'tag-team', name: 'Team Collaboration', slug: 'team-collaboration' },
  { id: 'tag-webhook', name: 'Webhooks', slug: 'webhooks' },
  { id: 'tag-zapier', name: 'Zapier Integration', slug: 'zapier-integration' },
  { id: 'tag-enterprise', name: 'Enterprise', slug: 'enterprise' },
  { id: 'tag-local-ai', name: 'Local AI', slug: 'local-ai' },
  { id: 'tag-multimodal', name: 'Multimodal', slug: 'multimodal' },
]

function escape(str: string) {
  return str.replace(/'/g, "''")
}

function buildSQL() {
  const lines: string[] = []

  for (const c of categories) {
    lines.push(
      `INSERT OR IGNORE INTO category (id, name, slug, description, icon, parent_id, sort_order, created_at) VALUES ('${escape(c.id)}', '${escape(c.name)}', '${escape(c.slug)}', '${escape(c.description)}', '${escape(c.icon)}', ${c.parentId ? `'${escape(c.parentId)}'` : 'NULL'}, ${c.sortOrder}, ${Date.now()});`,
    )
  }

  for (const t of tags) {
    lines.push(
      `INSERT OR IGNORE INTO tag (id, name, slug, created_at) VALUES ('${escape(t.id)}', '${escape(t.name)}', '${escape(t.slug)}', ${Date.now()});`,
    )
  }

  return lines.join('\n')
}

const sql = buildSQL()
const tmpFile = join(tmpdir(), `seed-${Date.now()}.sql`)

console.log(`Seeding ${categories.length} categories and ${tags.length} tags...`)

try {
  writeFileSync(tmpFile, sql)
  execFileSync(
    'wrangler',
    ['d1', 'execute', DB_NAME, '--file', tmpFile, ...wranglerFlags],
    { stdio: 'inherit' },
  )
  console.log('Seed complete.')
} finally {
  unlinkSync(tmpFile)
}
