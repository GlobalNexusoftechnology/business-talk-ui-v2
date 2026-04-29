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
    return apiClient.get(`/user`) // this give all the users, we can filter on client side for admin panel, since we don't expect more than 10k users. If it grows we can add pagination and filtering on server side
  }
}

export default adminApi