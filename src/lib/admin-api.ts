import apiClient from './api-client'

const adminApi = {
  // DASHBOARD
  getDashboard() {
    return apiClient.get('/admin/dashboard')
  },

  // POSTS
  deletePost(id: string) {
    return apiClient.delete(`/admin/posts/${id}`)
  },

  // BLOGS
  deleteBlog(id: string) {
    return apiClient.delete(`/admin/blogs/${id}`)
  },

  // USERS
  warnUser(id: string) {
    return apiClient.patch(`/admin/users/${id}/warn`)
  },

  banUser(id: string) {
    return apiClient.patch(`/admin/users/${id}/ban`)
  },

  unbanUser(id: string) {
    return apiClient.patch(`/admin/users/${id}/unban`)
  },

  shadowBanUser(id: string) {
    return apiClient.patch(`/admin/users/${id}/shadow-ban`)
  },

  unshadowBanUser(id: string) {
    return apiClient.patch(`/admin/users/${id}/unshadow-ban`)
  },

  // MEDIA LIBRARY
  uploadMedia(file: File) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/admin/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getMedia(page = 1, type?: 'image' | 'video') {
    return apiClient.get('/admin/media', { params: { page, ...(type ? { type } : {}) } })
  },

  // CONTENT MODERATION
  getPendingContent() {
    return apiClient.get('/admin/content')
  },

  approveContent(id: string, type: 'post' | 'blog') {
    return apiClient.patch(`/admin/content/${id}/approve`, null, { params: { type } })
  },

  rejectContent(id: string, type: 'post' | 'blog', reason: string) {
    return apiClient.patch(`/admin/content/${id}/reject`, { reason }, { params: { type } })
  },

  deleteContent(id: string, type: 'post' | 'blog') {
    return apiClient.delete(`/admin/content/${id}`, { params: { type } })
  },

  // DRAFTS
  createDraft(payload: { type: 'blog'; content: { title: string; body: string; cover_image?: string } }) {
    return apiClient.post('/admin/drafts', payload)
  },

  getDrafts() {
    return apiClient.get('/admin/drafts')
  },

  updateDraft(id: string, fields: Record<string, any>) {
    return apiClient.patch(`/admin/drafts/${id}`, fields)
  },

  publishDraft(id: string) {
    return apiClient.post(`/admin/drafts/${id}/publish`)
  },

  deleteDraft(id: string) {
    return apiClient.delete(`/admin/drafts/${id}`)
  },

  // FEEDBACK / SUPPORT
  getFeedback(type?: 'issue' | 'suggestion' | 'bug') {
    return apiClient.get('/admin/feedback', { params: type ? { type } : {} })
  },

  resolveFeedback(id: string) {
    return apiClient.patch(`/admin/feedback/${id}/resolve`)
  },

  // REPORTS
  getReports(params?: any) {
    return apiClient.get('/admin/reports', { params })
  },

  resolveReport(id: string, action: string) {
    return apiClient.patch(`/admin/reports/${id}/resolve`, { action })
  },

  // ANALYTICS
  getActivity(days = 7) {
    return apiClient.get(`/admin/analytics/activity?days=${days}`)
  },

  getEngagement(days = 7) {
    return apiClient.get(`/admin/analytics/engagement?days=${days}`)
  },

  getGrowth(days = 7) {
    return apiClient.get(`/admin/analytics/growth?days=${days}`)
  },

  getTopPosts() {
    return apiClient.get(`/admin/analytics/top-posts`)
  },

  getTopUsers() {
    return apiClient.get(`/admin/analytics/top-users`)
  },

  getAllUsers() {
    return apiClient.get(`/user`)
  },
}

export default adminApi