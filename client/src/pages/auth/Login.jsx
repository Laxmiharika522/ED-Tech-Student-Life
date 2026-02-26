import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/services'
import { Zap, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('student') // 'student' | 'admin' | 'register'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await authAPI.login(form)
      const { token, user } = r.data.data

      if (tab === 'admin' && user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.')
        setLoading(false)
        return
      }

      login(token, user)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)
      navigate(user.role === 'admin' ? '/tasks' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = tab === 'admin'

  return (
    <div className="lp-bg">
      <div className={`lp-card ${isAdmin ? 'lp-card--admin' : ''}`}>

        {/* Brand */}
        <div className="lp-brand">
          <div className={`lp-brand-icon ${isAdmin ? 'lp-brand-icon--admin' : ''}`}>
            {isAdmin ? <Shield size={16} fill="#fff" strokeWidth={0} /> : <Zap size={16} fill="#fff" strokeWidth={0} />}
          </div>
          <span className="lp-brand-name">
            Campus<span className="lp-brand-accent">Catalyst</span>
          </span>
        </div>

        {/* Tab row */}
        <div className="lp-tabs">
          <button
            className={`lp-tab ${tab === 'student' ? 'lp-tab--active' : ''}`}
            onClick={() => setTab('student')}
          >Sign In</button>
          <button
            className={`lp-tab lp-tab--admin-btn ${tab === 'admin' ? 'lp-tab--active lp-tab--admin-active' : ''}`}
            onClick={() => setTab('admin')}
          >
            <Shield size={12} />
            Admin
          </button>
        </div>

        {/* Heading */}
        {isAdmin ? (
          <>
            <h1 className="lp-title">Admin Portal <Shield size={22} style={{ verticalAlign: 'middle', color: '#f59e0b' }} /></h1>
            <p className="lp-sub">Restricted access — administrators only</p>
          </>
        ) : (
          <>
            <h1 className="lp-title">Welcome back 👋</h1>
            <p className="lp-sub">Sign in to your student account</p>
          </>
        )}

        {/* Form */}
        <form className="lp-form" onSubmit={submit}>
          <div className="lp-field">
            <label className="lp-lbl">EMAIL</label>
            <div className="lp-input-wrap">
              <Mail size={15} className="lp-input-icon" />
              <input
                name="email"
                type="email"
                className="lp-inp"
                placeholder={isAdmin ? 'admin@campus.edu' : 'you@college.edu'}
                value={form.email}
                onChange={h}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="lp-field">
            <label className="lp-lbl">PASSWORD</label>
            <div className="lp-input-wrap lp-input-wrap--focused">
              <Lock size={15} className="lp-input-icon" />
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                className="lp-inp"
                placeholder="••••••••"
                value={form.password}
                onChange={h}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lp-eye-btn"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {!isAdmin && (
              <div className="lp-forgot">
                <a href="#" onClick={e => e.preventDefault()}>Forgot password?</a>
              </div>
            )}
          </div>

          <button
            className={`lp-submit-btn ${isAdmin ? 'lp-submit-btn--admin' : ''}`}
            disabled={loading}
          >
            {loading
              ? <><div className="lp-spinner" />Signing in…</>
              : isAdmin
                ? <><Shield size={16} />Access Admin Panel</>
                : 'Sign In →'
            }
          </button>
        </form>

        {/* Bottom switch */}
        {!isAdmin && (
          <p className="lp-switch">
            Don't have an account?{' '}
            <Link to="/register">Sign up free</Link>
          </p>
        )}
        {isAdmin && (
          <p className="lp-switch">
            Not an admin?{' '}
            <button className="lp-link-btn" onClick={() => setTab('student')}>Back to student login</button>
          </p>
        )}

        {/* Feature chips — only for student */}
        {!isAdmin && (
          <div className="lp-chips">
            <span className="lp-chip"><span className="lp-chip-check">✓</span> 📝 Share Notes</span>
            <span className="lp-chip"><span className="lp-chip-check">✓</span> 🏠 Match Roommates</span>
            <span className="lp-chip"><span className="lp-chip-check">✓</span> ⚙️ Automate Tasks</span>
          </div>
        )}

        {/* Admin warning */}
        {isAdmin && (
          <div className="lp-admin-warning">
            <Shield size={13} />
            This portal is monitored and restricted to authorized personnel only
          </div>
        )}
      </div>
    </div>
  )
}
