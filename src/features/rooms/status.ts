import type { RoomStatus } from './api/roomApi'

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
    lobby: 'Lobi',
    role_assignment: 'Rol Ataması',
    in_progress: 'Oyun Devam Ediyor',
    finished: 'Oyun Tamamlandı',
}