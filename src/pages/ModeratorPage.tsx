import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { getRoomByCode, getRoomPlayers } from '@/features/rooms/api/roomApi'
import type { Room, Player } from '@/features/rooms/api/roomApi'
import { supabase } from '@/shared/lib/supabase'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ModeratorPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!roomCode) {
        if (mounted) {
          setError('Oda kodu eksik.')
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const r = await getRoomByCode(roomCode)
        if (!mounted) return

        if (!r) {
          setRoom(null)
          setPlayers([])
          setError(null)
          setIsLoading(false)
          return
        }

        setRoom(r)

        const ps = await getRoomPlayers(r.id)
        if (!mounted) return

        setPlayers(ps)
        setIsLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Oda yüklenirken bilinmeyen bir hata oluştu.'
        if (!mounted) return
        setError(message)
        setIsLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [roomCode])

  // Realtime subscription for room_players of this room
  useEffect(() => {
    if (!room) return

    let mounted = true
    const isRefetchingRef = { current: false }

    const channel = supabase
      .channel(`room_players:${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${room.id}` },
        async () => {
          if (!mounted) return
          if (isRefetchingRef.current) return
          isRefetchingRef.current = true
          try {
            const ps = await getRoomPlayers(room.id)
            if (!mounted) return
            setPlayers(ps)
          } catch {
            // keep existing players on realtime failure
          } finally {
            isRefetchingRef.current = false
          }
        },
      )
      .subscribe()

    return () => {
      mounted = false
      void supabase.removeChannel(channel)
    }
  }, [room])

  if (isLoading) {
    return <p className="p-4">Oda yükleniyor...</p>
  }

  if (error) {
    return <p className="p-4 text-rose-400">{error}</p>
  }

  if (!room) {
    return <p className="p-4">Oda bulunamadı.</p>
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>Kod: {room.roomCode}</CardDescription>
            </div>
            <div className="ml-4 px-2 py-1 rounded bg-slate-800 text-sm">{players.length} oyuncu</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players.map((p) => {
              const isModerator = room?.moderatorId != null && p.userId === room.moderatorId
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{(p.displayName ?? '–').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{p.displayName ?? 'Bilinmeyen'}</div>
                    <div className="text-xs text-slate-400">{p.joinedAt ?? ''}</div>
                  </div>
                  {isModerator ? (
                    <div className="text-sm text-indigo-300 font-medium">Moderatör</div>
                  ) : (
                    <div className="text-sm text-slate-300">{p.isReady ? 'Hazır' : 'Bekliyor'}</div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
