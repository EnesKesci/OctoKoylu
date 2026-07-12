import { supabase } from '@/shared/lib/supabase'

export type RoomStatus = 'lobby' | 'role_assignment' | 'in_progress' | 'finished'

export interface Room {
  id: string
  roomCode: string
  name: string
  status: RoomStatus
}

interface RoomRow {
  id: string
  room_code: string
  name: string
  status: RoomStatus
}

interface CreateRoomRow extends RoomRow {}

export interface CreateRoomInput {
  name: string
}

function mapCreateRoomRow(row: CreateRoomRow): Room {
  return {
    id: row.id,
    roomCode: row.room_code,
    name: row.name,
    status: row.status,
  }
}

function mapRoomRow(row: RoomRow): Room {
  return {
    id: row.id,
    roomCode: row.room_code,
    name: row.name,
    status: row.status,
  }
}

// Player types
interface PlayerRow {
  id: string
  user_id: string | null
  display_name: string | null
  is_ready: boolean | null
  joined_at: string | null
}

export interface Player {
  id: string
  userId: string | null
  displayName: string | null
  isReady: boolean
  joinedAt: string | null
}

function mapPlayerRow(row: PlayerRow): Player {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    isReady: Boolean(row.is_ready),
    joinedAt: row.joined_at,
  }
}

function createRoomApiError(action: string, errorMessage?: string): Error {
  const msg = errorMessage ? `${action} ${errorMessage}` : action
  return new Error(msg)
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const trimmed = input.name.trim()

  if (trimmed.length < 2) {
    throw new Error('Room name must be at least 2 characters.')
  }

  if (trimmed.length > 60) {
    throw new Error('Room name must be at most 60 characters.')
  }

  const { data, error } = await supabase
    .rpc('create_room', { p_room_name: trimmed })
    .single()

  if (error) {
    throw createRoomApiError('Failed to create room.', error?.message)
  }

  if (!data) {
    throw createRoomApiError('Failed to create room. Empty response from database.')
  }

  // map and return
  return mapCreateRoomRow(data as CreateRoomRow)
}

export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, room_code, status')
    .eq('room_code', roomCode)
    .maybeSingle()

  if (error) {
    throw createRoomApiError('Failed to load room.', error?.message)
  }

  if (!data) return null

  return mapRoomRow(data as RoomRow)
}

export async function getRoomPlayers(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select('id, user_id, display_name, is_ready, joined_at')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })

  if (error) {
    throw createRoomApiError('Failed to load room players.', error?.message)
  }

  if (!data) return []

  return (data as PlayerRow[]).map(mapPlayerRow)
}
