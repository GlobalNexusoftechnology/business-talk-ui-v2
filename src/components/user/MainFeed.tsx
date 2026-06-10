import type { Group } from '@/types/group'
'use client'

import {
  Search,
  Home,
  HelpCircle,
  ImageIcon,
  X,
  Loader2,
  User,
  Users,
  FileQuestion,
  FileText,
  BookOpen,
} from 'lucide-react'
import { useAuthWall } from '@/providers/AuthWallProvider'

import { FeedPost } from './FeedPost'
import { CreatePostBox } from './CreatePostBox'
import { QuestionPost } from './QuestionPost'
import { StoryPost } from './StoryPost'
import { PostQuestionBox } from './PostQuestionBox'
import { ShareStoryBox } from './ShareStoryBox'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFeedPosts } from '../../hooks/useFeedPosts'
import { useStoriesFeed } from '../../hooks/useStoriesFeed'
import apiClient from '../../lib/api-client'
import PeopleCard from '@/components/user/PeopleCard'

// ── highlight matching text ────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-black rounded-sm px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export default function MainFeed() {
  const { showLoginModal } =
    useAuthWall()

  const [guestWallShown,
    setGuestWallShown] =
    useState(false)
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'home' | 'qa' | 'stories'>('home')

  useEffect(() => {
    if (
      typeof window === 'undefined'
    )
      return

    const user =
      localStorage.getItem('user')

    if (user) return

    const handleScroll = () => {
      if (guestWallShown) return

      const scrollPercent =
        window.scrollY /
        (document.body.scrollHeight -
          window.innerHeight)

      if (scrollPercent > 0.25) {
        setGuestWallShown(true)

        setTimeout(() => {
          showLoginModal()
        }, 500)
      }
    }

    window.addEventListener(
      'scroll',
      handleScroll
    )

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      )
  }, [
    guestWallShown,
    showLoginModal,
  ])

  // Allow external links to open a specific tab and focus the composer
  useEffect(() => {
    try {
      const tab = searchParams?.get?.('tab')
      const compose = searchParams?.get?.('compose')
      if (tab === 'home' || tab === 'qa' || tab === 'stories') {
        setActiveTab(tab)
      }
      if (compose === '1') {
        setTimeout(() => {
          const root = document.querySelector('.create-box') as HTMLElement | null
          if (root) {
            const input = root.querySelector('textarea, input') as HTMLElement | null
            input?.focus()
            root.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 50)
      }
    } catch {}
  }, [searchParams])

  const {
    data: postPages,
    isLoading: postsLoading,
    fetchNextPage: fetchMorePosts,
    hasNextPage: hasMorePosts,
    isFetchingNextPage: loadingMorePosts,
  } = useFeedPosts('NORMAL')

  const {
    data: questionPages,
    isLoading: questionsLoading,
    fetchNextPage: fetchMoreQuestions,
    hasNextPage: hasMoreQuestions,
    isFetchingNextPage: loadingMoreQuestions,
  } = useFeedPosts('QUESTION')
  
  const {
    data: storyPages,
    isLoading: storiesLoading,
    fetchNextPage: fetchMoreStories,
    hasNextPage: hasMoreStories,
    isFetchingNextPage:
      loadingMoreStories,
  } = useStoriesFeed()

  const stories =
    storyPages?.pages.flatMap(
      page => page.data
    ) || []

  const posts =
    postPages?.pages.flatMap(
      page => page.data
    ) || []

  const questions =
    questionPages?.pages.flatMap(
      page => page.data
    ) || []

  // ── Search state ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ users: any[]; groups: any[]; questions: any[]; posts: any[]; blogs: any[]; stories: any[] }>({
    users: [],
    groups: [],
    questions: [],
    posts: [], blogs: [], stories: [] 
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)

    const [groups, setGroups] = useState<Group[]>([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        entries => {
          if (
            entries[0].isIntersecting
          ) {
            if (
              activeTab === 'home' &&
              hasMorePosts &&
              !loadingMorePosts
            ) {
              fetchMorePosts()
            }

            if (
              activeTab === 'qa' &&
              hasMoreQuestions &&
              !loadingMoreQuestions
            ) {
              fetchMoreQuestions()
            }

            if (
              activeTab === 'stories' &&
              hasMoreStories &&
              !loadingMoreStories
            ) {
              fetchMoreStories()
            }
          }
        },
        {
          threshold: 0.5,
        }
      )

    if (loadMoreRef.current) {
      observer.observe(
        loadMoreRef.current
      )
    }

    return () =>
      observer.disconnect()
  }, [
    activeTab,
    hasMorePosts,
    loadingMorePosts,
    hasMoreQuestions,
    loadingMoreQuestions,
    hasMoreStories,
    loadingMoreStories,
    fetchMorePosts,
    fetchMoreQuestions,
    fetchMoreStories,
  ])

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchQuery.trim()) {
      setSuggestions({ users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const res = await apiClient.searchSuggestions(searchQuery)
        setSuggestions(res.data ?? { users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
        setShowSuggestions(true)
      } catch {
        setSuggestions({ users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
      } finally {
        setSuggestionsLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const hasSuggestions =
    (suggestions.questions?.length ?? 0) +
    (suggestions.users?.length ?? 0) +
    (suggestions.groups?.length ?? 0) > 0

  // Full search
  const handleSearch = async (q = searchQuery) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setShowSuggestions(false)
    setIsSearchMode(true)
    setSearchLoading(true)
    try {
      const res = await apiClient.searchAll(trimmed)
      const raw = res.data?.data ?? {}

      const normalize = (key: string) => {
        const v = raw[key]
        if (!v) return []
        if (Array.isArray(v)) return v
        if (v.entities && Array.isArray(v.entities)) return v.entities
        if (v.raw && Array.isArray(v.raw)) return v.raw
        // unknown shape, return empty
        return []
      }

      const canonicalize = (item: any, key: string) => {
        if (!item) return null
        const out: any = {}
        out.type = (item.type || item.content_type || item.result_type || key || '').toString().toLowerCase()

        out.id = item.id ?? item.post_id ?? item.blog_id ?? item.story_id ?? item.user_id ?? item.group_id ?? item._id

        out.title = item.title ?? item.post_title ?? item.blog_title
        out.content = item.content ?? item.post_content ?? item.body ?? item.summary ?? item.excerpt ?? ''

        // user info may be nested or present as prefixed fields
        out.user = item.user ?? item.author ?? null
        if (!out.user) {
          const maybeUserId = item.user_id ?? item.post_user_id ?? item.post_user_id ?? item.post_user
          if (maybeUserId) {
            out.user = {
              id: maybeUserId,
              username: item.user_username ?? item.username ?? item.user_name,
              full_name: item.user_full_name ?? item.full_name ?? item.name,
              profile_photo: item.user_profile_photo ?? item.profile_photo,
            }
          }
        }

        // derive link path
        let linkPath = ''
        if (out.type.includes('question') || key === 'questions') linkPath = `/questions/${out.id}`
        else if (out.type.includes('post') || key === 'posts') linkPath = `/posts/${out.id}`
        else if (out.type.includes('blog') || key === 'blogs') linkPath = `/blogs/${out.id}`
        else if (out.type.includes('story') || key === 'stories') linkPath = `/stories/${out.id}`
        else if (key === 'users' || out.type.includes('user')) linkPath = `/profile/${out.user?.username ?? out.id}`
        else if (key === 'groups' || out.type.includes('group')) linkPath = `/groups/${out.id}`
        out.linkPath = linkPath

        return out
      }

      const normalized = {
        users: normalize('users').map((i: any) => canonicalize(i, 'users')).filter(Boolean),
        questions: normalize('questions').map((i: any) => canonicalize(i, 'questions')).filter(Boolean),
        posts: normalize('posts').map((i: any) => canonicalize(i, 'posts')).filter(Boolean),
        blogs: normalize('blogs').map((i: any) => canonicalize(i, 'blogs')).filter(Boolean),
        stories: normalize('stories').map((i: any) => canonicalize(i, 'stories')).filter(Boolean),
        groups: normalize('groups').map((i: any) => canonicalize(i, 'groups')).filter(Boolean),
      }

      setSearchResults(normalized)
    } catch {
      setSearchResults(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleJoinToggle = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return

    try {
      if (group.joined) {
        await apiClient.leaveGroup(groupId)
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: false } : g))
      } else if (group.requested) {
        // request already pending — no cancel endpoint; do nothing
        return
      } else if (group.requiresApproval) {
        await apiClient.requestToJoinGroup(groupId)
        const updated = { ...group, requested: true }
        setGroups(prev => prev.map(g => g.id === groupId ? updated : g))
      } else {
        await apiClient.joinGroup(groupId)
        const updated = { ...group, joined: true }
        setGroups(prev => prev.map(g => g.id === groupId ? updated : g))
      }
    } catch (err) {
      console.error('Join/Leave error', err)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchMode(false)
    setSearchResults(null)
    setSuggestions({ users: [], groups: [], questions: [], posts: [], blogs: [], stories: [] })
    setShowSuggestions(false)
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <main className="flex-1 min-w-0 p-3 sm:p-6 overflow-y-auto overflow-x-hidden bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto">

        {/* 🔍 Search Bar */}
        <div className="mb-6 relative" ref={searchBarRef}>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for Q&A, Post, Stories, People…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => { if (hasSuggestions) setShowSuggestions(true) }}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
              className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white shadow-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition"
            />
            {suggestionsLoading && (
              <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin pointer-events-none" />
            )}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && hasSuggestions && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

              {/* Questions */}
              {suggestions.questions?.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Questions
                  </div>
                  {suggestions.questions.map((q: any) => (
                    <button
                      key={q.id}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onMouseDown={() => {
                        const text = (q.content ?? '').substring(0, 80)
                        setSearchQuery(text)
                        handleSearch(text)
                      }}
                    >
                      <FileQuestion className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        <Highlight text={q.content ?? ''} query={searchQuery} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Posts */}
              {suggestions.posts?.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Posts
                  </div>
                  {suggestions.posts.map((p: any) => (
                    <button
                      key={p.id}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onMouseDown={() => {
                        const text = (p.content ?? '').substring(0, 80)
                        setSearchQuery(text)
                        handleSearch(text)
                      }}
                    >
                      <FileQuestion className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        <Highlight text={p.content ?? ''} query={searchQuery} />
                      </span>
                    </button>
                  ))}
                </div>
              )}


              {/* Stories */}
              {suggestions.stories?.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Stories
                  </div>
                  {suggestions.stories.map((s: any) => (
                    <button
                      key={s.id}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onMouseDown={() => {
                        const text = (s.content ?? '').substring(0, 80)
                        setSearchQuery(text)
                        handleSearch(text)
                      }}
                    >
                      <FileQuestion className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        <Highlight text={s.content ?? ''} query={searchQuery} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Blogs */}
              {suggestions.blogs?.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Blogs
                  </div>
                  {suggestions.blogs.map((b: any) => (
                    <button
                      key={b.id}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onMouseDown={() => {
                        const text = (b.content ?? '').substring(0, 80)
                        setSearchQuery(text)
                        handleSearch(text)
                      }}
                    >
                      <FileQuestion className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        <Highlight text={b.content ?? ''} query={searchQuery} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Users */}
              {suggestions.users?.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    People
                  </div>
                  {suggestions.users.map((u: any) => (
                    <button
                      key={u.id}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onMouseDown={() => {
                        setSearchQuery(u.username)
                        handleSearch(u.username)
                      }}
                    >
                      <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        <Highlight text={u.username} query={searchQuery} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Groups */}
              {suggestions.groups?.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Groups
                  </div>
                  {suggestions.groups.map((g: any) => (
                    <button
                      key={g.id}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                      onMouseDown={() => {
                        setSearchQuery(g.name)
                        handleSearch(g.name)
                      }}
                    >
                      <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        <Highlight text={g.name} query={searchQuery} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100">
                <button
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium transition"
                  onMouseDown={() => handleSearch()}
                >
                  See all results for &ldquo;{searchQuery}&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── SEARCH RESULTS ── */}
        {isSearchMode ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">
                Results for{' '}
                <span className="text-black">&ldquo;{searchQuery}&rdquo;</span>
              </h2>
              <button
                onClick={handleClearSearch}
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition"
              >
                <X className="w-4 h-4" /> Clear search
              </button>
            </div>

            {searchLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : !searchResults ? (
              <div className="text-center py-20 text-gray-400">No results found.</div>
            ) : (
              <div className="space-y-8">

                {/* ── Questions ── */}
                {searchResults.questions?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <FileQuestion className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold text-gray-800">Questions</h3>
                      <span className="text-xs bg-purple-100 text-purple-600 rounded-full px-2 py-0.5 font-medium">
                        {searchResults.questions.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {searchResults.questions.map((q: any) => (
                        <div
                          key={q.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition cursor-pointer"
                          onClick={() => { if (q.linkPath) router.push(q.linkPath) }}
                        >
                          <p className="text-sm text-gray-800">
                            <Highlight text={q.content ?? ''} query={searchQuery} />
                          </p>
                          {q.user?.username && (
                            <p className="text-xs text-gray-400 mt-2">by @{q.user.username}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Posts ── */}
                {searchResults.posts?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-800">Posts</h3>
                      <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-medium">
                        {searchResults.posts.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {searchResults.posts.map((p: any) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition cursor-pointer"
                          onClick={() => { if (p.linkPath) router.push(p.linkPath) }}
                        >
                          <p className="text-sm text-gray-800 line-clamp-3">
                            <Highlight text={p.content ?? ''} query={searchQuery} />
                          </p>
                          {p.user?.username && (
                            <p className="text-xs text-gray-400 mt-2">by @{p.user.username}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Stories ── */}
                {searchResults.stories?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                      <h3 className="font-semibold text-gray-800">Stories</h3>
                      <span className="text-xs bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 font-medium">
                        {searchResults.stories.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {searchResults.stories.map((s: any) => (
                        <div
                          key={s.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition cursor-pointer"
                          onClick={() => { if (s.linkPath) router.push(s.linkPath) }}
                        >
                          {s.title && (
                            <p className="font-medium text-sm text-gray-900 mb-1">
                              <Highlight text={s.title} query={searchQuery} />
                            </p>
                          )}
                          {s.user?.username && (
                            <p className="text-xs text-gray-400">by @{s.user.username}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Blogs ── */}
                {searchResults.blogs?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-gray-800">Blogs</h3>
                      <span className="text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 font-medium">
                        {searchResults.blogs.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {searchResults.blogs.map((b: any) => (
                        <div
                          key={b.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition cursor-pointer"
                          onClick={() => { if (b.linkPath) router.push(b.linkPath) }}
                        >
                          {b.title && (
                            <p className="font-medium text-sm text-gray-900 mb-1">
                              <Highlight text={b.title} query={searchQuery} />
                            </p>
                          )}
                          {b.content && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              <Highlight text={b.content} query={searchQuery} />
                            </p>
                          )}
                          {b.user?.username && (
                            <p className="text-xs text-gray-400 mt-2">by @{b.user.username}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── People ── */}
                {searchResults.users?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-800">People</h3>
                      <span className="text-xs bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 font-medium">
                        {searchResults.users.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(Array.isArray(searchResults.users)
                        ? searchResults.users
                        : Array.isArray(searchResults.users?.entities)
                          ? searchResults.users.entities
                          : Array.isArray(searchResults.users?.users)
                            ? searchResults.users.users
                            : []
                      ).map((u: any) => (
                        <PeopleCard key={u.id} user={u} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Groups ── */}
                {searchResults.groups?.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-teal-500" />
                      <h3 className="font-semibold text-gray-800">Groups</h3>
                      <span className="text-xs bg-teal-100 text-teal-600 rounded-full px-2 py-0.5 font-medium">
                        {searchResults.groups.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.groups?.map((g: any) => (
                        <div
                          key={g.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition cursor-pointer"
                          onClick={() => router.push(`/groups/${g.id}`)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={g.cover_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name || 'Group')}`}
                              alt={g.name}
                              className="w-12 h-12 rounded object-cover bg-gray-100"
                            />
                            <div>
                              <p className="font-medium text-sm">{g.name}</p>
                              <span className="text-xs text-gray-400">{g.memberCount} members</span>
                              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{g.visibility}</span>
                              {g.requiresApproval && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Approval Required</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{g.description}</p>
                          {g.rules?.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-gray-500 mb-2">
                              {g.rules.map((rule: string, idx: number) => (
                                <li key={idx}>{rule}</li>
                              ))}
                            </ul>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleJoinToggle(g.id) }}
                            disabled={g.requested && !g.joined}
                            className={`w-full py-2.5 rounded-lg font-medium border transition-all active:scale-95 ${g.requested && !g.joined ? 'cursor-not-allowed opacity-70' : ''}`}
                            style={{
                              backgroundColor: 'transparent',
                              color: g.joined ? '#DC2626' : g.requested ? '#5F6368' : '#212529',
                              borderColor: g.joined ? '#DC2626' : g.requested ? '#9CA3AF' : '#212529',
                            }}
                            onMouseEnter={(e) => {
                              if (g.joined) {
                                e.currentTarget.style.backgroundColor = '#DC2626'
                                e.currentTarget.style.color = '#FFFFFF'
                              } else if (!g.requested) {
                                e.currentTarget.style.backgroundColor = '#212529'
                                e.currentTarget.style.color = '#FFFFFF'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (g.joined) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = '#DC2626'
                              } else if (!g.requested) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.color = '#212529'
                              }
                            }}
                          >
                            {g.joined ? 'Leave Group' : g.requested ? 'Requested' : g.requiresApproval ? 'Request to Join' : 'Join Group'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* All empty */}
                {!searchResults.questions?.length &&
                  !searchResults.posts?.length &&
                  !searchResults.stories?.length &&
                  !searchResults.blogs?.length &&
                  !searchResults.users?.length &&
                  !searchResults.groups?.length && (
                    <div className="text-center py-20 text-gray-400">
                      No results found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 🧭 Tabs */}
            <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 flex gap-2 border border-gray-200">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'home' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="truncate">Home Feed</span>
              </button>

              <button
                onClick={() => setActiveTab('qa')}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'qa' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="truncate">Q&A</span>
              </button>

              <button
                onClick={() => setActiveTab('stories')}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'stories' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="truncate">Stories</span>
              </button>
            </div>

            {/* 🏠 HOME FEED */}
            {activeTab === 'home' && (
              <>
                <div className="create-box">
                  <CreatePostBox />
                </div>
                <div>
                  {postsLoading ? (
                    <div>Loading...</div>
                  ) : (
                    (Array.isArray(posts) ? posts : []).map((post: any) => (
                      <FeedPost key={post.id} {...post} />
                    ))
                  )}
                  {/* Infinite Scroll Trigger */}
                  <div
                    ref={loadMoreRef}
                    className="py-6 flex justify-center"
                  >
                    {loadingMorePosts && (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ❓ Q&A */}
            {activeTab === 'qa' && (
              <>
                <div className="create-box">
                  <PostQuestionBox />
                </div>
                <div>
                  {questionsLoading ? (
                    <div>Loading...</div>
                  ) : (
                    (Array.isArray(questions) ? questions : []).map((q: any) => (
                      <QuestionPost key={q.id} {...q} />
                    ))
                  )}
                  <div
                    ref={loadMoreRef}
                    className="py-6 flex justify-center"
                  >
                    {loadingMoreQuestions && (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 📖 STORIES */}
            {activeTab === 'stories' && (
              <>
                <div className="create-box">
                  <ShareStoryBox />
                </div>
                <div>
                  {storiesLoading ? (
                    <div>Loading...</div>
                  ) : (
                    (Array.isArray(stories) ? stories : []).map((story: any) => (
                      <StoryPost key={story.id} {...story} />
                    ))
                  )}
                  <div
                    ref={loadMoreRef}
                    className="py-6 flex justify-center"
                  >
                    {loadingMoreStories && (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    )}
                  </div>
                  
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}