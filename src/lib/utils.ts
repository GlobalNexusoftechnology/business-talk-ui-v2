/**
 * Converts a timestamp (unix ms, ISO string, or numeric string) to a
 * human-readable relative time string, e.g. "just now", "5m", "2h", "3d".
 */
export function getTimeAgo(timestamp: string | number): string {
  const now = Date.now()
  const time = typeof timestamp === 'number' ? timestamp : Number(timestamp)
  const diff = now - (isNaN(time) ? new Date(timestamp).getTime() : time)

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  if (weeks < 4) return `${weeks}w`
  if (months < 12) return `${months}mo`
  return `${years}y`
}
