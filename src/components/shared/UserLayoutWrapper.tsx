'use client'

import { UserSidebar } from '@/components/shared/UserSidebar'
import { UserNavbar } from '@/components/shared/UserNavbar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { MergedMobileSidebarContent } from '@/components/shared/MergedMobileSidebarContent'

interface UserLayoutWrapperProps {
  children: React.ReactNode
}

export const UserLayoutWrapper = ({ children }: UserLayoutWrapperProps) => {


  type Person = any
  type Story = any
  type Question = any
  // Explicitly type Group as any to avoid 'never[]' error
  type Group = any

  const [people, setPeople] = useState<Person[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [peopleRes, groupsRes, storiesRes, hotRes] = await Promise.all([
          apiClient.getFollowSuggestions(),
          apiClient.getGroups(),
          apiClient.getStories(),
          apiClient.getTrendingPosts(),
        ])
        setPeople(peopleRes.data || [])
        setGroups(groupsRes.data || [])
        const sortedStories = (storiesRes.data || []).sort(
          (a: any, b: any) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
        )
        setStories(sortedStories.slice(0, 5))
        const trendingPosts = hotRes.data || []
        const questionPosts = trendingPosts
          .filter((p: any) => (p.post_type || p.type)?.toUpperCase() === 'QUESTION')
          .sort((a: any, b: any) => (b.hot_score || 0) - (a.hot_score || 0))
        setQuestions(questionPosts.slice(0, 5))
      } catch (err) {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      {/* Navbar for mobile */}
      <div className="lg:hidden">
        <UserNavbar>
          <MergedMobileSidebarContent
            people={people}
            stories={stories}
            questions={questions}
            groups={groups}
            loading={loading}
            onProfileClick={(person: any) => router.push(`/profile/${person.id}`)}
            onFollow={async (id: string) => {
              try {
                await apiClient.followUserById(id)
                setPeople((prev) => prev.filter((p) => p.id !== id))
              } catch {}
            }}
            onSeeAllPeople={() => router.push('/people')}
            onSeeAllGroups={() => router.push('/groups')}
          />
        </UserNavbar>
      </div>
      {/* Sidebar for desktop */}
      <UserSidebar />
      {/* Main Content */}
      <main className="lg:ml-64 p-1 pt-16 lg:pt-1">
        <div className="w-full max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}