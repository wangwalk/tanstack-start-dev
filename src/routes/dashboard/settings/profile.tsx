import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { updateUserName } from '#/lib/user'

const nameSchema = z.string().trim().min(1, 'Name is required')

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export const Route = createFileRoute('/dashboard/settings/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = nameSchema.safeParse(name)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    if (!session?.user?.id) return

    setStatus('loading')
    try {
      await updateUserName({ data: { userId: session.user.id, name: result.data } })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setError('Failed to update name. Please try again.')
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError(null)

    if (!ALLOWED_TYPES.has(file.type)) {
      setAvatarError('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }
    if (file.size > MAX_SIZE) {
      setAvatarError('File size must be 5 MB or less')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    void uploadAvatar(file)
  }

  async function uploadAvatar(file: File) {
    setAvatarStatus('loading')
    setAvatarError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? 'Upload failed')
      }

      setAvatarStatus('success')
      setTimeout(() => setAvatarStatus('idle'), 2000)
    } catch (err) {
      setAvatarStatus('error')
      setAvatarError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setAvatarPreview(null)
    }

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || 'U'
  const displayImage = avatarPreview ?? session?.user?.image

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Avatar</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarStatus === 'loading'}
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.15)] text-lg font-semibold text-[var(--lagoon-deep)] transition hover:opacity-80 disabled:pointer-events-none"
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              userInitial
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              </svg>
            </span>
            {avatarStatus === 'loading' && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-1">
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Click to upload a new avatar. JPEG, PNG, GIF, or WebP up to 5 MB.
            </p>
            {avatarStatus === 'success' && (
              <p className="text-sm text-green-600 dark:text-green-400">Avatar updated</p>
            )}
          </div>
        </div>
        {avatarError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {avatarError}
          </div>
        )}
      </section>

      {/* Profile form */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <p className="island-kicker mb-4">Profile</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={session?.user?.email ?? ''}
              disabled
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] opacity-60"
            />
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Email cannot be changed
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-400">
              Name updated successfully
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
            >
              {status === 'loading' ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
