/**
 * UNIVERSAL CONTENT VIEWER - IMPLEMENTATION CHECKLIST
 * 
 * Follow this checklist to fully implement the system in your app
 */

// ============================================================================
// STEP 1: SET UP GLOBAL PROVIDER (app/layout.tsx)
// ============================================================================

/*
'use client'

import { ContentViewerProviderWithContext } from '@/providers/ContentViewerProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ContentViewerProviderWithContext>
          {children}
        </ContentViewerProviderWithContext>
      </body>
    </html>
  )
}
*/

// ============================================================================
// STEP 2: CREATE MOBILE ROUTES
// ============================================================================

/*
Create these files:

app/(user)/post/[id]/page.tsx
app/(user)/blog/[id]/page.tsx
app/(user)/question/[id]/page.tsx
app/(user)/story/[id]/page.tsx

Use templates from ROUTING_STRUCTURE.ts
*/

// ============================================================================
// STEP 3: UPDATE EXISTING COMPONENTS
// ============================================================================

/*
Replace your existing FeedPost component with:

import { FeedPostWithViewer } from '@/components/user/FeedPostWithViewer'

// Old: <FeedPost {...props} />
// New:
<FeedPostWithViewer {...props} />

Same for BlogCard, QuestionPost, StoryPost interactions
*/

// ============================================================================
// STEP 4: ADD CONTENT OPENS TO EXISTING COMPONENTS
// ============================================================================

/*
In any component that displays content:

'use client'

import { useOpenContent } from '@/hooks/useOpenContent'  // Import custom hook

function MyComponent() {
  const { openPost, openBlog, openQuestion, openStory } = useOpenContent()
  
  return (
    // Option 1: Click to open
    <div onClick={() => openPost({ id: '123', content: '...' })}>
      View post
    </div>
    
    // Option 2: Button handler
    <button onClick={() => openBlog({ id: '456', storyTitle: '...' })}>
      Read blog
    </button>
  )
}
*/

// ============================================================================
// REAL-WORLD EXAMPLE: FEED PAGE
// ============================================================================

/*
File: app/(user)/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { FeedPostWithViewer } from '@/components/user/FeedPostWithViewer'
import { useOpenContent } from '@/hooks/useOpenContent'

interface FeedItem {
  id: string
  type: 'post' | 'blog' | 'question' | 'story'
  data: any
}

export default function DashboardPage() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { openPost, openBlog, openQuestion, openStory } = useOpenContent()

  useEffect(() => {
    // Fetch feed from API
    fetchFeed()
  }, [])

  async function fetchFeed() {
    try {
      const response = await fetch('/api/feed')
      const data = await response.json()
      setFeed(data.items)
    } catch (error) {
      console.error('Failed to load feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenContent = (item: FeedItem) => {
    switch (item.type) {
      case 'post': openPost(item.data); break
      case 'blog': openBlog(item.data); break
      case 'question': openQuestion(item.data); break
      case 'story': openStory(item.data); break
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {feed.map(item => (
          <div
            key={item.id}
            onClick={() => handleOpenContent(item)}
            className="cursor-pointer"
          >
            {item.type === 'post' && (
              <FeedPostWithViewer {...item.data} />
            )}
            {item.type === 'blog' && (
              <BlogCardWithViewer {...item.data} />
            )}
            {item.type === 'question' && (
              <QuestionPostWithViewer {...item.data} />
            )}
            {item.type === 'story' && (
              <StoryPostWithViewer {...item.data} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
*/

// ============================================================================
// FEATURE: ADD NAVIGATION BETWEEN CONTENT
// ============================================================================

/*
File: src/components/shared/UniversalContentViewerWithNav.tsx

Advanced version with:
- Next/Previous buttons
- Keyboard arrow navigation
- Sequential browsing through feed
- Current position indicator (e.g., "2 of 10")

Usage: Enhance existing UniversalContentViewer with this
*/

// ============================================================================
// FEATURE: ADD QUICK ACTIONS IN MODAL
// ============================================================================

/*
File: src/hooks/useModalActions.ts

export function useModalActions() {
  const { currentData } = useGlobalContentViewer()
  
  const handleLike = async () => {
    if (!currentData?.id) return
    
    try {
      await fetch(`/api/content/${currentData.id}/like`, { method: 'POST' })
      // Optimistic UI update
    } catch (error) {
      console.error('Failed to like:', error)
    }
  }
  
  const handleShare = () => {
    if (navigator.share && currentData) {
      navigator.share({
        title: currentData.title || 'Check this out',
        text: currentData.content || currentData.excerpt,
        url: window.location.href
      })
    }
  }
  
  return { handleLike, handleShare }
}

// Usage in viewer card:
function PostViewCardWithActions() {
  const { handleLike, handleShare } = useModalActions()
  
  return (
    <>
      <button onClick={handleLike}>👍 Like</button>
      <button onClick={handleShare}>📤 Share</button>
    </>
  )
}
*/

// ============================================================================
// FEATURE: ANALYTICS TRACKING
// ============================================================================

/*
File: src/hooks/useModalAnalytics.ts

export function useModalAnalytics() {
  const { isOpen, currentType, currentData } = useGlobalContentViewer()
  
  useEffect(() => {
    if (isOpen && currentType && currentData) {
      // Track view
      trackEvent('content_viewed', {
        contentType: currentType,
        contentId: currentData.id,
        timestamp: new Date().toISOString()
      })
      
      // Track engagement time
      const startTime = Date.now()
      
      return () => {
        const engagementTime = Date.now() - startTime
        trackEvent('content_engagement', {
          contentType: currentType,
          contentId: currentData.id,
          engagementTime
        })
      }
    }
  }, [isOpen, currentType, currentData])
}
*/

// ============================================================================
// TESTING
// ============================================================================

/*
File: src/__tests__/UniversalContentViewer.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UniversalContentViewer } from '@/components/shared/UniversalContentViewer'

describe('UniversalContentViewer', () => {
  it('should render modal when isOpen is true', () => {
    render(
      <UniversalContentViewer
        isOpen={true}
        type="post"
        data={{ id: '1', content: 'Test' }}
        onClose={() => {}}
      />
    )
    
    // Verify content is in document
  })

  it('should close on ESC key', async () => {
    const onClose = jest.fn()
    render(
      <UniversalContentViewer
        isOpen={true}
        type="post"
        data={{ id: '1', content: 'Test' }}
        onClose={onClose}
      />
    )
    
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('should close on backdrop click', async () => {
    const onClose = jest.fn()
    const { container } = render(
      <UniversalContentViewer
        isOpen={true}
        type="post"
        data={{ id: '1', content: 'Test' }}
        onClose={onClose}
      />
    )
    
    const backdrop = container.querySelector('[role="presentation"]')
    if (backdrop) {
      await userEvent.click(backdrop)
      expect(onClose).toHaveBeenCalled()
    }
  })
})
*/

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/*
Use React.memo for viewer cards:

export const PostViewCard = React.memo(PostViewCardComponent)
export const BlogViewCard = React.memo(BlogViewCardComponent)

Lazy load heavy content:

const HeavyComponent = lazy(() => import('./HeavyComponent'))

Use useCallback in hooks:

const open = useCallback((type, data) => {
  // implementation
}, [])
*/

// ============================================================================
// TROUBLESHOOTING GUIDE
// ============================================================================

/*
1. Modal not appearing on desktop
   - Check useContentViewer is returning isOpen=true
   - Verify type and data are not null
   - Check console for errors
   - Test with hardcoded data

2. Mobile navigation not working
   - Verify routes exist: /post/[id], /blog/[id], etc.
   - Check isMobile detection: window.innerWidth detection
   - Ensure useRouter is available
   - Test with actual mobile device or DevTools

3. Styling issues
   - Verify Tailwind CSS is configured
   - Check bg-gray-50, max-w-2xl classes are working
   - Test backdrop-blur-sm on browser (Chrome 76+)
   - Add fallback backdrop: rgba(0, 0, 0, 0.5)

4. Accessibility issues
   - Test keyboard navigation (Tab, ESC)
   - Run accessibility audit in DevTools
   - Check ARIA attributes present
   - Test with screen reader (NVDA, JAWS)

5. Performance issues
   - Check Network tab for duplicate API calls
   - Use React DevTools Profiler
   - Memoize components and callbacks
   - Lazy load heavy components

6. Type errors
   - Ensure ContentData has all required fields
   - Check data structure matches expected interface
   - Use TypeScript strict mode
   - Add proper error boundaries
*/

// ============================================================================
// FUTURE ENHANCEMENTS
// ============================================================================

/*
1. Carousel/Carousel navigation between content
2. Infinite scroll within modal
3. Comments section directly in modal
4. Like/Share quick actions
5. Full-screen immersive mode
6. Gesture support (swipe to close, swipe to navigate)
7. Dark mode support
8. Custom themes per content type
9. Embedded reactions (emojis)
10. Progressive image loading
*/

export {}
