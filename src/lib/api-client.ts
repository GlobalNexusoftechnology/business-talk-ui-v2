// import axios, { AxiosInstance } from 'axios'

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// class ApiClient {
//   private client: AxiosInstance

//   constructor() {
//     this.client = axios.create({
//       baseURL: API_BASE_URL,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       withCredentials: true, // 🔥 REQUIRED for cookies
//     })

//     // ✅ Response interceptor (ONLY for auth handling)
//     this.client.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           // 🔥 Optionally try refresh token before logout (future improvement)

//           if (typeof window !== 'undefined') {
//             localStorage.removeItem('user')
//             window.location.href = '/login'
//           }
//         }
//         return Promise.reject(error)
//       }
//     )
//   }

//   // Vote on a post (UP/DOWN)
//   async votePost(postId: string, vote: 'up' | 'down') {
//     const res = await this.client.post(`/posts/${postId}/vote`, { vote })
//     // Return only relevant data
//     return res.data
//   }

//   // Add a comment to a post
//   async addPostComment(postId: string, comment: string, parent_id?: string) {
//     const res = await this.client.post(`/posts/${postId}/comments`, parent_id ? { comment, parent_id } : { comment })
//     return res.data
//   }

//   // Get comments for a post
//   async getPostComments(postId: string) {
//     const res = await this.client.get(`/posts/${postId}/comments`)
//     return res.data
//   }

//     // Vote on a comment (UP/DOWN)
//   async voteComment(commentId: string, vote: 'up' | 'down') {
//     const res = await this.client.post(`/comments/${commentId}/vote`, { vote })
//     return res.data
//   }


//   // =========================
//   // 🔐 AUTH APIs
//   // =========================

//   async login(email: string, password: string) {
//     const res = await this.client.post('/auth/login', {
//       email,
//       password,
//     })

//     // ✅ Only store user (NOT token)
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('user', JSON.stringify(res.data.user))
//     }

//     return res
//   }

//   async signup(
//     email: string,
//     username: string,
//     password: string,
//     phone_number?: string
//   ) {
//     const createRes = await this.client.post('/auth/signup', {
//       email,
//       username,
//       password,
//       phone_number,
//       role_id: 'dbc9e1d3-1241-471e-964a-3524cff5bf9f',
//     })

//     if (createRes.data.UserExist) {
//       throw new Error('User already exists')
//     }

//     if (typeof window !== 'undefined') {
//       localStorage.setItem(
//         'user',
//         JSON.stringify(createRes.data.user || createRes.data)
//       )
//     }

//     return createRes
//   }

//   async logout() {
//     await this.client.post('/auth/logout')

//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//   }

//   // =========================
//   // 👤 USER APIs
//   // =========================

//   async getProfile() {
//     return this.client.get('/user/profile')
//   }

//   async updateProfile(data: any) {
//     return this.client.patch('/user/profile', data)
//   }

//   async completeProfile(data: any) {
//     let body: string | FormData

//     if (data.profile_photo) {
//       const form = new FormData()

//       Object.entries(data).forEach(([key, value]) => {
//         if (key === 'skills' && Array.isArray(value)) {
//           value.forEach((v) => form.append('skills', v))
//         } else if (value !== undefined && value !== null) {
//           if (
//             typeof value === 'object' &&
//             !(value instanceof File) &&
//             !(value instanceof Blob)
//           ) {
//             form.append(key, JSON.stringify(value))
//           } else {
//             form.append(key, value as string | Blob)
//           }
//         }
//       })

//       body = form
//     } else {
//       body = JSON.stringify(data)
//     }

//     const res = await fetch(`${API_BASE_URL}/user/me`, {
//       method: 'PATCH',
//       credentials: 'include', // 🔥 IMPORTANT
//       headers:
//         body instanceof FormData
//           ? {}
//           : { 'Content-Type': 'application/json' },
//       body,
//     })

//     if (!res.ok) throw new Error(await res.text())

//     const user = await res.json()

//     if (typeof window !== 'undefined') {
//       localStorage.setItem('user', JSON.stringify(user))
//     }

//     return { data: user }
//   }

//   // =========================
//   // 📝 POSTS
//   // =========================

//   async getFeedPosts(endpoint: string) {
//     return this.client.get(endpoint)
//   }

//   async getPost(id: string) {
//     return this.client.get(`/posts/${id}`)
//   }

//   async createPost(data: any) {
//     return this.client.post('/posts', data)
//   }

//   async updatePost(id: string, data: any) {
//     return this.client.patch(`/posts/${id}`, data)
//   }

//   async deletePost(id: string) {
//     return this.client.delete(`/posts/${id}`)
//   }

//   async likePost(id: string) {
//     return this.client.post(`/posts/${id}/like`)
//   }

//   // =========================
//   // 💬 MESSAGES
//   // =========================

//   async getConversations() {
//     return this.client.get('/messages/conversations')
//   }

//   async getMessages(conversationId: string, page?: number) {
//     return this.client.get(`/messages/conversations/${conversationId}`, {
//       params: { page },
//     })
//   }

//   async sendMessage(conversationId: string, content: string) {
//     return this.client.post(`/messages/conversations/${conversationId}`, {
//       content,
//     })
//   }

//   // =========================
//   // 👥 USERS
//   // =========================

//   async searchUsers(query: string, page?: number) {
//     return this.client.get('/users/search', { params: { query, page } })
//   }

//   async getUserProfile(userId: string) {
//     return this.client.get(`/users/${userId}`)
//   }

//   async followUser(userId: string) {
//     return this.client.post(`/users/${userId}/follow`)
//   }

//    // =========================
//   // 🔔 NOTIFICATION APIs
//   // =========================

//   async getMyNotifications() {
//     return this.client.get('/notification')
//   }

//   async markNotificationAsRead(id: string) {
//     return this.client.patch(`/notification/${id}/read`)
//   }

//   async markAllNotificationsRead() {
//     return this.client.patch('/notification/mark-all-read')
//   }

//   async getUnreadNotificationCount() {
//     return this.client.get('/notification/unread-count')
//   }

//   // =========================
//   // 👥 FOLLOW APIs
//   // =========================

//   followUserById(id: string) {
//     return this.client.post(`/follow/${id}`)
//   }

//   unfollowUserById(id: string) {
//     return this.client.delete(`/follow/${id}/unfollow`)
//   }

//   getFollowers(id: string) {
//     return this.client.get(`/follow/${id}/followers`)
//   }

//   getFollowing(id: string) {
//     return this.client.get(`/follow/${id}/following`)
//   }

//   async getFollowSuggestions() {
//     return this.client.get('/follow/suggestions')
//   }

//   // =========================
//   // 👥 GROUP APIs
//   // =========================

//   async createGroup(data: { name: string; description: string; visibility: string }) {
//     return this.client.post('/groups', data)
//   }

//   async getGroups() {
//     return this.client.get('/groups')
//   }

//   async getGroupBySlug(slug: string) {
//     return this.client.get(`/groups/${slug}`)
//   }

//   async joinGroup(id: string) {
//     return this.client.post(`/groups/${id}/join`)
//   }

//   async leaveGroup(id: string) {
//     return this.client.delete(`/groups/${id}/leave`)
//   }

//   // =========================
//   // 👤 PEOPLE / USERS APIs
//   // =========================

//   async getAllUsers() {
//     return this.client.get('/user')
//   }

//   async getUserById(id: string) {
//     return this.client.get(`/user/${id}`)
//   }

//   async updateOwnProfile(data: any) {
//     return this.client.patch('/user/me', data)
//   }

//   // =========================
//   // ⚙️ SETTINGS / PROFILE APIs
//   // =========================

//   async getMyProfile() {
//     return this.client.get('/user/profile')
//   }

//   async getDashboardStats() {
//     return this.client.get('/user/dashboard-stats')
//   }

//   async getUserActivity() {
//     return this.client.get('/user/activity')
//   }

//   async changePassword(oldPassword: string, newPassword: string) {
//     return this.client.post('/auth/change-password', { oldPassword, newPassword })
//   }

//   async forgotPassword(email: string) {
//     return this.client.post('/auth/forgot-password', { email })
//   }

//   async resetPassword(token: string, newPassword: string) {
//     return this.client.post('/auth/reset-password', { token, newPassword })
//   }

//   // =========================
//   // 🔍 SEARCH APIs
//   // =========================

//   async search(term: string, type = 'all', page = 1, limit = 10) {
//     return this.client.get('/search', { params: { q: term, type, page, limit } })
//   }

//   async suggest(term: string) {
//     return this.client.get('/search/suggest', { params: { q: term } })
//   }

//   // =========================
//   // 🏷️ TAG APIs
//   // =========================

//   async getTrendingTags() {
//     return this.client.get('/tags/trending')
//   }

//   async tagsHealthCheck() {
//     return this.client.get('/tags/health')
//   }

//   // =========================
//   // 📰 BLOGS
//   // =========================

//   async getBlogs(page?: number, limit?: number) {
//     return this.client.get('/blogs', { params: { page, limit } })
//   }

//   async getBlog(id: string) {
//     return this.client.get(`/blogs/${id}`)
//   }

//   // =========================
//   // 🛠 ADMIN
//   // =========================

//   async getAdminStats() {
//     return this.client.get('/admin/stats')
//   }

//   async getAdminUsers(page?: number, search?: string) {
//     return this.client.get('/admin/users', { params: { page, search } })
//   }

//   async deleteUser(userId: string) {
//     return this.client.delete(`/admin/users/${userId}`)
//   }

//   async getReports(status?: string, page?: number) {
//     return this.client.get('/admin/reports', { params: { status, page } })
//   }

//   async updateReportStatus(reportId: string, status: string) {
//     return this.client.patch(`/admin/reports/${reportId}`, { status })
//   }
// }

// const apiClientInstance = new ApiClient()
// export default apiClientInstance

import axios, { AxiosInstance } from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // =========================
  // 🔐 AUTH
  // =========================

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password })
  }

  signup(email: string, username: string, password: string, phone?: string) {
    return this.client.post('/auth/signup', {
      email,
      username,
      password,
      phone_number: phone,
    })
  }

  logout() {
    return this.client.post('/auth/logout')
  }

  // =========================
  // 👤 PROFILE
  // =========================

  getMyProfile() {
    return this.client.get('/auth/me')
  }

  getDashboardStats() {
    return this.client.get('/user/dashboard-stats')
  }

  getUserActivity() {
    return this.client.get('/user/activity')
  }

  getUserById(id: string) {
    return this.client.get(`/user/${id}`)
  }

  async completeProfile(data: any) {
    let body: string | FormData

    if (data.profile_photo) {
      const form = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'skills' && Array.isArray(value)) {
          value.forEach((v) => form.append('skills', v))
        } else if (value !== undefined && value !== null) {
          if (
            typeof value === 'object' &&
            !(value instanceof File) &&
            !(value instanceof Blob)
          ) {
            form.append(key, JSON.stringify(value))
          } else {
            form.append(key, value as string | Blob)
          }
        }
      })

      body = form
    } else {
      body = JSON.stringify(data)
    }

    const res = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'PATCH',
      credentials: 'include', // 🔥 IMPORTANT
      headers:
        body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' },
      body,
    })

    if (!res.ok) throw new Error(await res.text())

    const user = await res.json()

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }

    return { data: user }
  }


  // =========================
  // 📰 POSTS / FEED
  // =========================

  getHotPosts() {
    return this.client.get('/posts/hot')
  }

  getForYouFeed() {
    return this.client.get('/posts/feed/for-you')
  }

  getFollowingFeed() {
    return this.client.get('/posts/feed/following')
  }

  createPost(data: any) {
    return this.client.post('/posts', data)
  }

  likePost(id: string) {
    return this.client.post(`/posts/${id}/like`)
  }

  // =========================
  // 🗳️ POST & COMMENT VOTING
  // =========================

  // Vote on a post (UP / DOWN)
  async votePost(postId: string, vote: 'up' | 'down') {
    const res = await this.client.post(`/posts/${postId}/vote`, {
      vote: vote.toUpperCase(), // backend expects UP/DOWN
    })
    return res.data
  }

  // Vote on a comment (UP / DOWN)
  async voteComment(commentId: string, vote: 'up' | 'down') {
    const res = await this.client.post(`/comments/${commentId}/vote`, {
      vote: vote.toUpperCase(),
    })
    return res.data
  }

  // =========================
  // 💬 COMMENTS
  // =========================

  // Add comment or reply
  async addPostComment(
    postId: string,
    comment: string,
    parent_id?: string
  ) {
    const res = await this.client.post(
      `/posts/${postId}/comments`,
      parent_id
        ? { comment, parent_id }
        : { comment }
    )
    return res.data
  }

  // Get all comments of a post
  async getPostComments(postId: string) {
    const res = await this.client.get(`/posts/${postId}/comments`)
    return res.data
  }

  // =========================
  // 📰 STORIES
  // =========================

  async getStories() {
    const res = await this.client.get('/blogs')
    return {
      data: (res.data || []).filter((b: any) => b.type === 'STORY'),
    }
  }

  // =========================
  // 👥 FOLLOW
  // =========================

  followUserById(id: string) {
    return this.client.post(`/follow/${id}`)
  }

  unfollowUserById(id: string) {
    return this.client.delete(`/follow/${id}/unfollow`)
  }

  getFollowSuggestions() {
    return this.client.get('/follow/suggestions')
  }

  getFollowers(id: string) {
    return this.client.get(`/follow/${id}/followers`)
  }

  getFollowing(id: string) {
    return this.client.get(`/follow/${id}/following`)
  }

  // =========================
  // 💬 CHAT (FIXED)
  // =========================

  getConversations() {
    return this.client.get('/chat/my/conversations')
  }

  getMessages(conversationId: string, page?: number) {
    return this.client.get(`/chat/${conversationId}`, {
      params: { page },
    })
  }

  sendMessage(conversationId: string, content: string) {
    return this.client.post(`/chat/${conversationId}`, { content })
  }

  // =========================
  // 🔔 NOTIFICATIONS
  // =========================

  getMyNotifications() {
    return this.client.get('/notification')
  }

  markNotificationAsRead(id: string) {
    return this.client.patch(`/notification/${id}/read`)
  }

  markAllNotificationsRead() {
    return this.client.patch('/notification/mark-all-read')
  }

  getUnreadNotificationCount() {
    return this.client.get('/notification/unread-count')
  }

  // =========================
  // 👥 GROUPS
  // =========================

  getGroups() {
    return this.client.get('/groups')
  }
}

const apiClient = new ApiClient();
export default apiClient;