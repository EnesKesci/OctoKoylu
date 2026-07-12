import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { createRoom } from '@/features/rooms/api/roomApi'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CreateRoomPage() {
  const [name, setName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const isSubmittingRef = useRef(false)
  const mountedRef = useRef(true)
  const navigate = useNavigate()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setName(v)
    if (error && v.trim().length > 0) {
      setError(null)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmittingRef.current) return

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Oda ismi en az 2 karakter olmalı.')
      return
    }
    if (trimmed.length > 60) {
      setError('Oda ismi en fazla 60 karakter olabilir.')
      return
    }

    // Acquire lock and update UI
    isSubmittingRef.current = true
    setIsSaving(true)
    setError(null)

    try {
      const room = await createRoom({ name: trimmed })

      if (!mountedRef.current) return

      navigate(`/rooms/${room.roomCode}/moderator`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Oda oluşturulurken bilinmeyen bir hata oluştu.'
      if (!mountedRef.current) return
      setError(message)
    } finally {
      // Release lock regardless of mount state
      isSubmittingRef.current = false
      if (mountedRef.current) setIsSaving(false)
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div>
              <CardTitle>Oda Oluştur</CardTitle>
              <CardDescription>Yeni bir oyun odası oluşturun.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Oda İsmi</Label>
              <Input
                value={name}
                onChange={onNameChange}
                placeholder="Oda ismi"
                aria-invalid={!!error}
              />
              {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
            </div>

            <CardFooter>
              <div className="flex items-center gap-3 w-full">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isSubmittingRef.current) return
                    setName('')
                    setError(null)
                  }}
                  disabled={isSaving}
                >
                  Temizle
                </Button>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
