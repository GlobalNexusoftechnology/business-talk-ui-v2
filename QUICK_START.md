# 🚀 Quick Start Guide

Get the Businesstalk24 Platform UI running in 5 minutes.

---

## ⚡ Express Setup (5 minutes)

### Step 1: Navigate to Project
```powershell
cd e:\GNT_project\business-talk-UI
```

### Step 2: Install Dependencies
```powershell
npm install
```

**Expected time**: 2-3 minutes depending on internet speed.

### Step 3: Set Up Environment Variables
```powershell
# Copy the example file
Copy-Item .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_id
```

### Step 4: Start Development Server
```powershell
npm run dev
```

### Step 5: Open in Browser
Visit: **http://localhost:3000**

---

## 🎯 Test the Application

### Login Credentials (Demo)
- **Email**: demo@example.com
- **Password**: DemoPassword123!

### Test Routes

**Landing Page**:
- Home: http://localhost:3000

**Authentication** (No login required):
- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup
- Complete Profile: http://localhost:3000/complete-profile

**User Dashboard** (Login required):
- Dashboard: http://localhost:3000/dashboard
- Profile: http://localhost:3000/profile
- Messages: http://localhost:3000/messages
- People: http://localhost:3000/people
- Groups: http://localhost:3000/groups
- Blogs: http://localhost:3000/blogs
- Notifications: http://localhost:3000/notifications
- Settings: http://localhost:3000/settings

**Admin Dashboard** (Login + Admin role required):
- Overview: http://localhost:3000/admin/dashboard
- Users: http://localhost:3000/admin/users
- Posts: http://localhost:3000/admin/posts
- Moderation: http://localhost:3000/admin/moderation
- Analytics: http://localhost:3000/admin/analytics
- Revenue: http://localhost:3000/admin/revenue

**Legal Pages** (No login required):
- Privacy Policy: http://localhost:3000/privacy-policy
- User Agreement: http://localhost:3000/user-agreement

---

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code (if configured)
npm run format
```

---

## 🔧 Configuration Reference

### API Endpoints
Update `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_WS_URL` - WebSocket endpoint

### OAuth (Optional)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET` - Google OAuth secret (backend only)

### Analytics (Optional)
- `NEXT_PUBLIC_ANALYTICS_ID` - Google Analytics ID
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking

---

## 🐛 Common Issues

### Issue: "Module not found" errors
**Solution**: Delete `node_modules` and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Port 3000 already in use
**Solution**: Use different port:
```powershell
npm run dev -- -p 3001
```

### Issue: TypeScript compilation errors
**Solution**: Check for type errors:
```powershell
npx tsc --noEmit
```

### Issue: Environment variables not loading
**Solution**: Restart dev server after changing `.env.local`
```powershell
# Stop the server (Ctrl+C) and restart
npm run dev
```

---

## 🍃 Using with Docker (Optional)

### Option 1: Docker Compose (Recommended)
```powershell
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

### Option 2: Docker Manual
```powershell
# Build image
docker build -t business-talk-ui .

# Run container
docker run -p 3000:3000 --env-file .env.local business-talk-ui

# View logs
docker logs -f <container_id>
```

---

## 📁 Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js pages and layouts |
| `src/components/` | React components |
| `src/redux/` | Redux store and slices |
| `src/lib/` | Utilities (API client, validation) |
| `src/types/` | TypeScript type definitions |
| `src/hooks/` | Custom React hooks |
| `public/` | Static files |

---

## 🔐 Security Notes

### Never commit .env.local
```
# .gitignore (already configured)
.env.local
.env.*.local
```

### Token Management
- Tokens stored in localStorage (production should use httpOnly cookies)
- Tokens auto-inject via Axios interceptor
- Auto-logout on 401 response

### CORS
- Configure backend to allow requests from `http://localhost:3000`

---

## 🧪 Testing Features

### Mock Login (Without Backend)
The auth pages include placeholder forms that accept any input. To use real authentication:

1. Connect your backend API
2. Update `src/lib/api-client.ts` with real endpoints
3. Update Redux thunks in `src/redux/slices/authSlice.ts`

### Mock Data
Admin and user pages include mock data (sample users, posts, etc.). Replace with real API calls as needed.

---

## 💡 Development Tips

### Hot Module Reload
Changes to files auto-refresh in browser (built-in Next.js feature).

### Redis DevTools
Redux state visible in browser devtools (Redux DevTools extension recommended).

### TypeScript Strict Mode
All files use TypeScript strict mode - type safety enabled by default.

### Component Development
Create components in `src/components/` and import in pages.

---

## 📚 Project Documentation

- **README.md** - Full project overview
- **DEPLOYMENT.md** - Production deployment guides
- **CONTRIBUTING.md** - Code style and contribution guidelines
- **PROJECT_SUMMARY.md** - Complete feature list

---

## 🎓 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure `.env.local`
3. ✅ Start dev server (`npm run dev`)
4. ✅ Explore pages at `http://localhost:3000`
5. ✅ Review components in `src/components/`
6. ✅ Update Redux slices for your API
7. ✅ Connect to backend endpoints
8. ✅ Build for production (`npm run build`)

---

## 📞 Need Help?

Check the [comprehensive documentation](./README.md) for:
- Architecture overview
- Redux setup explanation
- API client configuration
- WebSocket integration
- Form validation guide
- Deployment guides

---

**Happy coding! 🚀**
