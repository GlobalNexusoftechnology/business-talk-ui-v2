# Demo Credentials

This document contains demo credentials that can be used to test the Businesstalk24 application without a backend server.

## Quick Start

The application comes with mock authentication enabled by default. You can use the following demo credentials to login and access the application:

### ✅ Admin User
- **Email**: `admin@demo.com`
- **Password**: `Admin@123`
- **Access**: Full admin dashboard with all management features
- **Features**: 
  - User management
  - Post moderation
  - Analytics and reports
  - Settings and configuration
  - Content management (Blogs, Stories, etc.)

### ✅ Regular User
- **Email**: `user@demo.com`
- **Password**: `User@123`
- **Access**: User dashboard with personal features
- **Features**:
  - Create and manage posts
  - View profile and notifications
  - Connect with other users
  - Send and receive messages
  - View blogs and groups

---

## How It Works

The application includes a **mock authentication system** (`src/lib/mockData.ts`) that validates login credentials without requiring a backend server. 

### Benefits of Mock Auth
✅ **Instant Testing** - No backend setup required  
✅ **Role-Based Access** - Different dashboards for admin vs regular users  
✅ **Persistent Sessions** - Credentials stored in localStorage  
✅ **Easy to Switch** - Toggle between demo accounts immediately  

### Disabling Mock Auth

To use a real backend API instead of mock authentication, set the environment variable:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

Then configure your API endpoint:

```env
NEXT_PUBLIC_API_URL=https://your-api-server.com/api
```

---

## Mock User Details

### Admin User Profile
- **Name**: Admin Demo
- **Username**: Admin User
- **Role**: ADMIN
- **Phone**: +1234567890
- **Location**: New York, USA
- **Bio**: Platform Administrator
- **Avatar**: Auto-generated avatar
- **Account Created**: ~1 year ago
- **Followers**: 150
- **Following**: 42

### Regular User Profile
- **Name**: John Demo
- **Username**: Demo User
- **Role**: USER
- **Phone**: +1234567891
- **Location**: San Francisco, USA
- **Bio**: Business professional and networking enthusiast
- **Avatar**: Auto-generated avatar
- **Account Created**: ~6 months ago
- **Followers**: 87
- **Following**: 124

---

## Testing Workflow

### 1. Login as Admin
```
1. Open http://localhost:3000/login
2. Enter: admin@demo.com / Admin@123
3. You'll be redirected to /admin/dashboard
4. Explore admin features (Users, Posts, Analytics, etc.)
```

### 2. Logout & Switch User
```
1. Click profile menu (top right)
2. Click "Logout"
3. Login with user@demo.com / User@123
4. You'll be redirected to /dashboard (user dashboard)
5. Explore user features (Posts, Notifications, Messages, etc.)
```

### 3. Test Different Pages
- **Admin**: `/admin/dashboard`, `/admin/users`, `/admin/posts`, `/admin/reports`
- **User**: `/dashboard`, `/profile`, `/notifications`, `/messages`, `/people`

---

## File Structure

Mock authentication files:
```
src/
├── lib/
│   ├── mockData.ts          ← Demo users & credentials
│   └── api-client.ts        ← Updated to support mock auth
├── redux/
│   └── slices/
│       └── authSlice.ts     ← Authentication state management
```

---

## Notes

- Both demo accounts have full profiles (no need to complete profile)
- Session data persists in localStorage
- Clear browser cache/localStorage to reset
- Mock tokens are valid for 30 days
- In production, disable mock auth and use real API

---

## Troubleshooting

**Can't login with demo credentials?**
- Check that `NEXT_PUBLIC_USE_MOCK_AUTH` is not explicitly set to `false`
- Clear localStorage: Open DevTools → Application → Local Storage → Clear All
- Refresh the page

**Want to use real backend instead?**
- Set `NEXT_PUBLIC_USE_MOCK_AUTH=false` in `.env.local`
- Ensure your backend is running on `http://localhost:8000/api`
- Or configure `NEXT_PUBLIC_API_URL` to point to your server

**Need to add more demo users?**
- Edit `src/lib/mockData.ts`
- Add new entries to `mockUsers` array
- Update `getMockUserByCredentials()` to recognize new credentials

