import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Profile } from '../store/profileStore'
import { useProfileStore } from '../store/profileStore'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'


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
      setError('İsim gerekli')
      return
    }

    const profile: Profile = { displayName: trimmed }
    if (avatarUrl.trim().length > 0) profile.avatarUrl = avatarUrl.trim()

    setProfile(profile)
    onSave?.()
  }

  const initial = displayName?.charAt(0)?.toUpperCase() || ''

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={`${displayName} avatar`} /> : <AvatarFallback>{initial}</AvatarFallback>}
          </Avatar>
          <div>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>Kullanıcı adınızı girin ve isterseniz avatar URL ekleyin.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Görünen İsim</Label>
            <Input
              value={displayName}
              onChange={onNameChange}
              placeholder="Görünen isminiz"
              aria-invalid={!!error}
            />
            {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
          </div>

          <div>
            <Label>Avatar URL (isteğe bağlı)</Label>
            <Input value={avatarUrl} onChange={onAvatarChange} placeholder="https://..." />
          </div>

          <CardFooter>
            <div className="flex items-center gap-3 w-full">
              <Button type="submit">Kaydet</Button>
              <Button type="button" variant="outline" onClick={onClear}>
                Temizle
              </Button>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
