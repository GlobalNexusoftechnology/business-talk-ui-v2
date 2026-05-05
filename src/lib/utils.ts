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

// ─── File validation ──────────────────────────────────────────────────────────

export const IMAGE_MAX_SIZE = 10 * 1024 * 1024  // 10 MB
export const MEDIA_MAX_SIZE = 100 * 1024 * 1024 // 100 MB

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const MEDIA_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
]

/** Validate a single image file (profile photos, cover images, blog covers).
 *  Returns an error string or null if valid. */
export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported image type. Allowed: JPEG, PNG, GIF, WebP.`
  }
  if (file.size > IMAGE_MAX_SIZE) {
    return `"${file.name}" exceeds the 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }
  return null
}

/** Validate a single media file (post media — images or videos).
 *  Returns an error string or null if valid. */
export function validateMediaFile(file: File): string | null {
  if (!MEDIA_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported type. Allowed: JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM.`
  }
  if (file.size > MEDIA_MAX_SIZE) {
    return `"${file.name}" exceeds the 100 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }
  return null
}
