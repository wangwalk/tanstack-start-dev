import { env } from 'cloudflare:workers'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function getAvatarBucket(): R2Bucket {
  return (env as Record<string, unknown>).AVATAR_BUCKET as R2Bucket
}

export function validateAvatarFile(
  contentType: string | null,
  size: number,
): string | null {
  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed'
  }
  if (size > MAX_SIZE) {
    return 'File size must be 5 MB or less'
  }
  return null
}

function avatarKey(userId: string): string {
  return `users/${userId}/avatar`
}

export async function uploadAvatar(
  userId: string,
  body: ArrayBuffer | ReadableStream,
  contentType: string,
): Promise<string> {
  const bucket = getAvatarBucket()
  await bucket.put(avatarKey(userId), body, {
    httpMetadata: { contentType },
  })
  return `/api/avatar/${userId}`
}

export async function getAvatar(
  userId: string,
): Promise<R2ObjectBody | null> {
  const bucket = getAvatarBucket()
  return bucket.get(avatarKey(userId))
}

export async function deleteAvatar(userId: string): Promise<void> {
  const bucket = getAvatarBucket()
  await bucket.delete(avatarKey(userId))
}
