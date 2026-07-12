import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { joinRoom } from '@/features/rooms/api/roomApi'
import { useAuth } from '@/app/providers/AuthProvider'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function JoinRoomPage() {
  const [code, setCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const isSubmittingRef = useRef(false)
  const mountedRef = useRef(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  function onCodeChange(e: ChangeEvent<HTMLInputElement>) {
    // allow only up to 6 chars and uppercase
    const v = e.target.value.toUpperCase().slice(0, 6)
    setCode(v)
    if (error && v.trim().length > 0) setError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmittingRef.current) return

    const trimmed = code.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(trimmed)) {
      setError('Geçersiz oda kodu. Kod 6 karakter olmalı ve yalnızca A-Z ve 0-9 içerebilir.')
      return
    }

    if (!user?.id) {
      setError('Authenticated user is unavailable.')
      return
    }

    // lock
    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const room = await joinRoom({ roomCode: trimmed, userId: user.id })
      if (!mountedRef.current) return
      navigate(`/rooms/${room.roomCode}/lobby`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Odaya katılırken bilinmeyen bir hata oluştu.'
      if (!mountedRef.current) return
      setError(message)
    } finally {
      isSubmittingRef.current = false
      if (mountedRef.current) setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Odaya Katıl</CardTitle>
            <CardDescription>6 haneli oda kodunu girin.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Oda Kodu</Label>
              <Input value={code} onChange={onCodeChange} placeholder="XXXXXX" aria-invalid={!!error} />
              {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
            </div>

            <CardFooter>
              <div className="flex items-center gap-3 w-full">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Katılıyor...' : 'Odaya Katıl'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { if (isSubmittingRef.current) return; setCode(''); setError(null) }} disabled={isLoading}>
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
