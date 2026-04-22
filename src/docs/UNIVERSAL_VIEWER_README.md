# Universal Content Viewer System

A production-ready, reusable system for viewing different content types (Posts, Blogs, Questions, Stories) across your application with responsive behavior for desktop and mobile.

## 🎯 Features

- **Multi-content support**: Post, Blog, Question, Story types
- **Responsive design**: Modal on desktop/tablet, full-page navigation on mobile
- **Accessible**: ARIA labels, focus management, keyboard shortcuts (ESC to close)
- **Reusable hook**: `useContentViewer` for state management
- **Lightweight**: No external state management required
- **Type-safe**: Full TypeScript support
- **Mobile-first**: Optimized routing structure for mobile-first approach

## 📁 File Structure

```
src/
├── hooks/
│   └── useContentViewer.ts                    # State management hook
├── components/
│   ├── shared/
│   │   ├── UniversalContentViewer.tsx         # Main modal component
│   │   ├── viewer-cards/
│   │   │   ├── PostViewCard.tsx               # Post display
│   │   │   ├── BlogViewCard.tsx               # Blog display
│   │   │   ├── QuestionViewCard.tsx           # Question display
│   │   │   └── StoryViewCard.tsx              # Story display
│   │   └── ShareModal.tsx                     # (existing)
│   └── user/
│       └── FeedPostWithViewer.tsx             # Example implementation
└── docs/
    ├── ROUTING_STRUCTURE.ts                   # Mobile routing setup
    └── INTEGRATION_EXAMPLES.tsx               # Usage patterns
```

## 🚀 Quick Start

### 1. Import the hook and component

```tsx
import { useContentViewer } from '@/hooks/useContentViewer'
import { UniversalContentViewer } from '@/components/shared/UniversalContentViewer'
```

### 2. Use in your component

```tsx
export function MyFeed() {
  const { isOpen, currentType, currentData, open, close } = useContentViewer()

  return (
    <>
      {/* Your content components */}
      <button onClick={() => open('post', { id: '1', content: '...' })}>
        View Post
      </button>

      {/* Viewer modal */}
      <UniversalContentViewer
        isOpen={isOpen}
        type={currentType}
        data={currentData}
        onClose={close}
      />
    </>
  )
}
```

## 📱 Responsive Behavior

### Desktop/Tablet (≥ 768px)
- Content opens in centered modal
- Max width: 700px (max-w-2xl)
- Backdrop blur with dark overlay
- Click outside to close
- ESC key to close
- Scrollable content area

### Mobile (< 768px)
- Content navigates to dedicated page
- Routes: `/post/[id]`, `/blog/[id]`, `/question/[id]`, `/story/[id]`
- Full-screen view
- Native navigation (back button on browser)
- SEO friendly URLs

## 🔧 API Reference

### useContentViewer Hook

```tsx
const {
  isOpen,              // boolean - Modal state
  currentType,         // ContentType | null - Current content type
  currentData,         // ContentData | null - Current content data
  open,               // (type, data) => void - Open modal
  close,              // () => void - Close modal
  setContent          // (type, data) => void - Set content and open
} = useContentViewer()
```

### ContentType

```tsx
type ContentType = 'post' | 'blog' | 'question' | 'story'
```

### ContentData

```tsx
interface ContentData {
  id: string
  [key: string]: any  // Dynamic properties based on type
}
```

## 📋 Expected Data Structure by Type

### Post Data
```tsx
{
  id: string
  author: { name: string; title: string; avatar: string }
  content: string
  image?: string
  video?: string
  timestamp: string
  likes: number
  comments: number
  sends: number
}
```

### Blog Data
```tsx
{
  id: string
  author: { name: string; title: string; avatar: string }
  storyTitle: string
  excerpt: string
  coverImage?: string
  timestamp: string
  readTime: string
  category: string
  views: number
  comments: number
}
```

### Question Data
```tsx
{
  id: string
  author: { name: string; title: string; avatar: string }
  question: string
  description?: string
  tags?: string[]
  timestamp: string
  answers: number
  views: number
  answersList?: Answer[]
}
```

### Story Data
```tsx
{
  id: string
  author: { name: string; title: string; avatar: string }
  storyTitle: string
  excerpt: string
  coverImage?: string
  timestamp: string
  readTime: string
  category: string
  views: number
  comments: number
}
```

## 🌍 Mobile Routing Setup

Create these page files in your app directory:

### `/app/(user)/post/[id]/page.tsx`
```tsx
'use client'
import { useParams } from 'next/navigation'
import { PostViewCard } from '@/components/shared/viewer-cards/PostViewCard'

export default function PostPage() {
  const params = useParams()
  const id = params.id as string
  
  // Fetch post data
  const postData = { /* ... */ }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <PostViewCard data={postData} />
      </div>
    </div>
  )
}
```

Repeat for `/blog/[id]`, `/question/[id]`, `/story/[id]`.

See `ROUTING_STRUCTURE.ts` for complete examples.

## ♿ Accessibility Features

- ✅ ARIA labels and roles (`aria-modal`, `role="dialog"`)
- ✅ Focus management (focus stays inside modal)
- ✅ Keyboard navigation (ESC to close)
- ✅ Screen reader friendly labels
- ✅ Semantic HTML structure
- ✅ backdrop-filter for visual affordance

## 🎨 Customization

### Change Modal Size
Edit `UniversalContentViewer.tsx`:
```tsx
className="relative w-full mx-4 max-w-2xl ..."  // Change max-w-2xl
```

### Change Border Radius
```tsx
className="... rounded-2xl ..."  // Change rounded-2xl
```

### Add Animation
Install framer-motion and wrap modal in `motion.div`:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="relative w-full mx-4 max-w-2xl ..."
>
```

### Add Loading State
Add skeleton loading in viewer cards:
```tsx
{isLoading ? <Skeleton /> : <PostViewCard data={data} />}
```

## 🔗 Integration Example

```tsx
import { FeedPostWithViewer } from '@/components/user/FeedPostWithViewer'
import { useContentViewer } from '@/hooks/useContentViewer'
import { UniversalContentViewer } from '@/components/shared/UniversalContentViewer'

export function MyDashboard() {
  const { isOpen, currentType, currentData, close } = useContentViewer()

  const posts = [/* ... */]

  return (
    <>
      <div className="space-y-4">
        {posts.map(post => (
          <FeedPostWithViewer key={post.id} {...post} />
        ))}
      </div>

      <UniversalContentViewer
        isOpen={isOpen}
        type={currentType}
        data={currentData}
        onClose={close}
      />
    </>
  )
}
```

## 🔐 Type Safety

Full TypeScript support ensures:
- Content types are validated at compile time
- Data structure matching by type
- IntelliSense support in IDE
- Runtime safety with proper error handling

## 📊 Performance Considerations

- **Lazy loading**: Content only renders when modal opens
- **Memory efficient**: Single modal instance across app
- **No unnecessary re-renders**: Uses useCallback for handlers
- **Mobile optimization**: No modal DOM on mobile devices

## 🐛 Troubleshooting

### Modal not appearing
- Check that `isOpen` is properly passed
- Verify `type` and `data` are not null
- Ensure component is not conditionally rendered on mobile

### Mobile navigation not working
- Verify routes exist: `/post/[id]`, `/blog/[id]`, etc.
- Check window.innerWidth detection
- Ensure useRouter is available (client component)

### Styling issues
- Check Tailwind CSS is enabled
- Verify dark overlay CSS: `backgroundColor: 'rgba(0, 0, 0, 0.5)'`
- Test backdrop blur: `backdrop-blur-sm`

## 🚦 Next Steps

1. **Create mobile routes** following `ROUTING_STRUCTURE.ts`
2. **Implement data fetching** in mobile pages
3. **Add animations** using Framer Motion
4. **Add loading states** in viewer cards
5. **Integrate with API** for dynamic content
6. **Add analytics** to track content opens

## 📝 License

Part of business-talk-UI project. Internal use only.

---

**Questions?** See `INTEGRATION_EXAMPLES.tsx` for more patterns and use cases.
