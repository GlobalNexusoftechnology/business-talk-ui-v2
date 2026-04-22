'use client'

import { Search, Clock, Eye, BookmarkPlus, Send } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShareModal } from '@/components/shared/ShareModal'

interface Author {
  name: string
  avatar: string
  title: string
}

interface Blog {
  id: string
  title: string
  excerpt: string
  author: Author
  image: string
  category: string
  readTime: string
  publishedAt: string
  views: number
  bookmarks: number
}

const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'The Future of AI in Business: 10 Trends to Watch in 2026',
    excerpt: 'Artificial intelligence is transforming the business landscape at an unprecedented pace. From automated decision-making to personalized customer experiences, AI is reshaping how companies operate and compete...',
    author: {
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'AI Consultant & Tech Entrepreneur',
    },
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaCUyMG1lZXRpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Technology',
    readTime: '8 min read',
    publishedAt: '2 days ago',
    views: 12540,
    bookmarks: 342,
  },
  {
    id: '2',
    title: 'Building a Successful Startup: Lessons from 50+ Founders',
    excerpt: 'After interviewing over 50 successful startup founders, I\'ve identified key patterns that separate successful ventures from those that fail. Here are the most important lessons I\'ve learned...',
    author: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Startup Advisor & Investor',
    },
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVhbSUyMHdvcmtpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Entrepreneurship',
    readTime: '12 min read',
    publishedAt: '3 days ago',
    views: 18920,
    bookmarks: 567,
  },
  {
    id: '3',
    title: 'Digital Marketing ROI: How We Achieved 300% Growth',
    excerpt: 'In this comprehensive guide, I\'ll share the exact strategies we used to triple our digital marketing ROI in just 6 months. These tactics are proven and repeatable...',
    author: {
      name: 'Ankit Verma',
      avatar: 'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Growth Marketing Lead',
    },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBhbmFseXRpY3N8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Marketing',
    readTime: '10 min read',
    publishedAt: '5 days ago',
    views: 9340,
    bookmarks: 289,
  },
  {
    id: '4',
    title: 'The Remote Work Revolution: Managing Distributed Teams',
    excerpt: 'Remote work is here to stay. Learn how to build, manage, and scale distributed teams effectively while maintaining productivity and company culture...',
    author: {
      name: 'Sarah Thompson',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMjkwNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'HR Director & Leadership Coach',
    },
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW1vdGUlMjB3b3JrJTIwdGVhbXxlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Leadership',
    readTime: '7 min read',
    publishedAt: '1 week ago',
    views: 7650,
    bookmarks: 198,
  },
  {
    id: '5',
    title: 'Fundraising 101: A Complete Guide to Venture Capital',
    excerpt: 'Raising venture capital can be daunting. This comprehensive guide walks you through every step of the fundraising process, from preparing your pitch to closing the deal...',
    author: {
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'VC Partner & Former Founder',
    },
    image: 'https://images.unsplash.com/photo-1556155092-8707de31f9c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnZlc3RtZW50JTIwZnVuZGluZ3xlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Finance',
    readTime: '15 min read',
    publishedAt: '1 week ago',
    views: 15230,
    bookmarks: 423,
  },
]

const categories = ['All', 'Technology', 'Entrepreneurship', 'Marketing', 'Leadership', 'Finance']

export default function BlogsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  const handleBlogClick = (blog: Blog) => {
    router.push(`/blogs/${blog.id}`)
  }

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#212529' }}>
            Business Insights
          </h1>
          <p style={{ color: '#5F6368' }}>Read expert articles and insights from industry leaders</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ border: '1px solid #E8E8E8' }}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#5F6368' }} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: '#F8F9FA',
                border: '1px solid #E8E8E8',
                color: '#212529',
              }}
              onFocus={(e) => (e.currentTarget.style.outlineColor = '#212529')}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: selectedCategory === category ? '#212529' : '#F8F9FA',
                  color: selectedCategory === category ? '#FFFFFF' : '#5F6368',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#E8E8E8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA'
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        <div
          className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6 hover:shadow-md transition-shadow cursor-pointer"
          style={{ border: '1px solid #E8E8E8' }}
          onClick={() => handleBlogClick(mockBlogs[0])}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <img src={mockBlogs[0].image} alt={mockBlogs[0].title} className="w-full h-full object-cover" />
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>
                  Featured
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#F8F9FA', color: '#5F6368' }}>
                  {mockBlogs[0].category}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: '#212529' }}>
                {mockBlogs[0].title}
              </h2>
              <p className="mb-4 line-clamp-3" style={{ color: '#5F6368' }}>
                {mockBlogs[0].excerpt}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={mockBlogs[0].author.avatar}
                  alt={mockBlogs[0].author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium" style={{ color: '#212529' }}>
                    {mockBlogs[0].author.name}
                  </p>
                  <p className="text-sm" style={{ color: '#5F6368' }}>
                    {mockBlogs[0].author.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: '#5F6368' }}>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {mockBlogs[0].readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {mockBlogs[0].views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="space-y-6">
          {mockBlogs.slice(1).map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              style={{ border: '1px solid #E8E8E8' }}
              onClick={() => handleBlogClick(blog)}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-xl" />
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#F8F9FA', color: '#5F6368' }}>
                      {blog.category}
                    </span>
                    <span style={{ color: '#BDBDBD' }}>•</span>
                    <span className="text-sm" style={{ color: '#5F6368' }}>
                      {blog.publishedAt}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#212529' }}>
                    {blog.title}
                  </h3>
                  <p className="mb-4 line-clamp-2" style={{ color: '#5F6368' }}>
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={blog.author.avatar} alt={blog.author.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#212529' }}>
                          {blog.author.name}
                        </p>
                        <p className="text-xs" style={{ color: '#5F6368' }}>
                          {blog.author.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4 text-sm" style={{ color: '#5F6368' }}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {blog.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#5F6368' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <BookmarkPlus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBlog(blog)
                            setShowShareModal(true)
                          }}
                          className="p-2 rounded-lg transition-colors cursor-pointer"
                          style={{ color: '#5F6368' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={selectedBlog?.excerpt}
      />
    </div>
  )
}
