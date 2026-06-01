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

// Additional transform / raw limits and megapixel constraints
export const RAW_MAX_SIZE = 10 * 1024 * 1024 // 10 MB
export const IMAGE_TRANSFORM_MAX = 100 * 1024 * 1024 // 100 MB (transformed image)
export const VIDEO_TRANSFORM_MAX = 40 * 1024 * 1024 // 40 MB (transformed video)
export const IMAGE_MAX_MEGAPIXELS = 25 // 25 MP
export const ALL_FRAMES_MAX_MEGAPIXELS = 50 // 50 MP across frames (video)

/**
 * Advanced validation before upload that also checks image/video dimensions
 * and common transformation limits. Returns an error string or null.
 */
export async function validateFileBeforeUpload(file: File): Promise<string | null> {
  // Raw files (non-image/video) guard
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    if (file.size > RAW_MAX_SIZE) {
      return `"${file.name}" exceeds the raw file limit of 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`
    }
    return null
  }

  // Image validation (type + size + megapixels)
  if (file.type.startsWith('image/')) {
    const basic = validateImageFile(file)
    if (basic) return basic

    // Check megapixels by loading the image
    try {
      const url = URL.createObjectURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = (e) => reject(e)
        i.src = url
      })
      const mp = (img.naturalWidth * img.naturalHeight) / 1_000_000
      URL.revokeObjectURL(url)
      if (mp > IMAGE_MAX_MEGAPIXELS) {
        return `"${file.name}" is ${mp.toFixed(1)} MP which exceeds the ${IMAGE_MAX_MEGAPIXELS} MP limit.`
      }
      // Warn if transformed image might be large (treat as error to avoid backend 413)
      if (file.size > IMAGE_TRANSFORM_MAX) {
        return `"${file.name}" may exceed the backend image transform limit (${(IMAGE_TRANSFORM_MAX / 1024 / 1024).toFixed(0)} MB). Please resize before upload.`
      }
    } catch (e) {
      return `Failed to validate "${file.name}" image dimensions.`
    }

    return null
  }

  // Video validation (type + size + frame megapixels)
  if (file.type.startsWith('video/')) {
    const basic = validateMediaFile(file)
    if (basic) return basic

    // Check video dimensions via HTMLVideoElement metadata
    try {
      const url = URL.createObjectURL(file)
      const vid = document.createElement('video')
      const metadata = await new Promise<HTMLVideoElement>((resolve, reject) => {
        vid.onloadedmetadata = () => resolve(vid)
        vid.onerror = (e) => reject(e)
        vid.preload = 'metadata'
        vid.src = url
      })
      const vw = metadata.videoWidth || 0
      const vh = metadata.videoHeight || 0
      URL.revokeObjectURL(url)
      const mp = (vw * vh) / 1_000_000
      if (mp > ALL_FRAMES_MAX_MEGAPIXELS) {
        return `"${file.name}" has frame resolution ${mp.toFixed(1)} MP which exceeds the ${ALL_FRAMES_MAX_MEGAPIXELS} MP limit.`
      }
      // Warn if transformed video might exceed backend transform limit
      if (file.size > VIDEO_TRANSFORM_MAX) {
        return `"${file.name}" may exceed the backend video transform limit (${(VIDEO_TRANSFORM_MAX / 1024 / 1024).toFixed(0)} MB). Please upload a smaller file.`
      }
    } catch (e) {
      return `Failed to validate "${file.name}" video metadata.`
    }

    return null
  }

  return null
}
