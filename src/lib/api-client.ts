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
        if (!error.response) return Promise.reject(error)

        if (error.response.status === 401) {
          // ❗ Just log — DO NOT refresh, DO NOT redirect
          console.warn('Unauthorized request')
        }

        return Promise.reject(error)
      }
    )
  }

  // =========================
  // 🔐 AUTH
  // =========================

  async login(email: string, password: string) {
    const res = await this.client.post('/auth/login', {
      email,
      password,
    })

    return res
  }

  async signup(
    email: string,
    username: string,
    password: string,
    phone_number?: string
  ) {
    const createRes = await this.client.post('/auth/signup', {
      email,
      username,
      password,
      phone_number,
      created_by: 'dbc9e1d3-1241-471e-964a-3524cff5bf9f',
      modified_by: 'dbc9e1d3-1241-471e-964a-3524cff5bf9f',
      role_id: 'e360b4ab-a828-4a4f-8792-701e785f89c0',
      // role_id: 'dbc9e1d3-1241-471e-964a-3524cff5bf9f',
    })

    if (createRes.data.UserExist) {
      throw new Error('User already exists')
    }

    return createRes
  }

  async logout() {
    await this.client.post('/auth/logout')

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  // =========================
  // 👤 PROFILE
  // =========================

  getMyProfileinfo() {
    return this.client.get('/user/profile')
  }

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

    return { data: user }
  }

  // =========================
  // 🌐 GENERIC METHODS (FIX)
  // =========================

  get(url: string, config?: any) {
    return this.client.get(url, config)
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config)
  }

  patch(url: string, data?: any, config?: any) {
    return this.client.patch(url, data, config)
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config)
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

  // More post-related APIs can be added here (update, delete, etc.)
  // Get single post (also increments view)
  getPostById(id: string) {
    return this.client.get(`/posts/${id}`)
  }

  // Share post
  sharePost(id: string) {
    return this.client.get(`/posts/${id}/share`)
  }

  // Tag feed
  getPostsByTags(tags: string[]) {
    return this.client.get('/posts/feed/tag', {
      params: { tags: tags.join(',') },
    })
  }

  // Explore feed
  getExploreFeed() {
    return this.client.get('/posts/feed/explore')
  }

  // =========================
  // 🗳️ POST & COMMENT VOTING
  // =========================

  // Vote on a post (UP / DOWN)
  async votePost(postId: string, vote: 'up' | 'down') {
    const res = await this.client.post(`/posts/${postId}/vote`, {
      vote: vote.toLowerCase(), // backend expects up/down
    })
    return res.data
  }

  // Vote on a comment (UP / DOWN)
  async voteComment(commentId: string, vote: 'up' | 'down') {
    const res = await this.client.post(`/comments/${commentId}/vote`, {
      vote: vote.toLowerCase(),
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
  // 📰 BLOG / STORY INTERACTIONS
  // =========================

  async getBlogs() {
    const res = await this.client.get('/blogs')
    return {
      data: (res.data || []).filter((b: any) => b.type === 'BLOG' || b.type === 'ADMIN_BLOG'),
    }
  }

  getBlogById(id: string) {
    return this.client.get(`/blogs/${id}`)
  }

  // Create blog
  createBlog(formData: FormData) {
    return this.client.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // Delete blog
  deleteBlog(id: string) {
    return this.client.delete(`/blogs/${id}`)
  }

  // Share blog
  shareBlog(id: string) {
    return this.client.get(`/blogs/${id}/share`)
  }

  // Like / Unlike blog (Story)
  async likeBlog(id: string) {
    return this.client.post(`/blogs/${id}/like`)
  }

  // Get blog comments
  async getBlogComments(id: string) {
    const res = await this.client.get(`/blogs/${id}/comments`)
    return res.data
  }

  // Add blog comment / reply
  async addBlogComment(
    id: string,
    content: string,
    parent_id?: string
  ) {
    const res = await this.client.post(
      `/blogs/${id}/comments`,
      parent_id
        ? { content, parent_id }
        : { content }
    )
    return res.data
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

  // FIXED
  getMessages(conversationId: string, page?: number) {
    return this.client.get(`/chat/${conversationId}/messages`, {
      params: { page },
    })
  }

  sendMessage(conversationId: string, content: string) {
    return this.client.post(`/chat/${conversationId}/message`, {
      message_type: 'text',
      content,
    })
  }

  sendMessageWithAttachment(
    conversationId: string,
    content: string,) {
    const formData = new FormData()
    formData.append('message_type', 'text')
    formData.append('content', content)

    return this.client.post(`/chat/${conversationId}/message`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  startConversation(userIds: string[]) {
    return this.client.post('/chat/start', {
      userIds,
    })
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
  // 🔍 SEARCH
  // =========================

  searchAll(query: string, type = 'all', page = 1, limit = 10) {
    return this.client.get('/search', {
      params: { q: query, type, page, limit },
    })
  }

  searchSuggestions(query: string) {
    return this.client.get('/search/suggest', {
      params: { q: query },
    })
  }

  // =========================
  // 📊 ANALYTICS (ADMIN)
  // =========================

  getActivityAnalytics(days = 7) {
    return this.client.get('/admin/analytics/activity', {
      params: { days },
    })
  }

  getEngagementAnalytics(days = 7) {
    return this.client.get('/admin/analytics/engagement', {
      params: { days },
    })
  }

  getTopPosts() {
    return this.client.get('/admin/analytics/top-posts')
  }

  getTopUsers() {
    return this.client.get('/admin/analytics/top-users')
  }

  getGrowthAnalytics(days = 7) {
    return this.client.get('/admin/analytics/growth', {
      params: { days },
    })
  }

  // =========================
  // 🚨 REPORTS SYSTEM
  // =========================

  // Create report
  createReport(payload: {
    content_type: string
    content_id: string
    reason: string
  }) {
    return this.client.post('/reports', payload)
  }

  // Get reports (admin)
  getReports(status?: string, page = 1, limit = 10) {
    return this.client.get('/admin/reports', {
      params: { status, page, limit },
    })
  }

  // Resolve report
  resolveReport(id: string, action: string) {
    return this.client.patch(`/admin/reports/${id}/resolve`, {
      action,
    })
  }

  // =========================
  // 👤 ROLES APIs
  // =========================

  getRoles() {
    return this.client.get('/roles')
  }

  getRoleById(id: string) {
    return this.client.get(`/roles/${id}`)
  }

  createRole(data: any) {
    return this.client.post('/roles', data)
  }

  updateRole(id: string, data: any) {
    return this.client.patch(`/roles/${id}`, data)
  }

  deleteRole(id: string) {
    return this.client.delete(`/roles/${id}`)
  }

  // =========================
  // 👥 GROUP APIs (FULL)
  // =========================

  // 1. CREATE GROUP (supports optional cover image)
  async createGroup(data: FormData) {
    return this.client.post('/groups', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // 2. GET ALL GROUPS
  getGroups() {
    return this.client.get('/groups')
  }

  // 3. GET GROUP BY SLUG
  getGroupBySlug(slug: string) {
    return this.client.get(`/groups/${slug}`)
  }

  // 4. JOIN GROUP
  joinGroup(groupId: string) {
    return this.client.post(`/groups/${groupId}/join`)
  }

  // 5. LEAVE GROUP
  leaveGroup(groupId: string) {
    return this.client.delete(`/groups/${groupId}/leave`)
  }
}

const apiClient = new ApiClient();
export default apiClient;
