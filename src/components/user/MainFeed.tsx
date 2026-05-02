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

import { FeedPost } from './FeedPost'
import { CreatePostBox } from './CreatePostBox'
import { QuestionPost } from './QuestionPost'
import { StoryPost } from './StoryPost'
import { PostQuestionBox } from './PostQuestionBox'
import { ShareStoryBox } from './ShareStoryBox'

import { useState, useRef, useEffect } from 'react'
import { useFeedPosts } from '../../hooks/useFeedPosts'
import { useStoriesFeed } from '../../hooks/useStoriesFeed'
import apiClient from '../../lib/api-client'

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
  const [activeTab, setActiveTab] = useState<'home' | 'qa' | 'stories'>('home')

  const { data: posts, isLoading: postsLoading } = useFeedPosts('NORMAL')
  const { data: questions, isLoading: questionsLoading } = useFeedPosts('QUESTION')
  const { data: stories, isLoading: storiesLoading } = useStoriesFeed()

  // ── Search state ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ users: any[]; groups: any[]; questions: any[] }>({
    users: [],
    groups: [],
    questions: [],
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

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

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchQuery.trim()) {
      setSuggestions({ users: [], groups: [], questions: [] })
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const res = await apiClient.searchSuggestions(searchQuery)
        setSuggestions(res.data ?? { users: [], groups: [], questions: [] })
        setShowSuggestions(true)
      } catch {
        setSuggestions({ users: [], groups: [], questions: [] })
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
      setSearchResults(res.data?.data ?? null)
    } catch {
      setSearchResults(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchMode(false)
    setSearchResults(null)
    setSuggestions({ users: [], groups: [], questions: [] })
    setShowSuggestions(false)
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <main className="flex-1 p-3 sm:p-6 overflow-y-auto bg-[#F8F9FA]">
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
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition"
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
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition"
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
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition"
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
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition"
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
                      {searchResults.users.map((u: any) => (
                        <div
                          key={u.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              <Highlight text={u.full_name || u.username} query={searchQuery} />
                            </p>
                            <p className="text-xs text-gray-400">
                              @<Highlight text={u.username} query={searchQuery} />
                            </p>
                            {u.profession && (
                              <p className="text-xs text-gray-400 truncate">{u.profession}</p>
                            )}
                          </div>
                        </div>
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
                      {searchResults.groups.map((g: any) => (
                        <div
                          key={g.id}
                          className="bg-white rounded-2xl border p-4 hover:border-gray-300 transition"
                        >
                          <p className="font-medium text-sm">
                            <Highlight text={g.name} query={searchQuery} />
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{g.memberCount} members</p>
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
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                  activeTab === 'home' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                <Home className="w-5 h-5" />
                Home Feed
              </button>

              <button
                onClick={() => setActiveTab('qa')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                  activeTab === 'qa' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                Q&A
              </button>

              <button
                onClick={() => setActiveTab('stories')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                  activeTab === 'stories' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Stories
              </button>
            </div>

            {/* 🏠 HOME FEED */}
            {activeTab === 'home' && (
              <>
                <CreatePostBox />
                <div>
                  {postsLoading ? (
                    <div>Loading...</div>
                  ) : (
                    (Array.isArray(posts) ? posts : []).map((post: any) => (
                      <FeedPost key={post.id} {...post} />
                    ))
                  )}
                </div>
              </>
            )}

            {/* ❓ Q&A */}
            {activeTab === 'qa' && (
              <>
                <PostQuestionBox />
                <div>
                  {questionsLoading ? (
                    <div>Loading...</div>
                  ) : (
                    (Array.isArray(questions) ? questions : []).map((q: any) => (
                      <QuestionPost key={q.id} {...q} />
                    ))
                  )}
                </div>
              </>
            )}

            {/* 📖 STORIES */}
            {activeTab === 'stories' && (
              <>
                <ShareStoryBox />
                <div>
                  {storiesLoading ? (
                    <div>Loading...</div>
                  ) : (
                    (Array.isArray(stories) ? stories : []).map((story: any) => (
                      <StoryPost key={story.id} {...story} />
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}