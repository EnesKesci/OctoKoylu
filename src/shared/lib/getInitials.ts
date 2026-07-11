export function getInitials(displayName: string): string {
  if (!displayName) return '?'
  const trimmed = displayName.trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0) return '?'
  const parts = trimmed.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() || '?'
  const first = parts[0].charAt(0).toUpperCase() || ''
  const second = parts[parts.length - 1].charAt(0).toUpperCase() || ''
  const initials = (first + second).slice(0, 2)
  return initials || '?'
}
