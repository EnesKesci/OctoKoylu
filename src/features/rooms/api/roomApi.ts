import { supabase } from '@/shared/lib/supabase'

export type RoomStatus = 'lobby' | 'role_assignment' | 'in_progress' | 'finished'

export interface Room {
  id: string
  roomCode: string
  name: string
  status: RoomStatus
}

interface CreateRoomRow {
  id: string
  room_code: string
  name: string
  status: RoomStatus
}

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
