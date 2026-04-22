/**
 * UNIVERSAL CONTENT VIEWER - QUICK START GUIDE
 * 
 * Everything you need to get started in 5 minutes
 */

// ============================================================================
// OPTION 1: SIMPLE (No Context, Local Hook)
// ============================================================================

/*
Best for: Single component or specific features

1. Import hook and component:

import { useContentViewer } from '@/hooks/useContentViewer'
import { UniversalContentViewer } from '@/components/shared/UniversalContentViewer'

2. Use in your component:

export function MyFeed() {
  const { isOpen, currentType, currentData, open, close } = useContentViewer()

  return (
    <>
      <button onClick={() => open('post', { id: '1', content: 'Hello' })}>
        Click to view post
      </button>

      <UniversalContentViewer
        isOpen={isOpen}
        type={currentType}
        data={currentData}
        onClose={close}
      />
    </>
  )
}

That's it! Works on desktop (modal) and mobile (navigation) automatically.
*/

// ============================================================================
// OPTION 2: RECOMMENDED (Global Context Provider)
// ============================================================================

/*
Best for: App-wide content viewing (Instagram/LinkedIn style)

Step 1: Wrap app in provider at root level
File: app/layout.tsx

import { ContentViewerProviderWithContext } from '@/providers/ContentViewerProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ContentViewerProviderWithContext>
          {children}
        </ContentViewerProviderWithContext>
      </body>
    </html>
  )
}

Step 2: Use anywhere in app
Any component, any level, no prop drilling:

import { useOpenContent } from '@/hooks/useOpenContent'

function PostCard({ post }) {
  const { openPost } = useOpenContent()
  
  return (
    <div onClick={() => openPost(post)}>
      {post.content}
    </div>
  )
}

Done! Modal works everywhere automatically.
*/

// ============================================================================
// OPTION 3: EXISTING COMPONENT INTEGRATION
// ============================================================================

/*
If you have existing component like FeedPost:

Old usage:
<FeedPost {...props} />

New usage with viewer built-in:
<FeedPostWithViewer {...props} />

That's it! FeedPostWithViewer has everything configured.
*/

// ============================================================================
// QUICK REFERENCE: OPENING DIFFERENT CONTENT TYPES
// ============================================================================

import { useOpenContent } from '@/hooks/useOpenContent'

function Examples() {
  const { openPost, openBlog, openQuestion, openStory } = useOpenContent()

  return (
    <>
      {/* Open a post */}
      <button onClick={() => openPost({
        id: '1',
        author: { name: 'John', title: 'CEO', avatar: '/avatar.png' },
        content: 'My cool post',
        timestamp: 'now',
        likes: 10,
        comments: 2,
        sends: 1
      })}>
        View Post
      </button>

      {/* Open a blog */}
      <button onClick={() => openBlog({
        id: '2',
        author: { name: 'Jane', title: 'Writer', avatar: '/avatar.png' },
        storyTitle: 'Tech Tips',
        excerpt: 'How to code...',
        category: 'Tech',
        readTime: '5 min',
        views: 100,
        comments: 5
      })}>
        Read Blog
      </button>

      {/* Open a question */}
      <button onClick={() => openQuestion({
        id: '3',
        author: { name: 'Mike', title: 'Dev', avatar: '/avatar.png' },
        question: 'How to use React?',
        tags: ['React', 'JS'],
        answers: 3,
        views: 50
      })}>
        View Question
      </button>

      {/* Open a story */}
      <button onClick={() => openStory({
        id: '4',
        author: { name: 'Sarah', title: 'Designer', avatar: '/avatar.png' },
        storyTitle: 'My Day',
        excerpt: 'Today was...',
        category: 'Lifestyle',
        readTime: '3 min',
        views: 200,
        comments: 10
      })}>
        Read Story
      </button>
    </>
  )
}

// ============================================================================
// RESPONSIVE BEHAVIOR (Automatic)
// ============================================================================

/*
NO CONFIGURATION NEEDED. It's automatic:

DESKTOP (≥ 768px):
- Centered modal popup
- Max width 700px
- Backdrop blur effect
- Click outside to close
- ESC to close
- Content is scrollable

MOBILE (< 768px):
- Full-page navigation
- Routes: /post/id, /blog/id, etc.
- Native browser back button
- SEO friendly URLs

All happens automatically based on screen size!
*/

// ============================================================================
// REQUIRED MOBILE ROUTES
// ============================================================================

/*
Create one file per content type:

1. app/(user)/post/[id]/page.tsx
2. app/(user)/blog/[id]/page.tsx
3. app/(user)/question/[id]/page.tsx
4. app/(user)/story/[id]/page.tsx

See ROUTING_STRUCTURE.ts for templates.

These pages display the same content using ViewCard components.
*/

// ============================================================================
// CSS REQUIREMENTS
// ============================================================================

/*
You need Tailwind CSS with:
- rounded-2xl (border radius)
- backdrop-blur-sm (blur effect)
- max-w-2xl (max width)
- Fixed positioning
- Flexbox/Grid utilities

All these are standard Tailwind. NO custom CSS needed.
*/

// ============================================================================
// ACCESSIBILITY (Automatic)
// ============================================================================

/*
Already included:
✅ ARIA labels and roles
✅ Focus management
✅ ESC key support
✅ Click outside to close
✅ Semantic HTML
✅ Screen reader friendly

No work needed!
*/

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Open from button
function Example1() {
  const { openPost } = useOpenContent()
  return <button onClick={() => openPost(data)}>View</button>
}

// Pattern 2: Open from card click
function Example2() {
  const { openPost } = useOpenContent()
  return <div onClick={() => openPost(data)}>Click card</div>
}

// Pattern 3: Open from image click
function Example3() {
  const { openPost } = useOpenContent()
  return <img onClick={() => openPost(data)} />
}

// Pattern 4: Programmatic open
function Example4() {
  const { openPost } = useOpenContent()
  useEffect(() => {
    // Auto-open on page load
    openPost(data)
  }, [])
}

// Pattern 5: Multiple content types in feed
function Example5() {
  const { openPost, openBlog } = useOpenContent()
  
  items.map(item => (
    item.type === 'post' ? (
      <div onClick={() => openPost(item)}>Post</div>
    ) : (
      <div onClick={() => openBlog(item)}>Blog</div>
    )
  ))
}

// ============================================================================
// TROUBLESHOOTING: 3 THINGS TO CHECK
// ============================================================================

/*
1. Is modal showing but content is wrong?
   → Check ContentData has all required fields
   → Verify data structure matches type (post vs blog vs question vs story)

2. Is mobile navigation not working?
   → Create the required routes (/post/[id], etc.)
   → Check window.innerWidth is < 768px
   → Verify useRouter is available

3. Is styling broken?
   → Check Tailwind CSS is enabled
   → Verify backdrop-blur-sm is working
   → Test in latest browser (Chrome, Firefox, Safari)
*/

// ============================================================================
// THAT'S IT!
// ============================================================================

/*
You now have:
✅ Desktop modal viewer
✅ Mobile page navigation
✅ Type-safe content system
✅ Reusable hook
✅ Production-ready code
✅ SEO friendly
✅ Accessible

Start using it now!
*/

export {}
