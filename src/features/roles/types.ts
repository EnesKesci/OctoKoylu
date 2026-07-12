export type RoleTeam = 'village' | 'vampire' | 'independent'

export type RoleCode =
  | 'villager'
  | 'doctor'
  | 'detective'
  | 'sniper'
  | 'vampire'
  | 'godfather'
  | 'silencer'
  | 'joker'

export interface RoleDefinition {
  code: RoleCode
  name: string
  team: RoleTeam
  isUnique: boolean
  shortDescription: string
}
