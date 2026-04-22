# Universal Content Viewer - System Architecture

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Application                             │
│  (app/layout.tsx wrapped with ContentViewerProvider)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            ContentViewerProviderWithContext                  │
│  (Optional global provider for app-wide access)             │
│                                                             │
│  - useGlobalContentViewer()                                │
│  - useOpenContent() [post, blog, question, story]          │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┴──────────────────┐
           │                                     │
           ▼                                     ▼
    ┌─────────────────┐              ┌──────────────────────┐
    │  User Component │              │ UniversalContentViewer
    │                 │              │                     │
    │ - onClick handler─────────────>│ - Detects mobile/   │
    │ - useOpenContent()             │   desktop          │
    │ - openPost()                   │ - Modal on desktop  │
    │ - openBlog()                   │ - Navigate on mobile│
    │ - openQuestion()               │ - Renders content   │
    │ - openStory()                  │ - Handles close     │
    │                 │              └──────────────────────┘
    └─────────────────┘                        │
                                   ┌───────────┴──────────────┐
                                   │                          │
                    ┌──────────────────────────────┐          │
                    │   Content Type Detection     │          │
                    │                              │          │
                    │   type === 'post'    ───────┼──────────┼─────────────┐
                    │   type === 'blog'    ───────┼──────────┼─────────────┤
                    │   type === 'question'───────┼──────────┼─────────────┤
                    │   type === 'story'   ───────┼──────────┼─────────────┘
                    └──────────────────────────────┘          │
                                                   │          │
                              ┌────────────────────┼──────────┘
                              │                    │
                   ┌──────────────────┐  ┌─────────────────────┐
                   │ DESKTOP VIEW     │  │ MOBILE VIEW        │
                   │ (Modal Popup)    │  │ (Page Navigation)  │
                   └──────────────────┘  └─────────────────────┘
                              │                    │
              ┌───────────────┴────────────┐      │
              │                            │      │
         ┌─────────────┐          ┌──────────────┐│
         │   ViewCard  │          │   Routing    ││
         │ Components  │          │              ││
         │             │          ├──────────────┤│
         │ - PostView  │          │ /post/[id]   ││
         │ - BlogView  │          │ /blog/[id]   ││
         │ - QuestionView         │ /question/[id]
         │ - StoryView │          │ /story/[id]  ││
         └─────────────┘          └──────────────┘│
                                                   │
                              render same          │
                              ViewCard here ──────┘
```

## 🔄 Data Flow

### Desktop Flow
```
User Click
    ↓
useOpenContent.openPost(data)
    ↓
UniversalContentViewer.open('post', data)
    ↓
State updated: {isOpen: true, type: 'post', data: {...}}
    ↓
UniversalContentViewer detects: ✓ Desktop (width >= 768px)
    ↓
Render Modal with PostViewCard(data)
    ↓
User clicks close / ESC / outside
    ↓
Modal closed
```

### Mobile Flow
```
User Click
    ↓
useOpenContent.openPost(data)
    ↓
UniversalContentViewer.open('post', data)
    ↓
State updated: {isOpen: true, type: 'post', data: {...}}
    ↓
UniversalContentViewer detects: ✗ Mobile (width < 768px)
    ↓
router.push('/post/[id]')
    ↓
Navigate to mobile page
    ↓
Mobile page renders PostViewCard(data)
    ↓
User clicks browser back button
    ↓
Return to previous page
```

## 🎯 Component Hierarchy

```
App Root
├── ContentViewerProvider
│   └── {children}
│       ├── FeedPage
│       │   ├── FeedPostWithViewer #1
│       │   ├── FeedPostWithViewer #2
│       │   └── FeedPostWithViewer #3
│       │
│       └── UniversalContentViewer (Global)
│           ├── PostViewCard
│           ├── BlogViewCard
│           ├── QuestionViewCard
│           └── StoryViewCard

Mobile Routes
├── /post/[id]
│   └── PostViewCard
├── /blog/[id]
│   └── BlogViewCard
├── /question/[id]
│   └── QuestionViewCard
└── /story/[id]
    └── StoryViewCard
```

## 📊 State Management

```
useContentViewer() / useOpenContent()
    ↓
    ├── isOpen: boolean
    ├── currentType: ContentType | null
    ├── currentData: ContentData | null
    ├── open: (type, data) => void
    ├── close: () => void
    └── setContent: (type, data) => void

Global (via Context):
    ├── ContentViewerContext
    ├── useGlobalContentViewer()
    └── useOpenContent()
```

## 🔌 Integration Points

### With Existing Components
```
Old Component
    └─── Props ──────┬─────────────────┐
                     │                 │
                FeedPost          BlogCard
                     │                 │
                     └──────┬──────────┘
                            ↓
                   Update to use:
                   
                   ├─ FeedPostWithViewer
                   ├─ BlogCardWithViewer
                   ├─ QuestionPostWithViewer
                   └─ StoryPostWithViewer

Or manually add hooks:

    Function Component
         ↓
    import useOpenContent
         ↓
    const { openPost } = useOpenContent()
         ↓
    onClick={() => openPost(data)}
```

## 📱 Responsive Detection

```
window.innerWidth >= 768px
    ├─ YES → Desktop Path
    │   ├─ Render Modal
    │   ├─ Show UniversalContentViewer
    │   └─ Block route navigation
    │
    └─ NO → Mobile Path
        ├─ Navigate to route
        ├─ Skip modal rendering
        └─ Render full-page view
```

## 🎨 CSS Class Structure

```
UniversalContentViewer (fixed inset-0 z-50)
├── Backdrop (backdrop-blur-sm)
│   └── Modal (max-w-2xl rounded-2xl)
│       ├── Close Button (absolute top-4 right-4)
│       └── Content Area (overflow-y-auto)
│           └── ViewCard Component
│               ├── Header
│               ├── Media
│               └── Actions
```

## 🔐 Type Safety Flow

```
ContentType ('post' | 'blog' | 'question' | 'story')
    ↓
ContentData { id: string, [key]: any }
    ↓
Specific ViewCard Props
    ├─ PostViewCardProps
    ├─ BlogViewCardProps
    ├─ QuestionViewCardProps
    └─ StoryViewCardProps
    ↓
Render Content
```

## ⚡ Performance Optimization

```
Component
    ├─ useCallback → handlers always same reference
    ├─ useRef → modal ref doesn't trigger re-render
    ├─ Event Delegation → one modal for all content
    └─ Lazy Loading → content loads when modal opens

Result:
├─ Single modal instance
├─ No duplicate DOM nodes
├─ Minimal re-renders
└─ Optimal performance
```

## 🚨 Event Handling

```
User Interaction
    ├─ Click Post ──────────→ open('post', data)
    ├─ Click Image ─────────→ open('post', data)
    ├─ ESC Key ─────────────→ close()
    ├─ Click Backdrop ──────→ close()
    ├─ Click Close Button ──→ close()
    └─ Swipe (future) ──────→ close()
```

## 🔄 Modal State Transitions

```
           ┌──────────────┐
           │    CLOSED    │
           │ isOpen=false │
           └──────────────┘
                  ▲
                  │ close()
                  │ ESC
                  │ Click outside
                  │
           ┌──────────────┐
         ┌─┤   OPENING    │
         │ │ isOpen=true  │
         │ │ type/data set│
         │ └──────────────┘
         │        ▲
         │        │ open(type, data)
         │        │
    Mobile│   Desktop
    route │        │
         │        ▼
         │ ┌──────────────┐
         └─┤    MODAL     │
           │   VISIBLE    │
           │ Render View  │
           └──────────────┘
```

## 📚 File Dependencies

```
useOpenContent.ts
    └── useGlobalContentViewer
        └── ContentViewerContext
            └── useContentViewer (hook)
                └── React hooks (useState, useCallback)

UniversalContentViewer.tsx
    ├── useRouter (Next.js)
    ├── useRef, useEffect, useState
    ├── PostViewCard
    ├── BlogViewCard
    ├── QuestionViewCard
    └── StoryViewCard

ViewCard Components
    └── index.ts (exports ContentData)
        └── Icons from lucide-react
```

---

This architecture ensures:
✅ Clean separation of concerns
✅ Reusable components
✅ Type safety throughout
✅ Automatic responsive behavior
✅ Production-ready code
✅ Easy to maintain and extend
