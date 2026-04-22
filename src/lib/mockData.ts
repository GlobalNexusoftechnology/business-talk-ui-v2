/**
 * Mock Data for Demo/Testing Purposes
 * These credentials can be used to test the application without a backend server
 */

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@demo.com',
    password: 'Admin@123',
    description: 'Admin User - Full access to admin dashboard',
  },
  user: {
    email: 'user@demo.com',
    password: 'User@123',
    description: 'Regular User - Access to user dashboard',
  },
}

export const mockUsers = [
  {
    id: 'admin-001',
    email: 'admin@demo.com',
    username: 'Admin User',
    role_id: 'ADMIN',
    first_name: 'Admin',
    last_name: 'Demo',
    phone_number: '+1234567890',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    bio: 'Platform Administrator',
    location: 'New York, USA',
    website: 'https://businesstalk24.com',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true,
    followers_count: 150,
    following_count: 42,
  },
  {
    id: 'user-001',
    email: 'user@demo.com',
    username: 'Demo User',
    role_id: 'USER',
    first_name: 'John',
    last_name: 'Demo',
    phone_number: '+1234567891',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bio: 'Business professional and networking enthusiast',
    location: 'San Francisco, USA',
    website: 'https://example.com',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true,
    followers_count: 87,
    following_count: 124,
  },
]

export const getMockUserByCredentials = (email: string, password: string) => {
  const adminCreds = DEMO_CREDENTIALS.admin
  const userCreds = DEMO_CREDENTIALS.user

  if (email === adminCreds.email && password === adminCreds.password) {
    return mockUsers[0] // admin
  }

  if (email === userCreds.email && password === userCreds.password) {
    return mockUsers[1] // regular user
  }

  return null
}

export const generateMockToken = (userId: string): string => {
  // Generate a simple mock JWT-like token
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    })
  )
  const signature = btoa('mock-signature')

  return `${header}.${payload}.${signature}`
}
