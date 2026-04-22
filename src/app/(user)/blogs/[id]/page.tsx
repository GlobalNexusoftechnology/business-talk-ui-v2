'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Clock, Eye, Share2, Bookmark, ThumbsUp, MessageCircle } from 'lucide-react'
import { useState } from 'react'
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
  content: string
  author: Author
  image: string
  category: string
  readTime: string
  publishedAt: string
  views: number
  bookmarks: number
  likes: number
  comments: number
}

// Mock blog data with full content
const mockBlogs: { [key: string]: Blog } = {
  '1': {
    id: '1',
    title: 'The Future of AI in Business: 10 Trends to Watch in 2026',
    excerpt: 'Artificial intelligence is transforming the business landscape at an unprecedented pace.',
    content: `Artificial intelligence is transforming the business landscape at an unprecedented pace. From automated decision-making to personalized customer experiences, AI is reshaping how companies operate and compete.

In this comprehensive guide, I'll explore the 10 most important AI trends that business leaders need to watch in 2026:

1. **Generative AI Maturation**: We're moving beyond hype to practical enterprise applications. Companies are now deploying generative AI for document analysis, code generation, and customer service at scale.

2. **AI-Powered Decision Making**: Organizations are leveraging machine learning to make data-driven decisions faster than ever before. Real-time analytics and predictive models are becoming standard.

3. **Ethical AI and Compliance**: As AI adoption increases, so does the focus on ethics and compliance. New regulations are shaping how companies develop and deploy AI systems.

4. **AI Talent Gap**: Despite growing demand, there's still a significant shortage of AI talent. Companies are investing heavily in training and education programs.

5. **Vertical-Specific Solutions**: AI solutions are becoming increasingly specialized for specific industries like healthcare, finance, and retail.

6. **Edge AI**: Processing data locally on devices rather than in cloud servers is becoming more important for privacy and latency-sensitive applications.

7. **Multimodal AI**: AI systems that can process and understand multiple types of data (text, images, audio) simultaneously are becoming more sophisticated.

8. **AI ROI Focus**: Companies are shifting from experimentation to focusing on measurable return on investment from their AI initiatives.

9. **Responsible AI Practices**: Organizations are implementing frameworks for responsible AI development and deployment.

10. **AI for Sustainability**: AI is being used to optimize resource usage and address environmental challenges.

The organizations that successfully navigate these trends will be those that invest in the right talent, infrastructure, and governance frameworks. The future belongs to companies that can harness AI responsibly and effectively.`,
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
    likes: 1250,
    comments: 89,
  },
  '2': {
    id: '2',
    title: 'Building a Successful Startup: Lessons from 50+ Founders',
    excerpt: 'After interviewing over 50 successful startup founders...',
    content: 'Full content for blog 2...',
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
    likes: 2100,
    comments: 156,
  },
}

export default function BlogDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  const blog = mockBlogs[blogId]
  const [showShareModal, setShowShareModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  if (!blog) {
    return (
      <div className="p-6 text-center" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
        <p style={{ color: '#5F6368' }}>Blog not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#212529' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8E8E8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to blogs
        </button>

        {/* Hero Image */}
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-80 object-cover rounded-2xl mb-8"
        />

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#E8E8E8', color: '#212529' }}>
              {blog.category}
            </span>
            <span style={{ color: '#BDBDBD' }}>•</span>
            <span className="text-sm" style={{ color: '#5F6368' }}>
              {blog.publishedAt}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4" style={{ color: '#212529' }}>
            {blog.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 py-6 border-t border-b" style={{ borderColor: '#E8E8E8', color: '#5F6368' }}>
            <div className="flex items-center gap-3">
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium" style={{ color: '#212529' }}>
                  {blog.author.name}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  {blog.author.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm ml-auto">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {blog.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {blog.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose mb-12" style={{ color: '#212529' }}>
          {blog.content.split('\n\n').map((paragraph, index) => (
            <p
              key={index}
              className="mb-6 leading-relaxed"
              style={{ lineHeight: '1.8', fontSize: '16px' }}
            >
              {paragraph.split('\n').map((line, lineIndex) => (
                <span key={lineIndex}>
                  {line}
                  {lineIndex < paragraph.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
        </div>

        {/* Engagement Stats */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                {blog.likes}
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                Likes
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                {blog.comments}
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                Comments
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                {blog.bookmarks}
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                Bookmarks
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                {blog.views.toLocaleString()}
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                Views
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6 flex flex-wrap gap-3"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: isLiked ? '#E3F2FD' : '#F8F9FA',
              color: isLiked ? '#1976D2' : '#5F6368',
            }}
            onMouseEnter={(e) => {
              if (!isLiked) e.currentTarget.style.backgroundColor = '#E8E8E8'
            }}
            onMouseLeave={(e) => {
              if (!isLiked) e.currentTarget.style.backgroundColor = '#F8F9FA'
            }}
          >
            <ThumbsUp className="w-5 h-5" />
            Like
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all" style={{ color: '#5F6368', backgroundColor: '#F8F9FA' }}>
            <MessageCircle className="w-5 h-5" />
            Comment
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: isBookmarked ? '#FFF3E0' : '#F8F9FA',
              color: isBookmarked ? '#F57C00' : '#5F6368',
            }}
            onMouseEnter={(e) => {
              if (!isBookmarked) e.currentTarget.style.backgroundColor = '#E8E8E8'
            }}
            onMouseLeave={(e) => {
              if (!isBookmarked) e.currentTarget.style.backgroundColor = '#F8F9FA'
            }}
          >
            <Bookmark className="w-5 h-5" />
            Save
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all ml-auto"
            style={{ color: '#5F6368', backgroundColor: '#F8F9FA' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8E8E8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
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
        postContent={blog.excerpt}
        title={blog.title}
        contentType="blog"
        contentId={blog.id}
      />
    </div>
  )
}
