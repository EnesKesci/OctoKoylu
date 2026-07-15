import type { RoleCode, RoleDefinition } from './types'

export const ROLE_CATALOG: Record<RoleCode, RoleDefinition> = {
  villager: {
    code: 'villager',
    name: 'Köylü',
    team: 'village',
    isUnique: false,
    shortDescription: 'Özel yeteneği yoktur. Vampirleri bulup gündüz oylamasında elemeye çalışır.',
  },
  doctor: {
    code: 'doctor',
    name: 'Doktor',
    team: 'village',
    isUnique: true,
    shortDescription: 'Her gece bir oyuncuyu vampir saldırısından korur.',
  },
  detective: {
    code: 'detective',
    name: 'Dedektif',
    team: 'village',
    isUnique: true,
    shortDescription: 'Her gece bir oyuncunun hangi takıma ait olduğunu öğrenir.',
  },
  sniper: {
    code: 'sniper',
    name: 'Keskin Nişancı',
    team: 'village',
    isUnique: true,
    shortDescription: 'Oyun boyunca tek mermisiyle bir oyuncuyu vurabilir.',
  },
  vampire: {
    code: 'vampire',
    name: 'Vampir',
    team: 'vampire',
    isUnique: false,
    shortDescription: 'Vampir takımıyla birlikte geceleri bir hedef belirler.',
  },
  godfather: {
    code: 'godfather',
    name: 'Baş Vampir',
    team: 'vampire',
    isUnique: true,
    shortDescription: 'Vampir takımının lideridir ve dedektife köylü takımından görünür.',
  },
  silencer: {
    code: 'silencer',
    name: 'Susturucu',
    team: 'vampire',
    isUnique: true,
    shortDescription: 'Oyun boyunca bir oyuncunun ertesi gün konuşmasını engelleyebilir.',
  },
  joker: {
    code: 'joker',
    name: 'Joker',
    team: 'independent',
    isUnique: true,
    shortDescription: 'Gündüz oylamasıyla elenirse oyunu tek başına kazanır.',
  },
}
