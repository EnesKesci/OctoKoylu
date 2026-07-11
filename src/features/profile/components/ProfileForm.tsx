import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useAuth } from '@/app/providers/AuthProvider'
import { getProfile, createProfile, updateProfile } from '@/features/profile/api/profileApi'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/shared/lib/getInitials'


type Props = {
  onSave?: () => void
}

export default function ProfileForm({ onSave }: Props) {
  const currentName = useProfileStore((s) => s.displayName)
  const setProfile = useProfileStore((s) => s.setProfile)
  const { user } = useAuth()

  const [displayName, setDisplayName] = useState(currentName)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const mountedRef = useRef(true)
  const isSubmittingRef = useRef(false)

  useEffect(() => {
    // keep local input in sync with store when store changes externally
    setDisplayName(currentName)
  }, [currentName])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setDisplayName(v)
    if (error && v.trim().length > 0) {
      setError(null)
    }
  }

  function onClear() {
    if (isSaving) return
    // Only clear local input and error — do not modify persisted or server profile
    setDisplayName('')
    setError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmittingRef.current) return

    const trimmed = displayName.trim()
    if (trimmed.length < 2) {
      setError('İsim en az 2 karakter olmalı.')
      return
    }
    if (trimmed.length > 40) {
      setError('İsim en fazla 40 karakter olabilir.')
      return
    }

    if (!user) {
      setError('Authenticated user is unavailable.')
      return
    }

    // Acquire submission lock and update UI state
    isSubmittingRef.current = true
    setIsSaving(true)
    setError(null)

    try {
      // Check if profile exists
      const existing = await getProfile(user.id)

      let savedProfile
      if (existing) {
        savedProfile = await updateProfile({ userId: user.id, displayName: trimmed })
      } else {
        savedProfile = await createProfile({ userId: user.id, displayName: trimmed })
      }

      if (!mountedRef.current) return

      // Update Zustand with server-authoritative displayName
      setProfile({ displayName: savedProfile.displayName })
      setDisplayName(savedProfile.displayName)

      onSave?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil kaydedilirken bilinmeyen bir hata oluştu.'
      if (!mountedRef.current) return
      setError(message)
    } finally {
      // Release submission lock regardless of mount state
      isSubmittingRef.current = false
      if (mountedRef.current) setIsSaving(false)
    }
  }

  const initials = getInitials(displayName)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>Kullanıcı adınızı girin.</CardDescription>
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

          <CardFooter>
            <div className="flex items-center gap-3 w-full">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button type="button" variant="outline" onClick={onClear} disabled={isSaving}>
                Temizle
              </Button>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
