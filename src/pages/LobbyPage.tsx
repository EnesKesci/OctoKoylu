import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getRoomByCode, getRoomPlayers, leaveRoom, updateReadyStatus } from '@/features/rooms/api/roomApi'
import type { Room, Player } from '@/features/rooms/api/roomApi'
import { useAuth } from '@/app/providers/AuthProvider'
import { supabase } from '@/shared/lib/supabase'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/shared/lib/getInitials'

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [isLeaving, setIsLeaving] = useState<boolean>(false)
  const [isReadyUpdating, setIsReadyUpdating] = useState<boolean>(false)
  const isLeavingRef = useRef(false)
  const isReadyUpdatingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

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

  const isModerator = room?.moderatorId != null && user?.id === room.moderatorId
  const currentPlayer = user?.id ? players.find((player) => player.userId === user.id) : undefined

  async function onLeaveRoom() {
    if (isLeavingRef.current || isModerator) return
    if (!user?.id) {
      setError('Authenticated user is unavailable.')
      return
    }
    if (!room) return

    isLeavingRef.current = true
    setIsLeaving(true)
    setError(null)

    try {
      await leaveRoom({ roomId: room.id, userId: user.id })
      if (!mountedRef.current) return
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Odadan ayrılırken bilinmeyen bir hata oluştu.'
      if (!mountedRef.current) return
      setError(message)
    } finally {
      isLeavingRef.current = false
      if (mountedRef.current) setIsLeaving(false)
    }
  }

  async function onToggleReadyStatus() {
    if (isReadyUpdatingRef.current || !room || !user?.id || !currentPlayer) return

    isReadyUpdatingRef.current = true
    setIsReadyUpdating(true)
    setError(null)

    try {
      await updateReadyStatus({
        roomId: room.id,
        userId: user.id,
        isReady: !currentPlayer.isReady,
      })
    } catch (err) {
      if (!mountedRef.current) return
      const message = err instanceof Error ? err.message : 'Hazır durumu güncellenirken bilinmeyen bir hata oluştu.'
      setError(message)
    } finally {
      if (!mountedRef.current) return
      isReadyUpdatingRef.current = false
      setIsReadyUpdating(false)
    }
  }

  useEffect(() => {
    if (isLoading || !room || !user?.id || isModerator) {
      return
    }

    const isCurrentUserInRoom = players.some((player) => player.userId === user.id)
    if (!isCurrentUserInRoom) {
      navigate('/', { replace: true })
    }
  }, [isLoading, room, user?.id, isModerator, players, navigate])

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
              const isModeratorPlayer = room?.moderatorId != null && p.userId === room.moderatorId
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(p.displayName ?? '')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{p.displayName ?? 'Bilinmeyen'}</div>
                    <div className="text-xs text-slate-400">{p.joinedAt ?? ''}</div>
                  </div>
                  {isModeratorPlayer ? (
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
      {room && user?.id && !isModerator ? (
        <div className="p-4 space-y-3">
          {currentPlayer ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onToggleReadyStatus}
              disabled={isReadyUpdating}
            >
              {isReadyUpdating ? 'Kaydediliyor...' : currentPlayer.isReady ? 'Bekle' : 'Hazır'}
            </Button>
          ) : null}
          <Button type="button" variant="destructive" onClick={onLeaveRoom} disabled={isLeaving}>
            {isLeaving ? 'Ayrılıyor...' : 'Odadan Ayrıl'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
