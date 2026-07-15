import type { RoleCode } from './types'
import type { RoleTemplateItem } from './templates'

function shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items]

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = temp
    }

    return shuffled
}

interface RoleAssignmentPlayer {
    id: string
    displayName: string
}

interface RoleAssignment {
    playerId: string
    displayName: string
    roleCode: RoleCode
}

interface CreateRoleAssignmentsInput {
    players: RoleAssignmentPlayer[]
    roles: RoleTemplateItem[]
}

function createRoleAssignments(input: CreateRoleAssignmentsInput): RoleAssignment[] {
    const hasInvalidRoleCount = input.roles.some(
        (role) =>
            !Number.isSafeInteger(role.count) ||
            role.count <= 0,
    )

    if (hasInvalidRoleCount) {
        throw new Error('Role counts must be positive integers.')
    }

    const totalRoles = input.roles.reduce((sum, role) => sum + role.count, 0)

    if (input.players.length !== totalRoles) {
        throw new Error('Player count and role count must match.')
    }

    const rolePool: RoleCode[] = []

    for (const item of input.roles) {
        for (let i = 0; i < item.count; i++) {
            rolePool.push(item.roleCode)
        }
    }

    const shuffledPlayers = shuffleArray(input.players)
    const shuffledRoles = shuffleArray(rolePool)

    return shuffledPlayers.map((player, index) => ({
        playerId: player.id,
        displayName: player.displayName,
        roleCode: shuffledRoles[index],
    }))
}

export {
    shuffleArray,
    createRoleAssignments,
}

export type {
    RoleAssignmentPlayer,
    RoleAssignment,
    CreateRoleAssignmentsInput,
}