import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { getRoomByCode, getRoomPlayers, kickPlayer, updateRoomStatus } from '@/features/rooms/api/roomApi'
import type { Room, Player } from '@/features/rooms/api/roomApi'
import { RoleConfigurationPanel } from '@/features/roles/components/RoleConfigurationPanel'
import { RoleAssignmentPreview } from '@/features/roles/components/RoleAssignmentPreview'
import { createRoleAssignments } from '@/features/roles'
import type { RoleAssignment, RoleTemplateItem } from '@/features/roles'
import { supabase } from '@/shared/lib/supabase'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ROOM_STATUS_LABELS } from '@/features/rooms/status'
import { formatTime } from '@/shared/lib/fotmatTime'

interface DevelopmentPlayer {
  id: string
  displayName: string
}

const DEVELOPMENT_TARGETS = [6, 8, 10, 14] as const

export default function ModeratorPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [kickingPlayerIds, setKickingPlayerIds] = useState<string[]>([])
  const [showRolePanel, setShowRolePanel] = useState<boolean>(false)
  const [developmentPlayers, setDevelopmentPlayers] = useState<DevelopmentPlayer[]>([])
  const [previewAssignments, setPreviewAssignments] = useState<RoleAssignment[] | null>(null)
  const [previewRoles, setPreviewRoles] = useState<RoleTemplateItem[] | null>(null)
  const [previewActionError, setPreviewActionError] = useState<string | null>(null)
  const [isStartingAssignment, setIsStartingAssignment] = useState(false)
  const [showEndRoomConfirmation, setShowEndRoomConfirmation] = useState(false)
  const [isEndingRoom, setIsEndingRoom] = useState(false)
  const [endRoomError, setEndRoomError] = useState<string | null>(null)
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

  const nonModeratorPlayers = room ? players.filter((player) => player.userId !== room.moderatorId) : []
  const realReadyCount = nonModeratorPlayers.filter((player) => player.isReady).length
  const realPlayerCount = nonModeratorPlayers.length

  const totalAssignmentPlayersCount = realPlayerCount + developmentPlayers.length
  const totalReadyCount = realReadyCount + developmentPlayers.length
  const canDistributeRoles = room?.status === 'lobby' && totalAssignmentPlayersCount >= 6 && totalAssignmentPlayersCount <= 14 && totalReadyCount === totalAssignmentPlayersCount

  const realAssignmentPlayers = nonModeratorPlayers.map((player) => ({
    id: player.userId ?? player.id,
    displayName: player.displayName ?? 'Bilinmeyen',
  }))

  const realAssignmentPlayerKey = realAssignmentPlayers
    .map((player) => player.id)
    .sort()
    .join('|')

  const assignmentPlayers = [
    ...realAssignmentPlayers,
    ...developmentPlayers,
  ]

  // Clear preview when real players change
  useEffect(() => {
    setPreviewAssignments(null)
    setPreviewRoles(null)
    setPreviewActionError(null)
  }, [realAssignmentPlayerKey])

  const handleClosePanel = useCallback(async () => {
    if (!room) return

    try {
      const updatedRoom = await updateRoomStatus(room.id, 'lobby')
      setRoom(updatedRoom)
      setPreviewAssignments(null)
      setPreviewRoles(null)
      setPreviewActionError(null)
      setShowRolePanel(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Oda durumu güncellenirken bilinmeyen bir hata oluştu.'
      setError(message)
    }
  }, [room])

  const handleStartRoleAssignment = useCallback(async () => {
    if (!room || !canDistributeRoles || isStartingAssignment || isEndingRoom) return

    setIsStartingAssignment(true)
    setError(null)

    try {
      const updatedRoom = await updateRoomStatus(room.id, 'role_assignment')
      setRoom(updatedRoom)
      setShowRolePanel(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Rol dağıtımı başlatılırken hata oluştu.'
      setError(message)
    } finally {
      setIsStartingAssignment(false)
    }
  }, [room, canDistributeRoles, isStartingAssignment, isEndingRoom])

  const handleEndRoom = useCallback(async () => {
    if (!room || isEndingRoom || isStartingAssignment) return

    setIsEndingRoom(true)
    setEndRoomError(null)

    try {
      const updatedRoom = await updateRoomStatus(room.id, 'finished')

      setRoom(updatedRoom)
      setShowRolePanel(false)
      setPreviewAssignments(null)
      setPreviewRoles(null)
      setPreviewActionError(null)
      setDevelopmentPlayers([])
      setEndRoomError(null)
      setShowEndRoomConfirmation(false)

      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Oda sonlandırılırken hata oluştu.'
      setEndRoomError(message)
    } finally {
      setIsEndingRoom(false)
    }
  }, [room, isEndingRoom, isStartingAssignment, navigate])

  const handleFillDevelopmentPlayers = useCallback((target: number) => {
    setPreviewAssignments(null)
    setPreviewRoles(null)
    setPreviewActionError(null)
    setDevelopmentPlayers((prev) => {
      const missingCount = target - realPlayerCount
      if (missingCount <= 0) return []
      if (missingCount <= prev.length) return prev.slice(0, missingCount)
      const newCount = missingCount - prev.length
      const newPlayers: DevelopmentPlayer[] = Array.from({ length: newCount }, (_, index) => ({
        id: `dev-player-${prev.length + index + 1}`,
        displayName: `Test Oyuncu ${prev.length + index + 1}`,
      }))
      return [...prev, ...newPlayers]
    })
  }, [realPlayerCount])

  const handleClearDevelopmentPlayers = useCallback(() => {
    setPreviewAssignments(null)
    setPreviewRoles(null)
    setPreviewActionError(null)
    setDevelopmentPlayers([])
  }, [])

  const handlePreview = useCallback((assignments: RoleAssignment[], roles: RoleTemplateItem[]) => {
    setPreviewAssignments(assignments)
    setPreviewRoles(roles)
    setPreviewActionError(null)
  }, [])

  const handleRedistribute = useCallback(() => {
    if (!previewRoles) return

    setPreviewActionError(null)

    try {
      const assignments = createRoleAssignments({ players: assignmentPlayers, roles: previewRoles })
      setPreviewAssignments(assignments)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setPreviewActionError(
        message
          ? `Rol dağıtımı yeniden oluşturulamadı. ${message}`
          : 'Rol dağıtımı yeniden oluşturulamadı.',
      )
    }
  }, [assignmentPlayers, previewRoles])

  const handleBackFromPreview = useCallback(() => {
    setPreviewAssignments(null)
    setPreviewRoles(null)
    setPreviewActionError(null)
  }, [])

  if (isLoading) {
    return <p className="p-4">Oda yükleniyor...</p>
  }

  if (error) {
    return <p className="p-4 text-rose-400">{error}</p>
  }

  if (!room) {
    return <p className="p-4">Oda bulunamadı.</p>
  }

  const isBusy = isStartingAssignment || isEndingRoom

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>Kod: {room.roomCode}</CardDescription>
            </div>
            <div className="ml-4 px-2 py-1 rounded bg-slate-800 text-sm text-slate-400">{players.length} kişi</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded border border-slate-700 bg-slate-950 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Hazır</p>
                <p className="text-lg font-semibold text-white">
                  {realReadyCount} / {realPlayerCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Durum</p>
                <p className="text-lg font-semibold capitalize text-white">{ROOM_STATUS_LABELS[room.status]}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button type="button" disabled={!canDistributeRoles || isBusy} onClick={handleStartRoleAssignment}>
                {isStartingAssignment ? 'Başlatılıyor...' : 'Rolleri Dağıt'}
              </Button>
            </div>
            {import.meta.env.DEV && (
              <div className="mt-4 flex flex-wrap gap-2">
                {DEVELOPMENT_TARGETS.map((target) => (
                  <Button
                    key={target}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleFillDevelopmentPlayers(target)}
                  >
                    {target} Oyuncuya Tamamla
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={handleClearDevelopmentPlayers}
                >
                  Fake Oyuncuları Temizle
                </Button>
              </div>
            )}
            {room.status !== 'finished' && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => {
                    setEndRoomError(null)
                    setShowEndRoomConfirmation(true)
                  }}
                >
                  Odayı Sonlandır
                </Button>
              </div>
            )}
          </div>
          {showEndRoomConfirmation && (
            <Card className="mb-4 border-rose-700 bg-rose-950">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-white">Odayı sonlandırmak istediğine emin misin?</p>
                <p className="mt-1 text-xs text-slate-300">
                  Tüm oyuncular ana ekrana yönlendirilecek ve bu odada oyun devam ettirilemeyecek.
                </p>
                {endRoomError && (
                  <p className="mt-2 text-sm text-rose-400">
                    {endRoomError}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isEndingRoom}
                    onClick={() => {
                      setEndRoomError(null)
                      setShowEndRoomConfirmation(false)
                    }}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isEndingRoom}
                    onClick={handleEndRoom}
                  >
                    {isEndingRoom ? 'Sonlandırılıyor...' : 'Odayı Sonlandır'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {previewAssignments ? (
            <div className="mt-4">
              <RoleAssignmentPreview
                assignments={previewAssignments}
                error={previewActionError}
                onRedistribute={handleRedistribute}
                onBack={handleBackFromPreview}
              />
            </div>
          ) : showRolePanel ? (
            <div className="mt-4">
              <RoleConfigurationPanel
                roomId={room.id}
                playerCount={totalAssignmentPlayersCount}
                players={assignmentPlayers}
                onPreview={handlePreview}
                onClose={handleClosePanel}
              />
            </div>
          ) : undefined}
          <div className="space-y-3">
            {players.map((p) => {
              const isModerator = room?.moderatorId != null && p.userId === room.moderatorId
              const playerId = p.userId
              const isKicking = playerId ? kickingPlayerIds.includes(playerId) : false
              const joinedAt = formatTime(p.joinedAt)

              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{(p.displayName ?? '–').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{p.displayName ?? 'Bilinmeyen'}</div>
                    {joinedAt && (
                      <div className="text-xs text-slate-400">
                        {joinedAt}'de odaya katıldı
                      </div>
                    )}
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
                        disabled={isKicking || isBusy}
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