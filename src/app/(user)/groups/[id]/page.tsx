'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Lock, Globe, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'

interface GroupMember {
  id: string
  name: string
  avatar: string
  title: string
}

interface GroupPost {
  id: string
  author: GroupMember
  content: string
  timestamp: string
  likes: number
  comments: number
}

interface Group {
  id: string
  name: string
  description: string
  image: string
  members: number
  posts: number
  type: 'public' | 'private'
  joined: boolean
  category: string
  membersList: GroupMember[]
  recentPosts: GroupPost[]
  about: string
}

// Mock group data with detailed information
const mockGroups: { [key: string]: Group } = {
  '1': {
    id: '1',
    name: 'Startup Founders India',
    description: 'A community of startup founders sharing insights, challenges, and success stories',
    image: 'https://images.unsplash.com/photo-1759310610480-48649b55fbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBncm91cCUyMG1lZXRpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 12450,
    posts: 3420,
    type: 'public',
    joined: true,
    category: 'Entrepreneurship',
    about: 'Startup Founders India is a thriving community of entrepreneurs and founders building the next generation of businesses in India. We share experiences, challenges, and celebrate success together. Whether you\'re just starting out or scaling your venture, this is the place to connect, learn, and grow.',
    membersList: [
      { id: '1', name: 'Rajesh Kumar', avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080', title: 'Founder & CEO' },
      { id: '2', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080', title: 'Product Manager' },
      { id: '3', name: 'Ankit Verma', avatar: 'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080', title: 'Head of Growth' },
      { id: '4', name: 'Sarah Thompson', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMjkwNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080', title: 'Financial Advisor' },
      { id: '5', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080', title: 'Marketing Expert' },
      { id: '6', name: 'Anjali Desai', avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnZlc3RtZW50JTIwYnVzaW5lc3N8ZW58MXx8fHwxNzcyMjIyNzU3fDA&ixlib=rb-4.1.0&q=80&w=1080', title: 'VC Partner' },
    ],
    recentPosts: [
      {
        id: '1',
        author: { id: '1', name: 'Rajesh Kumar', avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080', title: 'Founder & CEO' },
        content: 'Just raised our Series A funding! Excited to announce that we\'ve secured $5M in funding to scale our platform. Huge thanks to our investors and supporters!',
        timestamp: '2 hours ago',
        likes: 342,
        comments: 45,
      },
      {
        id: '2',
        author: { id: '2', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080', title: 'Product Manager' },
        content: 'What\'s your go-to strategy for customer retention? We\'ve been experimenting with personalized onboarding and would love to hear what works for other founders.',
        timestamp: '1 day ago',
        likes: 218,
        comments: 67,
      },
      {
        id: '3',
        author: { id: '3', name: 'Ankit Verma', avatar: 'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080', title: 'Head of Growth' },
        content: 'Looking for recommendations on growth hacking tools. We\'re targeting B2B SaaS and want to optimize our acquisition funnel.',
        timestamp: '2 days ago',
        likes: 156,
        comments: 89,
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Digital Marketing Professionals',
    description: 'Learn and share the latest trends in digital marketing, SEO, and growth hacking',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 8920,
    posts: 2150,
    type: 'public',
    joined: true,
    category: 'Marketing',
    about: 'Digital Marketing Professionals is a vibrant community dedicated to sharing the latest trends, strategies, and best practices in digital marketing. From SEO and social media to content marketing and analytics, we cover it all.',
    membersList: [],
    recentPosts: [],
  },
}

export default function GroupDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const group = mockGroups[groupId]
  const [showShareModal, setShowShareModal] = useState(false)
  const [isJoined, setIsJoined] = useState(group?.joined || false)

  if (!group) {
    return (
      <div className="p-6 text-center" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
        <p style={{ color: '#5F6368' }}>Group not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#212529' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8E8E8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to groups
        </button>

        {/* Group Card with Header */}
        <div
          className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8"
          style={{ border: '1px solid #E8E8E8' }}
        >
          {/* Hero Image */}
          <img src={group.image} alt={group.name} className="w-full h-72 object-cover" />

          {/* Group Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold" style={{ color: '#212529' }}>
                    {group.name}
                  </h1>
                  <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#F8F9FA', color: '#5F6368' }}>
                    {group.type === 'public' ? <Globe className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />}
                    {' '}{group.type === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
                <p style={{ color: '#5F6368' }}>{group.description}</p>
              </div>

              <button
                onClick={() => setIsJoined(!isJoined)}
                className="px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: isJoined ? '#F8F9FA' : '#212529',
                  color: isJoined ? '#212529' : '#FFFFFF',
                  border: isJoined ? '1px solid #E8E8E8' : 'none',
                }}
              >
                {isJoined ? 'Leave Group' : 'Join Group'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b" style={{ borderColor: '#E8E8E8' }}>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.members.toLocaleString()}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Members
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.posts.toLocaleString()}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Posts
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.membersList.length}+
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Admins
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.category}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Category
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#212529' }}>
            About
          </h2>
          <p style={{ color: '#5F6368', lineHeight: '1.8' }}>
            {group.about}
          </p>
        </div>

        {/* Members Section */}
        {group.membersList.length > 0 && (
          <div
            className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
            style={{ border: '1px solid #E8E8E8' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#212529' }}>
              Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.membersList.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium" style={{ color: '#212529' }}>
                      {member.name}
                    </p>
                    <p className="text-sm" style={{ color: '#5F6368' }}>
                      {member.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts Section */}
        {group.recentPosts.length > 0 && (
          <div
            className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
            style={{ border: '1px solid #E8E8E8' }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#212529' }}>
              Recent Posts
            </h2>
            <div className="space-y-6">
              {group.recentPosts.map((post) => (
                <div key={post.id} className="pb-6 border-b" style={{ borderColor: '#E8E8E8' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium" style={{ color: '#212529' }}>
                        {post.author.name}
                      </p>
                      <p className="text-xs" style={{ color: '#5F6368' }}>
                        {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4" style={{ color: '#5F6368' }}>
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6" style={{ color: '#5F6368' }}>
                    <button className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors">
                      👍 {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6 flex gap-3"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1" style={{ backgroundColor: '#F8F9FA', color: '#212529' }}>
            <MessageCircle className="w-5 h-5" />
            Message
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1"
            style={{ backgroundColor: '#F8F9FA', color: '#212529' }}
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={group.description}
        title={group.name}
        contentType="group"
        contentId={group.id}
      />
    </div>
  )
}
