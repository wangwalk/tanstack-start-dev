import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { auth } from '#/lib/auth'
import { db } from '#/db/index'
import { user } from '#/db/schema'
import { uploadAvatar, validateAvatarFile } from '#/lib/r2'

async function handleAvatarUpload({ request }: { request: Request }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json(
      { error: 'Expected multipart/form-data' },
      { status: 400 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const validationError = validateAvatarFile(file.type, file.size)
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 })
  }

  const userId = session.user.id
  const avatarUrl = await uploadAvatar(
    userId,
    await file.arrayBuffer(),
    file.type,
  )

  await db
    .update(user)
    .set({ image: avatarUrl, updatedAt: new Date() })
    .where(eq(user.id, userId))

  return Response.json({ url: avatarUrl })
}

export const Route = createFileRoute('/api/avatar/upload')({
  server: {
    handlers: {
      POST: handleAvatarUpload,
    },
  },
})
