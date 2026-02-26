import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/services'
import { Zap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import './Register.css'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const r = await authAPI.register({ name: form.name, email: form.email, password: form.password })
      const { token, user } = r.data.data
      login(token, user)
      toast.success('Account created! Welcome aboard. 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rp-bg">
      <div className="rp-card">

        {/* Brand */}
        <div className="rp-brand">
          <div className="rp-brand-icon"><Zap size={16} fill="#fff" strokeWidth={0} /></div>
          <span className="rp-brand-name">Campus<span className="rp-brand-accent">Catalyst</span></span>
        </div>

        {/* Tabs */}
        <div className="rp-tabs">
          <Link to="/login" className="rp-tab">Sign In</Link>
          <span className="rp-tab rp-tab--active">Create Account</span>
        </div>

        {/* Heading */}
        <h1 className="rp-title">Join Campus Catalyst 🚀</h1>
        <p className="rp-sub">Create your free account today</p>

        {/* Form */}
        <form className="rp-form" onSubmit={submit}>

          {/* Full Name */}
          <div className="rp-field">
            <label className="rp-lbl">FULL NAME</label>
            <div className="rp-input-wrap">
              <User size={15} className="rp-input-icon" />
              <input
                name="name"
                className="rp-inp"
                placeholder="Arjun Kumar"
                value={form.name}
                onChange={h}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="rp-field">
            <label className="rp-lbl">EMAIL</label>
            <div className="rp-input-wrap">
              <Mail size={15} className="rp-input-icon" />
              <input
                name="email"
                type="email"
                className="rp-inp"
                placeholder="you@college.edu"
                value={form.email}
                onChange={h}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="rp-field">
            <label className="rp-lbl">PASSWORD</label>
            <div className="rp-input-wrap">
              <Lock size={15} className="rp-input-icon" />
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                className="rp-inp"
                placeholder="••••••••"
                value={form.password}
                onChange={h}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rp-eye-btn"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="rp-field">
            <label className="rp-lbl">CONFIRM PASSWORD</label>
            <div className="rp-input-wrap">
              <Lock size={15} className="rp-input-icon" />
              <input
                name="confirm"
                type="password"
                className="rp-inp"
                placeholder="••••••••"
                value={form.confirm}
                onChange={h}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button className="rp-submit-btn" disabled={loading}>
            {loading
              ? <><div className="rp-spinner" />Creating account…</>
              : 'Create Account →'}
          </button>
        </form>

        <p className="rp-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
