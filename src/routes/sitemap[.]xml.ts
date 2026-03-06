import { createFileRoute } from '@tanstack/react-router'
import { allBlogs } from 'content-collections'
import { SITE_URL } from '#/lib/site'
import {
  getAllApprovedToolsForSitemap,
  getAllCategoriesForSitemap,
  getAllTagsForSitemap,
} from '#/lib/public'

type UrlEntry = {
  loc: string
  lastmod?: string
  changefreq: string
  priority: string
}

function toXml(entries: UrlEntry[]): string {
  const urls = entries
    .map(({ loc, lastmod, changefreq, priority }) => {
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
      return `<url><loc>${loc}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const [tools, categories, tags] = await Promise.all([
          getAllApprovedToolsForSitemap(),
          getAllCategoriesForSitemap(),
          getAllTagsForSitemap(),
        ])

        const blogs = Array.from(
          new Map(
            [...allBlogs]
              .sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf())
              .map((post) => [post.slug, post]),
          ).values(),
        )

        const entries: UrlEntry[] = [
          // Static pages
          { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
          { loc: `${SITE_URL}/tools`, changefreq: 'daily', priority: '0.9' },
          { loc: `${SITE_URL}/tools/search`, changefreq: 'weekly', priority: '0.6' },
          { loc: `${SITE_URL}/tools/submit`, changefreq: 'monthly', priority: '0.5' },
          { loc: `${SITE_URL}/listing-pricing`, changefreq: 'monthly', priority: '0.7' },
          { loc: `${SITE_URL}/pricing`, changefreq: 'monthly', priority: '0.6' },
          { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.5' },
          { loc: `${SITE_URL}/blog`, changefreq: 'weekly', priority: '0.7' },
          { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.4' },
          // Categories
          ...categories.map((c) => ({
            loc: `${SITE_URL}/tools/category/${c.slug}`,
            changefreq: 'daily',
            priority: '0.8',
          })),
          // Tags
          ...tags.map((t) => ({
            loc: `${SITE_URL}/tools/tag/${t.slug}`,
            changefreq: 'weekly',
            priority: '0.6',
          })),
          // Tools
          ...tools.map((t) => ({
            loc: `${SITE_URL}/tools/${t.slug}`,
            lastmod: t.updatedAt instanceof Date
              ? t.updatedAt.toISOString().split('T')[0]
              : new Date(t.updatedAt).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7',
          })),
          // Blog posts
          ...blogs.map((post) => ({
            loc: `${SITE_URL}/blog/${post.slug}`,
            lastmod: new Date(post.pubDate).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6',
          })),
        ]

        return new Response(toXml(entries), {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        })
      },
    },
  },
})
