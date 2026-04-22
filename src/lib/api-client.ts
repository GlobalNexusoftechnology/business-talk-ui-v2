import axios, { AxiosInstance } from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 🔥 REQUIRED for cookies
    })

    // ✅ Response interceptor (ONLY for auth handling)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // 🔥 Optionally try refresh token before logout (future improvement)

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
  // 🔐 AUTH APIs
  // =========================

  async login(email: string, password: string) {
    const res = await this.client.post('/auth/login', {
      email,
      password,
    })

    // ✅ Only store user (NOT token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(res.data.user))
    }

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
      role_id: 'dbc9e1d3-1241-471e-964a-3524cff5bf9f',
    })

    if (createRes.data.UserExist) {
      throw new Error('User already exists')
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'user',
        JSON.stringify(createRes.data.user || createRes.data)
      )
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
  // 👤 USER APIs
  // =========================

  async getProfile() {
    return this.client.get('/user/profile')
  }

  async updateProfile(data: any) {
    return this.client.patch('/user/profile', data)
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
  // 📝 POSTS
  // =========================

  async getFeedPosts(endpoint: string) {
    return this.client.get(endpoint)
  }

  async getPost(id: string) {
    return this.client.get(`/posts/${id}`)
  }

  async createPost(data: any) {
    return this.client.post('/posts', data)
  }

  async updatePost(id: string, data: any) {
    return this.client.patch(`/posts/${id}`, data)
  }

  async deletePost(id: string) {
    return this.client.delete(`/posts/${id}`)
  }

  async likePost(id: string) {
    return this.client.post(`/posts/${id}/like`)
  }

  // =========================
  // 💬 MESSAGES
  // =========================

  async getConversations() {
    return this.client.get('/messages/conversations')
  }

  async getMessages(conversationId: string, page?: number) {
    return this.client.get(`/messages/conversations/${conversationId}`, {
      params: { page },
    })
  }

  async sendMessage(conversationId: string, content: string) {
    return this.client.post(`/messages/conversations/${conversationId}`, {
      content,
    })
  }

  // =========================
  // 👥 USERS
  // =========================

  async searchUsers(query: string, page?: number) {
    return this.client.get('/users/search', { params: { query, page } })
  }

  async getUserProfile(userId: string) {
    return this.client.get(`/users/${userId}`)
  }

  async followUser(userId: string) {
    return this.client.post(`/users/${userId}/follow`)
  }

  // =========================
  // 🔔 NOTIFICATIONS
  // =========================

  async getNotifications(page?: number) {
    return this.client.get('/notifications', { params: { page } })
  }

  async markAsRead(notificationId: string) {
    return this.client.patch(`/notifications/${notificationId}/read`)
  }

  // =========================
  // 📰 BLOGS
  // =========================

  async getBlogs(page?: number, limit?: number) {
    return this.client.get('/blogs', { params: { page, limit } })
  }

  async getBlog(id: string) {
    return this.client.get(`/blogs/${id}`)
  }

  // =========================
  // 🛠 ADMIN
  // =========================

  async getAdminStats() {
    return this.client.get('/admin/stats')
  }

  async getAdminUsers(page?: number, search?: string) {
    return this.client.get('/admin/users', { params: { page, search } })
  }

  async deleteUser(userId: string) {
    return this.client.delete(`/admin/users/${userId}`)
  }

  async getReports(status?: string, page?: number) {
    return this.client.get('/admin/reports', { params: { status, page } })
  }

  async updateReportStatus(reportId: string, status: string) {
    return this.client.patch(`/admin/reports/${reportId}`, { status })
  }
}

const apiClientInstance = new ApiClient()
export default apiClientInstance