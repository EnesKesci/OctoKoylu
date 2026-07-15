import type { RoleCode } from './types'

export interface RoleTemplateItem {
  roleCode: RoleCode
  count: number
}

export interface RoleTemplate {
  playerCount: number
  name: string
  roles: RoleTemplateItem[]
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    playerCount: 6,
    name: '6 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 4 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'vampire', count: 1 },
    ],
  },
  {
    playerCount: 7,
    name: '7 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 3 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
    ],
  },
  {
    playerCount: 8,
    name: '8 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 3 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 1 },
      { roleCode: 'godfather', count: 1 },
    ],
  },
  {
    playerCount: 9,
    name: '9 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 3 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
      { roleCode: 'godfather', count: 1 },
    ],
  },
  {
    playerCount: 10,
    name: '10 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 4 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
      { roleCode: 'godfather', count: 1 },
    ],
  },
  {
    playerCount: 11,
    name: '11 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 4 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
      { roleCode: 'godfather', count: 1 },
      { roleCode: 'joker', count: 1 },
    ],
  },
  {
    playerCount: 12,
    name: '12 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 4 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
      { roleCode: 'godfather', count: 1 },
      { roleCode: 'silencer', count: 1 },
      { roleCode: 'joker', count: 1 },
    ],
  },
  {
    playerCount: 13,
    name: '13 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 5 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
      { roleCode: 'godfather', count: 1 },
      { roleCode: 'silencer', count: 1 },
      { roleCode: 'joker', count: 1 },
    ],
  },
  {
    playerCount: 14,
    name: '14 Oyuncu - Varsayılan',
    roles: [
      { roleCode: 'villager', count: 6 },
      { roleCode: 'doctor', count: 1 },
      { roleCode: 'detective', count: 1 },
      { roleCode: 'sniper', count: 1 },
      { roleCode: 'vampire', count: 2 },
      { roleCode: 'godfather', count: 1 },
      { roleCode: 'silencer', count: 1 },
      { roleCode: 'joker', count: 1 },
    ],
  },
]
