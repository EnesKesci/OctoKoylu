import { supabase } from '@/shared/lib/supabase'

export type RoomStatus = 'lobby' | 'role_assignment' | 'in_progress' | 'finished'

export interface Room {
  id: string
  roomCode: string
  name: string
  status: RoomStatus
  moderatorId: string | null
}

interface RoomRow {
  id: string
  room_code: string
  name: string
  status: RoomStatus
  moderator_id?: string | null
}

interface CreateRoomRow extends RoomRow { }

export interface CreateRoomInput {
  name: string
}

function mapCreateRoomRow(row: CreateRoomRow): Room {
  return {
    id: row.id,
    roomCode: row.room_code,
    name: row.name,
    status: row.status,
    moderatorId: (row as RoomRow).moderator_id ?? null,
  }
}

function mapRoomRow(row: RoomRow): Room {
  return {
    id: row.id,
    roomCode: row.room_code,
    name: row.name,
    status: row.status,
    moderatorId: row.moderator_id ?? null,
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
    .select('id, name, room_code, status, moderator_id')
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

// --- joinRoom implementation ---

export interface JoinRoomInput {
  roomCode: string
  userId: string
}

export async function joinRoom(input: JoinRoomInput): Promise<Room> {
  const rawCode = input.roomCode ?? ''
  const userId = input.userId

  const code = rawCode.trim().toUpperCase()
  // Validate code: exactly 6 chars, A-Z0-9
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    throw new Error('Invalid room code.')
  }

  // Find room and ensure it's in lobby status
  const room = await getRoomByCode(code)
  if (!room || room.status !== 'lobby') {
    throw new Error('Room not found or is no longer accepting players.')
  }

  // Load user's profile display name
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw createRoomApiError('Failed to join room.', profileError.message)
  }

  if (!profileData || !profileData.display_name || profileData.display_name.trim().length === 0) {
    throw new Error('Profile is required before joining a room.')
  }

  const displayName: string = profileData.display_name

  // Check if user already in room
  const { data: existingPlayer, error: existingError } = await supabase
    .from('room_players')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw createRoomApiError('Failed to join room.', existingError.message)
  }

  if (existingPlayer) {
    // Already a member — treat as success
    return room
  }

  // Insert new room player
  const { error: insertError } = await supabase
    .from('room_players')
    .insert({
      room_id: room.id,
      user_id: userId,
      display_name: displayName,
      is_ready: false,
    })

  if (insertError) {
    // If duplicate constraint from a race occurs, consider operation successful
    const msg = insertError.message ?? undefined
    throw createRoomApiError('Failed to join room.', msg)
  }

  return room
}

export interface LeaveRoomInput {
  roomId: string
  userId: string
}

export async function leaveRoom(input: LeaveRoomInput): Promise<void> {
  const { roomId, userId } = input

  const { error } = await supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) {
    throw createRoomApiError('Failed to leave room.', error.message)
  }
}

export interface KickPlayerInput {
  roomId: string
  playerUserId: string
}

export async function kickPlayer(input: KickPlayerInput): Promise<void> {
  const { roomId, playerUserId } = input

  const { error } = await supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', playerUserId)

  if (error) {
    throw createRoomApiError('Failed to remove player from room.', error.message)
  }
}

export interface UpdateReadyStatusInput {
  roomId: string
  userId: string
  isReady: boolean
}

export async function updateReadyStatus(input: UpdateReadyStatusInput): Promise<void> {
  const { roomId, userId, isReady } = input

  const { error } = await supabase
    .from('room_players')
    .update({ is_ready: isReady })
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) {
    throw createRoomApiError('Failed to update ready status.', error.message)
  }
}

export async function updateRoomStatus(
  roomId: string,
  status: RoomStatus,
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId)
    .select('id, name, room_code, status, moderator_id')
    .single()

  if (error) {
    throw createRoomApiError('Failed to update room status.', error.message)
  }

  if (!data) {
    throw createRoomApiError('Failed to update room status. Empty response from database.')
  }

  return mapRoomRow(data as RoomRow)
}

