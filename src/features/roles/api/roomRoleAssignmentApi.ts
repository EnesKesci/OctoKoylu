import { supabase } from '@/shared/lib/supabase'
import type { RoleCode } from '@/features/roles'
import type { Room, RoomStatus } from '@/features/rooms/api/roomApi'

interface RoomRow {
    id: string
    room_code: string
    name: string
    status: RoomStatus
    moderator_id: string | null
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

function createApiError(action: string, errorMessage?: string): Error {
    const msg = errorMessage ? `${action} ${errorMessage}` : action
    return new Error(msg)
}

export interface ConfirmRoleAssignmentItem {
    userId: string
    roleCode: RoleCode
}

export interface ConfirmRoomRoleAssignmentsInput {
    roomId: string
    assignments: ConfirmRoleAssignmentItem[]
}

export async function confirmRoomRoleAssignments(
    input: ConfirmRoomRoleAssignmentsInput,
): Promise<Room> {
    const { data, error } = await supabase
        .rpc('confirm_room_role_assignments', {
            p_room_id: input.roomId,
            p_assignments: input.assignments.map((assignment) => ({
                userId: assignment.userId,
                roleCode: assignment.roleCode,
            })),
        })

    if (error) {
        throw createApiError('Failed to confirm room role assignments.', error.message)
    }

    if (!data) {
        throw createApiError('Failed to confirm room role assignments. Empty response from database.')
    }

    return mapRoomRow(data as RoomRow)
}