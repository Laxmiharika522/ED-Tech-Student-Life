import api from './axios'

export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
}
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: d => api.put('/users/profile', d),
  changePassword: d => api.put('/users/password', d),
}
export const notesAPI = {
  getAll: p => api.get('/notes', { params: p }),
  getSubjects: () => api.get('/notes/subjects'),
  getMy: () => api.get('/notes/my'),
  upload: f => api.post('/notes/upload', f, { headers: { 'Content-Type': 'multipart/form-data' } }),
  download: id => api.get(`/notes/${id}/download`, { responseType: 'blob' }),
  delete: id => api.delete(`/notes/${id}`),
  approve: id => api.patch(`/notes/${id}/approve`),
  like: id => api.post(`/notes/${id}/like`),
  unlike: id => api.delete(`/notes/${id}/like`),
  rate: (id, rating) => api.post(`/notes/${id}/rate`, { rating }),
}
export const roommateAPI = {
  getProfile: () => api.get('/roommate/profile'),
  saveProfile: d => api.post('/roommate/profile', d),
  deleteProfile: () => api.delete('/roommate/profile'),
  getMatches: () => api.get('/roommate/matches'),
  findMatches: () => api.post('/roommate/find-matches'),
  updateMatchStatus: (id, d) => api.patch(`/roommate/matches/${id}`, d),
}
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: p => api.get('/admin/users', { params: p }),
  updateUser: (id, d) => api.put(`/admin/users/${id}`, d),
  deleteUser: id => api.delete(`/admin/users/${id}`),
  getNotes: p => api.get('/admin/notes', { params: p }),
  getTasks: p => api.get('/admin/tasks', { params: p }),
  getMyTasks: () => api.get('/admin/tasks/my'),
  createTask: d => api.post('/admin/tasks', d),
  updateTask: (id, d) => api.put(`/admin/tasks/${id}`, d),
  updateTaskStatus: (id, d) => api.put(`/admin/tasks/${id}/status`, d),
  deleteTask: id => api.delete(`/admin/tasks/${id}`),
  cloneTask: id => api.post(`/admin/tasks/${id}/clone`),
  approveNote: (id, approved) => api.put(`/admin/notes/${id}/status`, { is_approved: approved }),
  deleteNote: id => api.delete(`/admin/notes/${id}`),
  getRoommateStats: () => api.get('/admin/roommate/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
}
export const statsAPI = {
  getPublic: () => api.get('/stats/public'),
  getRecentNotes: () => api.get('/stats/recent-notes'),
  getDashboard: () => api.get('/stats/dashboard'),
}
