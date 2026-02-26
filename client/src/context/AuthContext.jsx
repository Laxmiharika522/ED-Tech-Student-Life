import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthCtx = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('cc_user')) } catch { return null } })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => setUser(r.data.data.user))
      .catch(() => { localStorage.removeItem('cc_token'); localStorage.removeItem('cc_user') })
      .finally(() => setLoading(false))
  }, [])

  const login = (token, u) => {
    localStorage.setItem('cc_token', token)
    localStorage.setItem('cc_user', JSON.stringify(u))
    setUser(u)
  }
  const logout = () => {
    localStorage.removeItem('cc_token'); localStorage.removeItem('cc_user'); setUser(null)
  }
  const updateUser = (data) => {
    const u = { ...user, ...data }
    localStorage.setItem('cc_user', JSON.stringify(u)); setUser(u)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
