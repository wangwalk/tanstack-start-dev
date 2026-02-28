import { createFileRoute } from '@tanstack/react-router'
import { getAvatar } from '#/lib/r2'

async function handleGetAvatar({ request }: { request: Request }) {
  const url = new URL(request.url)
  // Path: /api/avatar/{userId}
  const segments = url.pathname.split('/')
  const userId = segments[segments.length - 1]

  if (!userId) {
    return new Response('Not found', { status: 404 })
  }

  const object = await getAvatar(userId)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType ?? 'application/octet-stream',
  )
  headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')
  headers.set('ETag', object.httpEtag)

  return new Response(object.body, { headers })
}

export const Route = createFileRoute('/api/avatar/$')({
  server: {
    handlers: {
      GET: handleGetAvatar,
    },
  },
})
