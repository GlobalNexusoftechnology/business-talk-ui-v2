'use client'

import {
  Search,
  Home,
  HelpCircle,
  ImageIcon,
} from 'lucide-react'

import { FeedPost } from './FeedPost'
import { CreatePostBox } from './CreatePostBox'
import { QuestionPost } from './QuestionPost'
import { StoryPost } from './StoryPost'
import { PostQuestionBox } from './PostQuestionBox'
import { ShareStoryBox } from './ShareStoryBox'

import { useState } from 'react'
import { useFeedPosts } from '../../hooks/useFeedPosts'
import { useStoriesFeed } from '../../hooks/useStoriesFeed'

export default function MainFeed() {
  const [activeTab, setActiveTab] = useState<'home' | 'qa' | 'stories'>('home')

  // ✅ Combined feed now (NO feedType)
  const { data: posts, isLoading: postsLoading } = useFeedPosts('NORMAL')
  const { data: questions, isLoading: questionsLoading } = useFeedPosts('QUESTION')
  const { data: stories, isLoading: storiesLoading } = useStoriesFeed()

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto">

        {/* 🔍 Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for Q&A, Post, Stories, People…"
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white shadow-sm border border-gray-200 focus:outline-none"
            />
          </div>
        </div>

        {/* 🧭 Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 flex gap-2 border border-gray-200">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
              activeTab === 'home'
                ? 'bg-black text-white'
                : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5" />
            Home Feed
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
              activeTab === 'qa'
                ? 'bg-black text-white'
                : 'text-gray-500'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Q&A
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
              activeTab === 'stories'
                ? 'bg-black text-white'
                : 'text-gray-500'
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
      </div>
    </main>
  )
}