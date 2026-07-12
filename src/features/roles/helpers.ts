import { ROLE_TEMPLATES } from './templates'
import type { RoleTemplateItem } from './templates'

export interface DefaultRoleConfiguration {
  playerCount: number
  templateName: string
  roles: RoleTemplateItem[]
}

export function getDefaultRoleConfiguration(
  playerCount: number,
): DefaultRoleConfiguration | null {
  const template = ROLE_TEMPLATES.find((t) => t.playerCount === playerCount)

  if (!template) {
    return null
  }

  return {
    playerCount: template.playerCount,
    templateName: template.name,
    roles: template.roles.map((item) => ({
      roleCode: item.roleCode,
      count: item.count,
    })),
  }
}
