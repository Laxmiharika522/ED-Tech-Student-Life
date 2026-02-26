import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/home/Home'
import Notes from './pages/notes/Notes'
import UploadNote from './pages/notes/UploadNote'
import Roommate from './pages/roommate/Roommate'
import Matches from './pages/roommate/Matches'
import AdminTasks from './pages/admin/Tasks'
import AdminHome from './pages/admin/AdminHome'
import UserManagement from './pages/admin/UserManagement'
import NoteModeration from './pages/admin/NoteModeration'
import RoommateManagement from './pages/admin/RoommateManagement'
import Analytics from './pages/admin/Analytics'
import AdminLayout from './layouts/AdminLayout'
import MyTasks from './pages/student/MyTasks'
import Profile from './pages/profile/Profile'
import NotFound from './pages/NotFound'

// Authenticated shell — requires login (redirects admins to admin dashboard)
const Shell = () => {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return <><Navbar /><Outlet /></>
}

// Admin-only shell
const AdminShell = () => {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

// Guest-only (redirect if already logged in)
const Guest = () => {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  return user ? <Navigate to="/" replace /> : <Outlet />
}

const AppRoutes = () => (
  <Routes>
    {/* Guest only */}
    <Route element={<Guest />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* Authenticated Student routes */}
    <Route element={<Shell />}>
      <Route path="/" element={<Home />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/notes/upload" element={<UploadNote />} />
      <Route path="/roommate" element={<Roommate />} />
      <Route path="/roommate/matches" element={<Matches />} />
      <Route path="/my-tasks" element={<MyTasks />} />
      <Route path="/profile" element={<Profile />} />
    </Route>

    {/* Admin-only routes (No Navbar, has Sidebar) */}
    <Route element={<AdminShell />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/notes" element={<NoteModeration />} />
        <Route path="/admin/roommates" element={<RoommateManagement />} />
        <Route path="/admin/tasks" element={<AdminTasks />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
