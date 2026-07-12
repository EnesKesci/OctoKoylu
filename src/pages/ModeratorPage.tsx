import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { getRoomByCode, getRoomPlayers, kickPlayer } from '@/features/rooms/api/roomApi'
import type { Room, Player } from '@/features/rooms/api/roomApi'
import { supabase } from '@/shared/lib/supabase'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ModeratorPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [kickingPlayerIds, setKickingPlayerIds] = useState<string[]>([])
  const mountedRef = useRef(true)

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
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const nonModeratorPlayers = room ? players.filter((player) => player.userId !== room.moderatorId) : []
  const readyCount = nonModeratorPlayers.filter((player) => player.isReady).length
  const totalReadyPlayers = nonModeratorPlayers.length
  const canDistributeRoles = totalReadyPlayers > 0 && readyCount === totalReadyPlayers

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
          <div className="mb-4 rounded border border-slate-700 bg-slate-950 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Toplam kişi</p>
                <p className="text-lg font-semibold text-white">{players.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Hazır</p>
                <p className="text-lg font-semibold text-white">
                  {readyCount} / {totalReadyPlayers}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Durum</p>
                <p className="text-lg font-semibold capitalize text-white">{room.status}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button type="button" disabled={!canDistributeRoles} onClick={() => console.log('Role assignment coming soon')}>
                Rolleri Dağıt
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {players.map((p) => {
              const isModerator = room?.moderatorId != null && p.userId === room.moderatorId
              const playerId = p.userId
              const isKicking = playerId ? kickingPlayerIds.includes(playerId) : false

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
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-slate-300">{p.isReady ? 'Hazır' : 'Bekliyor'}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isKicking}
                        onClick={async () => {
                          if (!playerId) {
                            setError('Oyuncunun kullanıcı kimliği bulunamadı.')
                            return
                          }
                          if (isKicking) return
                          setError(null)
                          setKickingPlayerIds((ids) => (ids.includes(playerId) ? ids : [...ids, playerId]))
                          try {
                            if (!room) return
                            await kickPlayer({ roomId: room.id, playerUserId: playerId })
                          } catch (err) {
                            if (!mountedRef.current) return
                            const message = err instanceof Error ? err.message : 'Oyuncu atılırken bilinmeyen bir hata oluştu.'
                            setError(message)
                          } finally {
                            if (!mountedRef.current) return
                            setKickingPlayerIds((ids) => ids.filter((id) => id !== playerId))
                          }
                        }}
                      >
                        {isKicking ? 'Atılıyor...' : 'Odadan At'}
                      </Button>
                    </div>
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
