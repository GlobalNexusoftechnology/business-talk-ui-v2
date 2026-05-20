'use client'

import { Bell, Menu, Search as SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useRedux'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'

interface AdminNavbarProps {
  onMenuClick?: () => void
}

export const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
  const { user, isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ users: any[]; groups: any[]; questions: any[]; posts: any[]; blogs: any[]; stories: any[] }>({ users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUnreadCount = async () => {
      try {
        const res = await apiClient.getAdminUnreadNotificationCount()
        if (isMounted) {
          setUnreadCount(Number(res.data?.unread || 0))
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0)
        }
      }
    }

    loadUnreadCount()
    const intervalId = window.setInterval(loadUnreadCount, 30000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.searchSuggestions(query.trim())
        // searchSuggestions returns shapes compatible with MainFeed (or an array)
        const payload = res?.data ?? {}

        // If payload is already the shaped object, use it directly
        if (payload && typeof payload === 'object' && (payload.users || payload.groups || payload.questions || payload.posts || payload.blogs || payload.stories)) {
          setSuggestions({
            users: payload.users || [],
            groups: payload.groups || [],
            questions: payload.questions || [],
            posts: payload.posts || [],
            blogs: payload.blogs || [],
            stories: payload.stories || [],
          })
          setShowSuggestions(true)
          return
        }

        // Fallback: if payload is an array or object with arrays under keys, flatten and categorize
        let items: any[] = []
        if (Array.isArray(payload)) items = payload
        else if (payload && typeof payload === 'object') {
          const keys = ['users', 'groups', 'questions', 'posts', 'blogs', 'stories']
          for (const k of keys) {
            const arr = payload[k]
            if (Array.isArray(arr)) items = items.concat(arr.map((it: any) => ({ ...(it || {}), __source: k })))
          }
        }

        setSuggestions({
          users: items.filter((it) => String(it.__source || it.type || '').toLowerCase().includes('user')).slice(0, 6),
          groups: items.filter((it) => String(it.__source || '').toLowerCase().includes('group')).slice(0, 6),
          questions: items.filter((it) => String(it.type || it.__source || '').toLowerCase().includes('question')).slice(0, 6),
          posts: items.filter((it) => String(it.type || it.__source || '').toLowerCase().includes('post')).slice(0, 6),
          blogs: items.filter((it) => String(it.type || it.__source || '').toLowerCase().includes('blog')).slice(0, 6),
          stories: items.filter((it) => String(it.type || it.__source || '').toLowerCase().includes('story')).slice(0, 6),
        })
        setShowSuggestions(true)
      } catch (err) {
        setSuggestions({ users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
        setShowSuggestions(false)
      }
    }, 250)
  }, [query])

  const canonicalizeSuggestion = (item: any) => {
    if (!item) return null
    const out: any = {}
    const rawType = String(item.type || item.post_type || item.content_type || item.result_type || item.__source || '').toLowerCase()

    // canonicalize backend type variants to simple types used by routing
    let canonicalType = ''
    if (rawType.includes('question')) canonicalType = 'question'
    else if (rawType.includes('blog') || rawType.includes('admin_blog')) canonicalType = 'blog'
    else if (rawType.includes('story')) canonicalType = 'story'
    else if (rawType.includes('user')) canonicalType = 'user'
    else if (rawType.includes('group')) canonicalType = 'group'
    else if (rawType.includes('post') || rawType.includes('normal') || rawType === 'normal') canonicalType = 'post'
    else canonicalType = rawType

    out.type = canonicalType
    out.id = item.id ?? item.post_id ?? item.blog_id ?? item.story_id ?? item.user_id ?? item.group_id ?? item._id
    out.title = item.title ?? item.post_title ?? item.blog_title
    out.content = item.content ?? item.post_content ?? item.body ?? item.summary ?? item.excerpt ?? ''
    out.username = item.username ?? item.user_username ?? item.user_name
    out.name = item.name ?? item.full_name
    return out
  }

  const getQueryValue = (item: any) => {
    // prefer explicit q, then title, content, username, name, id
    if (!item) return ''
    return (
      item.q ||
      item.query ||
      item.title ||
      item.content ||
      item.username ||
      item.name ||
      item.id ||
      ''
    )
  }

  const onSelectSuggestion = (rawItem: any) => {
    const item = canonicalizeSuggestion(rawItem) || rawItem || {}
    const qval = getQueryValue(rawItem) || getQueryValue(item)
    setShowSuggestions(false)
    setQuery('')

    const type = String(item.type || '').toLowerCase()
    const encode = (v: any) => encodeURIComponent(String(v || ''))

    if (type.includes('user') || String(rawItem.__source || '').toLowerCase().includes('user')) {
      router.push(`/admin/users?q=${encode(qval)}`)
      return
    }
    if (type.includes('question') || String(rawItem.__source || '').toLowerCase().includes('question')) {
      router.push(`/admin/questions?q=${encode(qval)}`)
      return
    }
    if (type.includes('post') || String(rawItem.__source || '').toLowerCase().includes('post')) {
      router.push(`/admin/posts?q=${encode(qval)}`)
      return
    }
    if (type.includes('blog') || String(rawItem.__source || '').toLowerCase().includes('blog')) {
      router.push(`/admin/blogs?q=${encode(qval)}`)
      return
    }
    if (type.includes('story') || String(rawItem.__source || '').toLowerCase().includes('story')) {
      router.push(`/admin/stories?q=${encode(qval)}`)
      return
    }

    // fallback: prefer questions, then users, then posts
    if ((suggestions.questions?.length ?? 0) > 0) router.push(`/admin/questions?q=${encode(qval)}`)
    else if ((suggestions.users?.length ?? 0) > 0) router.push(`/admin/users?q=${encode(qval)}`)
    else router.push(`/admin/posts?q=${encode(qval)}`)
  }

  const handleSearch = async (qIn?: string, forcedType?: string) => {
    const q = (qIn ?? query ?? '').trim()
    if (!q) return
    setShowSuggestions(false)
    setQuery('')

    const encode = (v: any) => encodeURIComponent(String(v || ''))

    if (forcedType) {
      // direct navigate to requested admin list
      if (forcedType === 'users') router.push(`/admin/users?q=${encode(q)}`)
      else if (forcedType === 'questions') router.push(`/admin/questions?q=${encode(q)}`)
      else if (forcedType === 'posts') router.push(`/admin/posts?q=${encode(q)}`)
      else if (forcedType === 'stories') router.push(`/admin/stories?q=${encode(q)}`)
      else if (forcedType === 'blogs') router.push(`/admin/blogs?q=${encode(q)}`)
      else if (forcedType === 'groups') router.push(`/admin/groups?q=${encode(q)}`)
      else router.push(`/admin/posts?q=${encode(q)}`)
      return
    }

    try {
      const res = await apiClient.searchAll(q)
      const raw = res?.data?.data ?? res?.data ?? {}
      const normalize = (key: string) => {
        const v = raw[key]
        if (!v) return []
        if (Array.isArray(v)) return v
        if (v.entities && Array.isArray(v.entities)) return v.entities
        if (v.raw && Array.isArray(v.raw)) return v.raw
        return []
      }

      const results = {
        questions: normalize('questions'),
        users: normalize('users'),
        posts: normalize('posts'),
        blogs: normalize('blogs'),
        stories: normalize('stories'),
        groups: normalize('groups'),
      }

      // prefer question results, then users, then posts
      if ((results.questions?.length ?? 0) > 0) router.push(`/admin/questions?q=${encode(q)}`)
      else if ((results.users?.length ?? 0) > 0) router.push(`/admin/users?q=${encode(q)}`)
      else if ((results.posts?.length ?? 0) > 0) router.push(`/admin/posts?q=${encode(q)}`)
      else if ((results.blogs?.length ?? 0) > 0) router.push(`/admin/blogs?q=${encode(q)}`)
      else if ((results.stories?.length ?? 0) > 0) router.push(`/admin/stories?q=${encode(q)}`)
      else if ((results.groups?.length ?? 0) > 0) router.push(`/admin/groups?q=${encode(q)}`)
      else router.push(`/admin/posts?q=${encode(q)}`)
    } catch {
      router.push(`/admin/posts?q=${encode(q)}`)
    }
  }

  // Highlight helper (simple, copied from MainFeed)
  const Highlight = ({ text, q }: { text: string; q: string }) => {
    if (!q.trim()) return <>{text}</>
    try {
      const escaped = q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === q.toLowerCase() ? (
              <mark key={i} className="bg-yellow-200 text-black rounded-sm px-0.5 not-italic">{part}</mark>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      )
    } catch {
      return <>{text}</>
    }
  }

  // const handleEnter = () => {
  //   const q = query.trim()
  //   if (!q) return
  //   // prefer question results, then users, then posts
  //   if ((suggestions.questions?.length ?? 0) > 0) router.push(`/admin/questions?q=${encodeURIComponent(q)}`)
  //   else if ((suggestions.users?.length ?? 0) > 0) router.push(`/admin/users?q=${encodeURIComponent(q)}`)
  //   else router.push(`/admin/posts?q=${encodeURIComponent(q)}`)
  //   setShowSuggestions(false)
  //   setQuery('')
  // }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-secondary-200 lg:ml-64">
      <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-secondary-50 rounded-lg">
            <Menu className="h-6 w-6 text-secondary-600" />
          </button>

          {/* Search Bar */}
          {/* will add search Bar in next update as right now it is unnecessary */}
          {/* <div className="hidden md:flex items-center gap-2 bg-secondary-50 rounded-lg px-4 py-2 flex-1 max-w-xs">
            <Search className="h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search users, posts..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div> */}
        </div>

        {/* Center Search (visible md+) */}
        <div className="hidden md:flex items-center justify-center flex-1 px-4">
          <div className="relative w-full max-w-lg">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
              onFocus={() => query && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search users, posts, blogs..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-secondary-50 text-sm"
            />
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
                {/* Questions */}
                {(suggestions.questions?.length ?? 0) > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Questions</div>
                    {suggestions.questions.map((q: any) => (
                      <button
                        key={q.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(q) }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#212529' }}><Highlight text={q.content || q.title || ''} q={query} /></div>
                          <div className="text-xs text-secondary-500">question</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <button onMouseDown={(e) => { e.preventDefault(); handleSearch(query, 'questions') }} className="text-sm text-blue-500">See all questions for "{query}"</button>
                    </div>
                  </div>
                )}

                {/* Posts */}
                {(suggestions.posts?.length ?? 0) > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Posts</div>
                    {suggestions.posts.map((p: any) => (
                      <button
                        key={p.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(p) }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#212529' }}><Highlight text={p.content || p.title || ''} q={query} /></div>
                          <div className="text-xs text-secondary-500">post</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <button onMouseDown={(e) => { e.preventDefault(); handleSearch(query, 'posts') }} className="text-sm text-blue-500">See all posts for "{query}"</button>
                    </div>
                  </div>
                )}

                {/* Users */}
                {(suggestions.users?.length ?? 0) > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">People</div>
                    {suggestions.users.map((u: any) => (
                      <button
                        key={u.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(u) }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#212529' }}><Highlight text={u.username || u.name || ''} q={query} /></div>
                          <div className="text-xs text-secondary-500">user</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <button onMouseDown={(e) => { e.preventDefault(); handleSearch(query, 'users') }} className="text-sm text-blue-500">See all people for "{query}"</button>
                    </div>
                  </div>
                )}

                {/* Blogs */}
                {(suggestions.blogs?.length ?? 0) > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Blogs</div>
                    {suggestions.blogs.map((b: any) => (
                      <button
                        key={b.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(b) }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#212529' }}><Highlight text={b.title || b.content || ''} q={query} /></div>
                          <div className="text-xs text-secondary-500">blog</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <button onMouseDown={(e) => { e.preventDefault(); handleSearch(query, 'blogs') }} className="text-sm text-blue-500">See all blogs for "{query}"</button>
                    </div>
                  </div>
                )}

                {/* Stories */}
                {(suggestions.stories?.length ?? 0) > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stories</div>
                    {suggestions.stories.map((s: any) => (
                      <button
                        key={s.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(s) }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#212529' }}><Highlight text={s.title || s.content || ''} q={query} /></div>
                          <div className="text-xs text-secondary-500">story</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <button onMouseDown={(e) => { e.preventDefault(); handleSearch(query, 'stories') }} className="text-sm text-blue-500">See all stories for "{query}"</button>
                    </div>
                  </div>
                )}

                {/* Groups
                {suggestions.groups?.length > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Groups</div>
                    {suggestions.groups.map((g: any) => (
                      <button
                        key={g.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(g) }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#212529' }}><Highlight text={g.name || ''} q={query} /></div>
                          <div className="text-xs text-secondary-500">group</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <button onMouseDown={(e) => { e.preventDefault(); handleSearch(query, 'groups') }} className="text-sm text-blue-500">See all groups for "{query}"</button>
                    </div>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link href="/admin/notifications">
            <button className="relative p-2 hover:bg-secondary-50 rounded-lg">
              <Bell className="h-6 w-6 text-secondary-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </Link>

          {/* User Avatar */}
          {isAuthenticated && user && (
            <Link href="/admin/profile">
              <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-primary-700 transition-colors">
                {user.name?.charAt(0) || user.username?.charAt(0) || 'A'}
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
