import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Profile } from '../store/profileStore'
import { useProfileStore } from '../store/profileStore'

type Props = {
  onSave?: () => void
}

export default function ProfileForm({ onSave }: Props) {
  const currentName = useProfileStore((s) => s.displayName)
  const currentAvatar = useProfileStore((s) => s.avatarUrl)
  const setProfile = useProfileStore((s) => s.setProfile)
  const clearProfile = useProfileStore((s) => s.clearProfile)

  const [displayName, setDisplayName] = useState(currentName)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar ?? '')
  const [error, setError] = useState<string | null>(null)

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setDisplayName(v)
    if (error && v.trim().length > 0) {
      setError(null)
    }
  }

  function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    setAvatarUrl(e.target.value)
  }

  function onClear() {
    clearProfile()
    setDisplayName('')
    setAvatarUrl('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = displayName.trim()
    if (trimmed.length === 0) {
      setError('Display name is required')
      return
    }

    const profile: Profile = { displayName: trimmed }
    if (avatarUrl.trim().length > 0) profile.avatarUrl = avatarUrl.trim()

    setProfile(profile)
    onSave?.()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200">Display name</label>
        <input
          value={displayName}
          onChange={onNameChange}
          className="mt-1 block w-full rounded-md bg-slate-800 text-slate-100 border border-slate-700 px-3 py-2"
          placeholder="Your display name"
          aria-invalid={!!error}
        />
        {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200">Avatar URL (optional)</label>
        <input
          value={avatarUrl}
          onChange={onAvatarChange}
          className="mt-1 block w-full rounded-md bg-slate-800 text-slate-100 border border-slate-700 px-3 py-2"
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center px-3 py-2 rounded-md bg-slate-700 text-slate-100 text-sm"
        >
          Clear
        </button>
      </div>
    </form>
  )
}
