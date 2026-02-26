import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Home, BookOpen, Users, LayoutGrid, LogOut, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={15} fill="#fff" strokeWidth={0} /></div>
          <span className={styles.logoText}>Campus<b>Catalyst</b></span>
        </NavLink>

        <div className={styles.links}>
          <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
            <Home size={14} />Home
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
            <BookOpen size={14} />Notes Hub
          </NavLink>
          <NavLink to="/roommate" className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
            <Users size={14} />Roommate Match
          </NavLink>

          {/* Students see "My Tasks", admins see "Admin Tasks" */}
          {isAdmin ? (
            <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
              <LayoutGrid size={14} />Admin Dashboard
            </NavLink>
          ) : (
            <NavLink to="/my-tasks" className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
              <LayoutGrid size={14} />My Tasks
            </NavLink>
          )}
        </div>

        <div className={styles.right} ref={ref}>
          <button className={styles.avatar} onClick={() => setOpen(p => !p)}>
            {initials}
          </button>
          {open && (
            <div className={styles.dropdown}>
              <div className={styles.dropHead}>
                <div className={styles.dropName}>{user?.name}</div>
                <div className={styles.dropEmail}>{user?.email}</div>
                <span className={styles.dropRole}>{user?.role}</span>
              </div>
              <div className={styles.dropDivider} />
              <button className={styles.dropItem} onClick={() => { navigate('/profile'); setOpen(false) }}>
                <User size={13} /> Profile Settings
              </button>
              <button className={`${styles.dropItem} ${styles.dropItemRed}`} onClick={() => { logout(); navigate('/login') }}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
