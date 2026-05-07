import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// ─── Token-refresh queue ───────────────────────────────────────────────────
// Shared state so concurrent 401s only trigger one refresh call.
let isRefreshing = false
let failedRequestQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (error: unknown) => {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(null)
  })
  failedRequestQueue = []
}
// ──────────────────────────────────────────────────────────────────────────

// Extend Axios config type to allow a custom _retry flag
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

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
      async (error) => {
        if (!error.response) return Promise.reject(error)

        const originalRequest = error.config as RetryableRequestConfig
        const status = Number(error.response.status)
        const responseCode = String(error.response?.data?.code || '')
        const responseMessage = String(
          error.response?.data?.message ||
          error.response?.data?.error ||
          ''
        ).toLowerCase()

        // ── 1. Handle banned / restricted accounts (no refresh attempt) ──
        const isRestrictedResponse =
          status === 423 ||
          responseCode === 'ACCOUNT_RESTRICTED' ||
          ((status === 401 || status === 403) &&
            (responseMessage.includes('banned') ||
              responseMessage.includes('restricted')))

        if (isRestrictedResponse && typeof window !== 'undefined') {
          // Per spec: DO NOT logout the user immediately — keep session data
          // so the restricted page can show their info.
          window.dispatchEvent(new CustomEvent('account-restricted'))
          if (window.location.pathname !== '/account-restricted') {
            window.location.href = '/account-restricted'
          }
          return Promise.reject(error)
        }

        // ── 1b. 403 not related to account restriction → notify UI ──
        if (status === 403 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('action-forbidden'))
        }

        // ── 2. Handle 401 with silent token refresh + request retry ──────
        const isRefreshEndpoint =
          originalRequest?.url?.includes('/auth/refresh-token')

        if (status === 401 && !originalRequest?._retry && !isRefreshEndpoint) {
          // If a refresh is already in-flight, queue this request and wait.
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedRequestQueue.push({ resolve, reject })
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            // Ask the server to issue a new access_token using the refresh cookie.
            await this.client.post('/auth/refresh-token')
            processQueue(null)
            // Retry the original request with the new access_token cookie.
            return this.client(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError)
            // Refresh failed → session is truly expired → force logout.
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user')
              if (window.location.pathname !== '/login') {
                window.location.href = '/login'
              }
            }
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
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
      created_by: '73f52c44-1746-49e6-ab08-8f86a8d8967f',
      modified_by: '73f52c44-1746-49e6-ab08-8f86a8d8967f',
      // role_id: 'e360b4ab-a828-4a4f-8792-701e785f89c0',
      role_id: '73f52c44-1746-49e6-ab08-8f86a8d8967f',
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

  getTrendingPosts() {
    return this.client.get('/trending/posts')
  }

  getForYouFeed() {
    return this.client.get('/posts/feed/for-you')
  }

  getFollowingFeed() {
    return this.client.get('/posts/feed/following')
  }

  getAllPosts() {
    return this.client.get('/posts/all')
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

  // Vote on a comment (UP / DOWN) — generic post comments
  async voteComment(commentId: string, vote: 'up' | 'down') {
    const res = await this.client.post(`/comments/${commentId}/vote`, {
      vote: vote.toLowerCase(),
    })
    return res.data
  }

  // Vote on a blog/story comment — POST /blogs/:blogId/comments/:commentId/vote
  async voteBlogComment(blogId: string, commentId: string, vote: 'up' | 'down') {
    const res = await this.client.post(`/blogs/${blogId}/comments/${commentId}/vote`, {
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

  // Delete a post (author only)
  deletePost(id: string) {
    return this.client.delete(`/posts/${id}`)
  }

  // Delete a post comment (author only)
  deletePostComment(id: string) {
    return this.client.delete(`/posts/comments/${id}`)
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

  async getTrendingStories() {
    const res = await this.client.get('/trending/blogs')
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

  getTrendingBlogs() {  
    return this.client.get('/trending/blogs')
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

  // Update blog (ADMIN_BLOG only on backend)
  updateBlog(id: string, data: FormData | Record<string, unknown>) {
    if (data instanceof FormData) {
      return this.client.patch(`/blogs/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return this.client.patch(`/blogs/${id}`, data)
  }

  // Delete blog
  deleteBlog(id: string) {
    return this.client.delete(`/blogs/${id}`)
  }

  // Delete a blog comment (author only)
  deleteBlogComment(id: string) {
    return this.client.delete(`/blogs/comments/${id}`)
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

  // FIXED — cursor pagination: pass `before` (Unix ms string) to load older messages
  getMessages(conversationId: string, cursor?: string, limit = 50) {
    return this.client.get(`/chat/${conversationId}/messages`, {
      params: {
        ...(cursor ? { before: cursor } : {}),
        limit,
      },
    })
  }

  sendMessage(conversationId: string, content: string) {
    return this.client.post(`/chat/${conversationId}/message`, {
      messageType: 'text',
      content,
    })
  }

  sendMessageWithAttachment(
    conversationId: string,
    content: string,) {
    const formData = new FormData()
    formData.append('messageType', 'text')
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

  /**
   * Finds an existing 1-on-1 conversation with targetUserId, or creates a new one.
   * Returns { id: string } — the conversation id to navigate to.
   */
  async getOrCreateConversation(targetUserId: string): Promise<{ id: string }> {
    // 1. Fetch existing conversations
    const res = await this.getConversations()
    const convList: any[] = res.data ?? []

    // 2. Look for an existing 1-on-1 conversation with the target user
    const existing = convList.find((c: any) => {
      const conv = c.conversation ?? c
      if (conv.isGroup) return false
      return (conv.participants ?? []).some(
        (p: any) => String(p.user?.id ?? p.userId ?? '') === String(targetUserId)
      )
    })

    if (existing) {
      const conv = existing.conversation ?? existing
      return { id: conv.id }
    }

    // 3. None found — create a new conversation
    const createRes = await this.startConversation([targetUserId])
    const created = createRes.data
    return { id: created?.id ?? created?.conversationId }
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
  // 🔔 ADMIN NOTIFICATIONS
  // =========================

  getAdminNotifications(page = 1, limit = 20) {
    return this.client.get('/admin/notifications', {
      params: { page, limit },
    })
  }

  getAdminUnreadNotificationCount() {
    return this.client.get('/admin/notifications/unread-count')
  }

  markAdminNotificationAsRead(id: string) {
    return this.client.patch(`/admin/notifications/${id}/read`)
  }

  markAllAdminNotificationsRead() {
    return this.client.patch('/admin/notifications/mark-all-read')
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

  // 2a. GET SUGGESTED GROUPS
  getGroupSuggestions(limit = 10) {
    return this.client.get('/groups/suggestions', { params: { limit } })
  }

  // 2b. GET MY JOINED GROUPS
  getMyGroups() {
    return this.client.get('/groups/me')
  }

  // 2c. GET MY PENDING JOIN REQUESTS
  getMyRequestedGroups() {
    return this.client.get('/groups/me/requested')
  }

  // 3. GET GROUP BY ID
  getGroupById(id: string) {
    return this.client.get(`/groups/${id}`)
  }

  // 4. JOIN GROUP
  joinGroup(groupId: string) {
    return this.client.post(`/groups/${groupId}/join`)
  }

  // 5. LEAVE GROUP
  leaveGroup(groupId: string) {
    return this.client.delete(`/groups/${groupId}/leave`)
  }

  // 6. GET GROUP BY SLUG
  getGroupBySlug(slug: string) {
    return this.client.get(`/groups/slug/${slug}`)
  }

  // 7. GET GROUP CHAT
  getGroupChat(groupId: string) {
    return this.client.get(`/groups/${groupId}/chat`)
  }

  // 7b. GET OR CREATE GROUP CHAT (backend ensures idempotency)
  getGroupChatOrCreate(groupId: string) {
    return this.client.post(`/groups/${groupId}/chat`)
  }

  // 8. GENERATE INVITE LINK (admin only)
  generateGroupInvite(groupId: string, data?: { expiresIn?: number; maxUses?: number }) {
    return this.client.post(`/groups/${groupId}/invite`, data ?? {})
  }

  // 9. JOIN BY INVITE CODE
  joinGroupByInviteCode(code: string) {
    return this.client.post(`/groups/invite/${code}/join`)
  }

  // 10. REQUEST TO JOIN PRIVATE GROUP
  requestToJoinGroup(groupId: string) {
    return this.client.post(`/groups/${groupId}/request`)
  }

  // 11. GET PENDING JOIN REQUESTS (admin)
  getGroupJoinRequests(groupId: string) {
    return this.client.get(`/groups/${groupId}/requests`)
  }

  // 12. APPROVE JOIN REQUEST
  approveGroupJoinRequest(requestId: string) {
    return this.client.post(`/groups/requests/${requestId}/approve`)
  }

  // 13. REJECT JOIN REQUEST
  rejectGroupJoinRequest(requestId: string) {
    return this.client.post(`/groups/requests/${requestId}/reject`)
  }

  // 14. CREATE POST INSIDE GROUP
  createGroupPost(groupId: string, data: { type: string; content?: string; tags?: string | string[] }) {
    return this.client.post(`/groups/${groupId}/posts`, data)
  }

  // 14a. CREATE POST INSIDE GROUP (with media)
  createGroupPostWithMedia(groupId: string, formData: FormData) {
    return this.client.post(`/groups/${groupId}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // 15. GET GROUP FEED (paginated)
  getGroupFeed(groupId: string, page = 1, limit = 20) {
    return this.client.get(`/groups/${groupId}/feed`, { params: { page, limit } })
  }

  // 16. REMOVE GROUP MEMBER (admin)
  removeGroupMember(groupId: string, userId: string) {
    return this.client.delete(`/groups/${groupId}/member/${userId}`)
  }

  // 17. TOGGLE MEMBER ROLE ADMIN <-> MEMBER
  toggleGroupMemberRole(groupId: string, userId: string) {
    return this.client.patch(`/groups/${groupId}/member/${userId}`)
  }

  // 18. UPDATE GROUP RULES
  updateGroupRules(groupId: string, rules: string[]) {
    return this.client.patch(`/groups/${groupId}/rules`, { rules })
  }

  // =========================
  // 🔐 AUTH — ADDITIONAL
  // =========================

  refreshToken() {
    return this.client.post('/auth/refresh-token')
  }

  changePassword(data: { userId?: string; password: string }) {
    return this.client.post('/auth/change-password', data)
  }

  forgotPassword(email: string) {
    return this.client.post('/auth/forgot-password', { email })
  }

  resetPassword(token: string, password: string) {
    return this.client.post('/auth/reset-password', { token, password })
  }

  getAuthProfile() {
    return this.client.get('/auth/profile')
  }

  // =========================
  // 👤 USER — ADDITIONAL
  // =========================

  createUser(formData: FormData) {
    return this.client.post('/user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  getAllUsers() {
    return this.client.get('/user')
  }

  updateProfile(formData: FormData) {
    return this.client.patch('/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  updateUserById(id: string, formData: FormData) {
    return this.client.patch(`/user/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  deleteUserById(id: string) {
    return this.client.delete(`/user/${id}`)
  }

  // =========================
  // 📰 POSTS — ADDITIONAL
  // =========================

  // Create post with optional media files (multipart)
  createPostWithMedia(formData: FormData) {
    return this.client.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // =========================
  // 💬 CHAT — ADDITIONAL
  // =========================

  deleteMessage(messageId: string) {
    return this.client.delete(`/chat/message/${messageId}`)
  }

  addUserToConversation(conversationId: string, userId: string) {
    return this.client.post(`/chat/${conversationId}/add-user`, { userId })
  }

  removeUserFromConversation(conversationId: string, userId: string) {
    return this.client.post(`/chat/${conversationId}/remove-user`, { userId })
  }

  renameConversation(conversationId: string, title: string) {
    return this.client.post(`/chat/${conversationId}/rename`, { title })
  }

  getChatPresence() {
    return this.client.get('/chat/presence')
  }

  sendRichMessage(
    conversationId: string,
    data: { messageType: 'text' | 'blog' | 'post'; content?: string; blogId?: string; postId?: string }
  ) {
    return this.client.post(`/chat/${conversationId}/message`, data)
  }

  // =========================
  // 🛡️ ADMIN — ADDITIONAL
  // =========================

  shadowBanUser(userId: string) {
    return this.client.patch(`/admin/users/${userId}/shadow-ban`)
  }

  unshadowBanUser(userId: string) {
    return this.client.patch(`/admin/users/${userId}/unshadow-ban`)
  }

  uploadAdminMedia(file: File) {
    const form = new FormData()
    form.append('file', file)
    return this.client.post('/admin/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  getAdminMedia(page = 1, type?: 'image' | 'video') {
    return this.client.get('/admin/media', { params: { page, type } })
  }

  getPendingContent() {
    return this.client.get('/admin/content')
  }

  approveContent(id: string, type: 'post' | 'blog') {
    return this.client.patch(`/admin/content/${id}/approve`, null, { params: { type } })
  }

  rejectContent(id: string, type: 'post' | 'blog', reason?: string) {
    return this.client.patch(`/admin/content/${id}/reject`, reason ? { reason } : undefined, { params: { type } })
  }

  deleteAdminContent(id: string, type: 'post' | 'blog') {
    return this.client.delete(`/admin/content/${id}`, { params: { type } })
  }

  createAdminDraft(data: { type: string; content: Record<string, unknown> }) {
    return this.client.post('/admin/drafts', data)
  }

  getAdminDrafts() {
    return this.client.get('/admin/drafts')
  }

  updateAdminDraft(id: string, data: { type?: string; content?: Record<string, unknown> }) {
    return this.client.patch(`/admin/drafts/${id}`, data)
  }

  publishAdminDraft(id: string) {
    return this.client.post(`/admin/drafts/${id}/publish`)
  }

  deleteAdminDraft(id: string) {
    return this.client.delete(`/admin/drafts/${id}`)
  }

  getAdminFeedback(type?: 'issue' | 'suggestion' | 'bug') {
    return this.client.get('/admin/feedback', { params: type ? { type } : undefined })
  }

  resolveAdminFeedback(id: string) {
    return this.client.patch(`/admin/feedback/${id}/resolve`)
  }

  // =========================
  // 🖼️ MEDIA LIBRARY
  // =========================

  uploadMedia(file: File) {
    const form = new FormData()
    form.append('file', file)
    return this.client.post('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  getMediaLibrary(page = 1, type?: 'image' | 'video') {
    return this.client.get('/media', { params: { page, type } })
  }

  // =========================
  // 🔖 SAVED CONTENT
  // =========================

  saveContent(contentId: string, contentType: 'post' | 'blog') {
    return this.client.post('/saved', { contentId, contentType })
  }

  unsaveContent(contentId: string, contentType: 'post' | 'blog') {
    return this.client.delete('/saved', { data: { contentId, contentType } })
  }

  getSavedContent(page = 1) {
    return this.client.get('/saved', { params: { page } })
  }

  // =========================
  // 🖼️ GALLERY
  // =========================

  getGallery(page = 1, type: 'media' | 'saved' | 'all' = 'all') {
    return this.client.get('/gallery', { params: { page, type } })
  }

  // =========================
  // 🏷️ TAGS
  // =========================

  getTrendingTags() {
    return this.client.get('/tags/trending')
  }

  getTagsHealth() {
    return this.client.get('/tags/health')
  }

  // =========================
  // 📈 TRENDING
  // =========================

  getTrendingHealth() {
    return this.client.get('/trending/health')
  }

  // =========================
  // 💬 FEEDBACK
  // =========================

  submitFeedback(data: { type: 'issue' | 'suggestion' | 'bug'; message: string }) {
    return this.client.post('/feedback', data)
  }

  // =========================
  // 📝 DRAFTS (USER)
  // =========================

  saveDraft(data: { type: string; autoSaved?: boolean; content: Record<string, unknown> }) {
    return this.client.post('/drafts', data)
  }

  getDrafts() {
    return this.client.get('/drafts')
  }

  getDraftById(id: string) {
    return this.client.get(`/drafts/${id}`)
  }

  updateDraft(id: string, data: { type?: string; autoSaved?: boolean; content?: Record<string, unknown> }) {
    return this.client.patch(`/drafts/${id}`, data)
  }

  deleteDraft(id: string) {
    return this.client.delete(`/drafts/${id}`)
  }

  publishDraft(id: string) {
    return this.client.post(`/drafts/${id}/publish`)
  }

  // =========================
  // ⚕️ HEALTH CHECKS
  // =========================

  getAIHealth() {
    return this.client.get('/ai/health')
  }

  getMonetizationHealth() {
    return this.client.get('/monetization/health')
  }

  // =========================
  // 🔐 GOOGLE OAUTH
  // =========================

  // Returns the Google OAuth redirect URL — navigate browser to this URL to initiate OAuth
  getGoogleAuthUrl() {
    return `${API_BASE_URL}/auth/google`
  }

  // =========================
  // 🛡️ ADMIN — USER MODERATION
  // =========================

  getAdminDashboard() {
    return this.client.get('/admin/dashboard')
  }

  warnUser(userId: string) {
    return this.client.patch(`/admin/users/${userId}/warn`)
  }

  banUser(userId: string) {
    return this.client.patch(`/admin/users/${userId}/ban`)
  }

  unbanUser(userId: string) {
    return this.client.patch(`/admin/users/${userId}/unban`)
  }

  // =========================
  // 👤 USER CONTENT (profile page)
  // =========================

  getUserPosts(userId: string, page = 1, limit = 5) {
    return this.client.get('/posts', { params: { author: userId, page, limit } })
  }

  getUserBlogs(userId: string, page = 1, limit = 5) {
    return this.client.get('/blogs', { params: { author: userId, page, limit } })
  }

  getUserComments(userId: string, page = 1, limit = 10) {
    return this.client.get(`/user/${userId}/comments`, { params: { page, limit } })
  }

  getUserStats(userId: string) {
    return this.client.get(`/user/${userId}/stats`)
  }

  // =========================
  // 🔔 PUSH NOTIFICATIONS (FCM)
  // =========================

  /**
   * Register a push token with the backend (req 7).
   * The server should store the token per-user for sending pushes.
   */
  registerPushToken(token: string) {
    return this.client.post('/push/register', { token, platform: 'web' })
  }

  /** Unregister (revoke) a push token — called on logout or permission revoke. */
  unregisterPushToken(token: string) {
    return this.client.post('/push/unregister', { token })
  }

  /** Persist push preference booleans server-side. */
  updatePushPreferences(preferences: Record<string, boolean>) {
    return this.client.patch('/push/preferences', preferences)
  }
}

const apiClient = new ApiClient();
export default apiClient;
