import { createFileRoute } from '@tanstack/react-router'
import { allBlogs } from 'content-collections'
import { SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const posts = Array.from(
          new Map(
            [...allBlogs]
              .sort(
                (a, b) =>
                  new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf(),
              )
              .map((post) => [post.slug, post]),
          ).values(),
        )

        const staticPages = ['', '/about', '/blog']

        const urls = [
          ...staticPages.map(
            (path) =>
              `<url><loc>${SITE_URL}${path}</loc><changefreq>weekly</changefreq></url>`,
          ),
          ...posts.map(
            (post) =>
              `<url><loc>${SITE_URL}/blog/${post.slug}</loc><lastmod>${new Date(post.pubDate).toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq></url>`,
          ),
        ].join('')

        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        })
      },
    },
  },
})
