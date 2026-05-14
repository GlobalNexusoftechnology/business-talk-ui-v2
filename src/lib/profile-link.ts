export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function profileHref(id?: string | number, name?: string) {
  if (!id) return '#'
  const sid = String(id)
  if (name) return `/profile/${sid}-${slugify(name)}`
  return `/profile/${sid}`
}

export default profileHref
