import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, Check, AlertTriangle } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { createApiKey, listApiKeys, revokeApiKey } from '#/lib/api-keys'

export const Route = createFileRoute('/dashboard/settings/api-keys')({
  component: ApiKeysPage,
})

interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string
  createdAt: Date | string
  lastUsedAt: Date | string | null
  expiresAt: Date | string | null
}

function ApiKeysPage() {
  const { data: session } = authClient.useSession()
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(true)

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Revoke state
  const [revoking, setRevoking] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)

  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) return
    listApiKeys({ data: { userId } }).then((result) => {
      setKeys(result as ApiKeyItem[])
      setLoading(false)
    })
  }, [userId])

  async function handleCreate() {
    if (!userId || !newKeyName.trim()) return
    setCreating(true)
    try {
      const result = await createApiKey({
        data: { userId, name: newKeyName.trim() },
      })
      setNewlyCreatedKey(result.key)
      setKeys((prev) => [
        ...prev,
        {
          id: result.id,
          name: result.name,
          keyPrefix: result.keyPrefix,
          createdAt: result.createdAt,
          lastUsedAt: null,
          expiresAt: null,
        },
      ])
      setNewKeyName('')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(keyId: string) {
    if (!userId) return
    setRevoking(keyId)
    try {
      await revokeApiKey({ data: { userId, keyId } })
      setKeys((prev) => prev.filter((k) => k.id !== keyId))
      setConfirmRevoke(null)
    } finally {
      setRevoking(null)
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDismissNewKey() {
    setNewlyCreatedKey(null)
    setShowCreate(false)
  }

  function formatDate(dateStr: Date | string | null) {
    if (!dateStr) return 'Never'
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* New key revealed banner */}
      {newlyCreatedKey && (
        <section className="rise-in rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Save your API key now. You won't be able to see it again.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-[var(--sea-ink)] dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
                  {newlyCreatedKey}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(newlyCreatedKey)}
                  className="shrink-0 rounded-lg border border-amber-300 bg-amber-100 p-2 text-amber-700 transition hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-800/50"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={handleDismissNewKey}
                className="mt-3 text-sm font-medium text-amber-700 underline transition hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
              >
                I've saved my key
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Create key section */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="island-kicker mb-1">API Keys</p>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Create keys to authenticate API requests.
            </p>
          </div>
          {!showCreate && !newlyCreatedKey && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)]"
            >
              <Plus className="h-4 w-4" />
              Create key
            </button>
          )}
        </div>

        {showCreate && !newlyCreatedKey && (
          <div className="mt-6 flex items-end gap-3">
            <div className="flex-1">
              <label
                htmlFor="key-name"
                className="mb-1.5 block text-sm font-medium text-[var(--sea-ink)]"
              >
                Key name
              </label>
              <input
                id="key-name"
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production, CI/CD"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)]/50 focus:border-[var(--lagoon)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newKeyName.trim()) handleCreate()
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--lagoon)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,184,178,0.35)] transition hover:-translate-y-0.5 hover:bg-[var(--lagoon-deep)] disabled:pointer-events-none disabled:opacity-60"
            >
              {creating ? 'Creating\u2026' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false)
                setNewKeyName('')
              }}
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Key list */}
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-10">
        {loading ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">Loading keys\u2026</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            No API keys yet. Create one to get started.
          </p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--sea-ink)]">
                    {k.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--sea-ink-soft)]">
                    <span className="font-mono">{k.keyPrefix}\u2026</span>
                    <span>Created {formatDate(k.createdAt)}</span>
                    <span>Last used {formatDate(k.lastUsedAt)}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {confirmRevoke === k.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Revoke?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevoke(k.id)}
                        disabled={revoking === k.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        {revoking === k.id ? 'Revoking\u2026' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRevoke(null)}
                        className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRevoke(k.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--sea-ink-soft)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-800/40 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
