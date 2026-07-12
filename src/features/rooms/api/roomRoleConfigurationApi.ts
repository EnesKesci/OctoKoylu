import { supabase } from '@/shared/lib/supabase'
import type { RoleTemplateItem } from '@/features/roles'

export interface RoomRoleConfiguration {
    id: string
    roomId: string
    playerCount: number
    roles: RoleTemplateItem[]
    createdAt: string
    updatedAt: string
}

interface RoomRoleConfigurationRow {
    id: string
    room_id: string
    player_count: number
    roles: RoleTemplateItem[]
    created_at: string
    updated_at: string
}

export interface SaveRoomRoleConfigurationInput {
    roomId: string
    playerCount: number
    roles: RoleTemplateItem[]
}

function mapRoomRoleConfigurationRow(row: RoomRoleConfigurationRow): RoomRoleConfiguration {
    return {
        id: row.id,
        roomId: row.room_id,
        playerCount: row.player_count,
        roles: row.roles,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

function createApiError(action: string, errorMessage?: string): Error {
    const msg = errorMessage ? `${action} ${errorMessage}` : action
    return new Error(msg)
}

export async function getRoomRoleConfiguration(roomId: string): Promise<RoomRoleConfiguration | null> {
    const { data, error } = await supabase
        .from('room_role_configurations')
        .select()
        .eq('room_id', roomId)
        .maybeSingle()

    if (error) {
        throw createApiError('Failed to load room role configuration.', error.message)
    }

    if (!data) return null

    return mapRoomRoleConfigurationRow(data as RoomRoleConfigurationRow)
}

export async function saveRoomRoleConfiguration(
    input: SaveRoomRoleConfigurationInput,
): Promise<RoomRoleConfiguration> {
    const { data, error } = await supabase
        .from('room_role_configurations')
        .upsert(
            {
                room_id: input.roomId,
                player_count: input.playerCount,
                roles: input.roles,
            },
            {
                onConflict: 'room_id',
            },
        )
        .select()
        .single()

    if (error) {
        throw createApiError('Failed to save room role configuration.', error.message)
    }

    if (!data) {
        throw createApiError('Failed to save room role configuration. Empty response from database.')
    }

    return mapRoomRoleConfigurationRow(data as RoomRoleConfigurationRow)
}