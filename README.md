# Business Talk 24 Platform UI

A production-ready SaaS platform UI for professional networking, built with Next.js 15, React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Authentication System
- **Login Page**: Email/password authentication with Google OAuth
- **Signup Page**: User registration with form validation
- **Complete Profile Flow**: Post-signup profile completion with profile photo, skills, and experience
- **Protected Routes**: Role-based access control (USER/ADMIN)

### User Dashboard
- **Dashboard**: Welcome section with stats cards, feed, and suggested users
- **Profile**: Editable user profile with skills, experience, and bio
- **Messages**: Real-time chat interface with WebSocket support
- **People**: User discovery and connection system
- **Groups**: Create and join groups with other professionals
- **Blogs**: Read and write blogs within the platform
- **Notifications**: Real-time notifications for likes, comments, follows
- **Settings**: Account, privacy, notifications, and connection settings

### Admin Dashboard
- **Dashboard**: KPI cards, charts (User Growth, Revenue, Roles Distribution), and activity logs
- **Users Management**: Complete user management with search, filtering, sorting, and CRUD operations
- **Posts**: Manage and moderate user posts
- **Moderation**: Content moderation queue for flagged content
- **Stories**: Manage user stories
- **Blogs**: Manage blog content
- **Reports**: Handle user reports and moderation actions
- **Email Marketing**: Campaign management interface
- **Notifications**: Admin notification management
- **Advertisements**: Ad creation and tracking
- **Analytics**: Advanced analytics and insights
- **Revenue**: Revenue tracking and management
- **Roles**: Role-based access control management
- **Settings**: System configuration

### Legal Pages
- **Privacy Policy**: Comprehensive privacy policy
- **User Agreement**: Terms of service and user agreements

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── complete-profile/
│   ├── (user)/              # User dashboard routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── messages/
│   │   ├── people/
│   │   ├── groups/
│   │   ├── blogs/
│   │   ├── notifications/
│   │   └── settings/
│   ├── (admin)/             # Admin dashboard routes
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── posts/
│   │       ├── moderation/
│   │       ├── stories/
│   │       ├── blogs/
│   │       ├── reports/
│   │       ├── email-marketing/
│   │       ├── notifications/
│   │       ├── advertisements/
│   │       ├── analytics/
│   │       ├── revenue/
│   │       ├── roles/
│   │       └── settings/
│   ├── (legal)/             # Legal pages
│   │   ├── privacy-policy/
│   │   └── user-agreement/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── shared/              # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── UserSidebar.tsx
│   │   ├── UserNavbar.tsx
│   │   ├── UserLayoutWrapper.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminNavbar.tsx
│   │   └── AdminLayoutWrapper.tsx
│   ├── auth/                # Authentication components
│   ├── dashboard/           # User dashboard components
│   ├── admin/               # Admin components
│   ├── tables/              # Table components
│   └── charts/              # Chart components (Recharts)
├── redux/
│   ├── store.ts             # Redux store configuration
│   └── slices/
│       ├── authSlice.ts     # Auth state management
│       ├── postsSlice.ts
│       ├── notificationsSlice.ts
│       └── messagesSlice.ts
├── hooks/
│   └── useRedux.ts          # Custom Redux hooks
├── lib/
│   ├── api-client.ts        # HTTP client with axios
│   ├── websocket.ts         # WebSocket manager
│   └── validations.ts       # Zod validation schemas
└── types/
    └── index.ts             # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: WebSocket
- **Charts**: Recharts
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

3. **Start development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 🔐 Authentication Flow

1. User signs up → Create account with email/password
2. Redirect to `/complete-profile` → Fill profile information
3. Redirect to `/dashboard` → Access user features
4. Admin users redirect to `/admin/dashboard`

## 🔄 State Management (Redux)

### Auth Slice
- `user`: Current user information
- `token`: Authentication token
- `isAuthenticated`: Boolean flag
- `isLoading`: Loading state
- `error`: Error messages

### Posts Slice
- `posts`: Array of posts
- `isLoading`: Loading state
- `error`: Error messages

### Notifications Slice
- `notifications`: Array of notifications
- `unreadCount`: Count of unread notifications

### Messages Slice
- `conversations`: Array of conversations
- `currentConversation`: Current chat messages

## 🌐 API Integration

The `api-client.ts` provides methods for:
- Authentication (login, signup)
- Users (profile, follow, search)
- Posts (CRUD, like)
- Messages (send, retrieve)
- Blogs (read, write)
- Admin operations
- Notifications
- And more...

## 🔌 WebSocket Integration

The `websocket.ts` utility handles:
- Real-time messaging
- Live notifications
- Admin alerts
- Connection management with auto-reconnect

**Usage**:
```typescript
import WebSocketManager from '@/lib/websocket'

const ws = new WebSocketManager() await ws.connect()
ws.on('message', (data) => console.log(data))
ws.send('chat', { userId: '123', message: 'Hello' })
```

## 📋 Form Validation

Validation schemas are defined in `lib/validations.ts` using Zod:
- `LoginSchema`
- `SignupSchema`
- `CompleteProfileSchema`
- `CreatePostSchema`
- `MessageSchema`
- `CreateBlogSchema`

## 🎨 Styling

### Tailwind CSS Configuration
- Custom color palette with `primary` and `secondary` colors
- Responsive design utilities
- Custom components (buttons, cards, badges)
- Animations and transitions

### Available Utility Classes
- `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`
- `.card`
- `.input-field`
- `.label`

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Mobile navigation with hamburger menu
- Sidebar collapses on small screens

## 🧪 Code Quality

- TypeScript for type safety
- ESLint configuration for code linting
- Proper error handling
- Loading states and skeleton loaders
- Accessible UI components

## 📚 Key Components

### Button
```tsx
<Button variant="primary|secondary|outline|danger" size="sm|md|lg" isLoading={false}>
  Click me
</Button>
```

### Input
```tsx
<Input 
  type="text|email|password"
  label="Field Label"
  error="Error message"
  helpText="Help text"
/>
```

### Card
```tsx
<Card padding="none|sm|md|lg" border hover>
  Content
</Card>
```

### Badge
```tsx
<Badge variant="primary|secondary|success|warning|danger" size="sm|md|lg">
  Label
</Badge>
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t businesstalk24 .
docker run -p 3000:3000 businesstalk24
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8000/ws` |

## 🔧 Development Tips

1. **Use Redux DevTools**: Install Redux DevTools browser extension
2. **Component Development**: Use `npm run dev` for hot reload
3. **API Testing**: Use Postman or Insomnia to test the backend API
4. **WebSocket Testing**: Use WebSocket client tools

## 📄 License

© 2024 Business Talk 24. All rights reserved.

## 👥 Contributing

Contributions are welcome! Please follow the existing code style and conventions.

## 📞 Support

For support, email support@businesstalk24.com

---

**Built with ❤️ for professionals**
