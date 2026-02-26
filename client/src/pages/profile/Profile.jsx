import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../api/services'
import { Save, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user?.name||'', university: user?.university||'' })
  const [pwd,     setPwd]     = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [saving,  setSaving]  = useState(false)

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await userAPI.updateProfile(profile)
      updateUser(r.data.data.user); toast.success('Profile updated.')
    } catch (err) { toast.error(err.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  const savePassword = async e => {
    e.preventDefault()
    if (pwd.newPassword !== pwd.confirm) { toast.error('Passwords do not match.'); return }
    setSaving(true)
    try {
      await userAPI.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      toast.success('Password changed.'); setPwd({ currentPassword:'', newPassword:'', confirm:'' })
    } catch (err) { toast.error(err.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U'

  return (
    <div className="page-wrap" style={{maxWidth:700}}>
      <div className="sec-label" style={{marginBottom:8}}>ACCOUNT</div>
      <h1 style={{fontFamily:'var(--font)',fontSize:'2rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:28}}>Profile Settings</h1>

      <div className={styles.layout}>
        <div className={`card ${styles.sidebar}`}>
          <div className={styles.bigAv}>{initials}</div>
          <div className={styles.avName}>{user?.name}</div>
          <div className={styles.avEmail}>{user?.email}</div>
          <span className={`badge ${user?.role==='admin'?'badge-purple':'badge-gray'}`} style={{marginTop:8}}>{user?.role}</span>
          {user?.university && <div className={styles.avUni}>{user.university}</div>}
          <nav className={styles.tabNav}>
            <button className={`${styles.tabBtn} ${tab==='profile'?styles.tabActive:''}`} onClick={()=>setTab('profile')}>
              <User size={14}/> Profile
            </button>
            <button className={`${styles.tabBtn} ${tab==='password'?styles.tabActive:''}`} onClick={()=>setTab('password')}>
              <Lock size={14}/> Password
            </button>
          </nav>
        </div>

        <div className={`card card-p ${styles.formCard}`}>
          {tab==='profile' ? (
            <>
              <h2 className={styles.formTitle}>Edit Profile</h2>
              <form onSubmit={saveProfile} style={{display:'flex',flexDirection:'column',gap:16}}>
                <div><label className="lbl">Full Name</label><input className="inp" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} required/></div>
                <div><label className="lbl">Email</label><input className="inp" value={user?.email} disabled style={{opacity:0.5,cursor:'not-allowed'}}/></div>
                <div><label className="lbl">University</label><input className="inp" value={profile.university} onChange={e=>setProfile(p=>({...p,university:e.target.value}))} placeholder="Your university"/></div>
                <button type="submit" className="btn btn-purple" style={{width:'fit-content'}} disabled={saving}>
                  {saving?<><div className="spinner"/>Saving…</>:<><Save size={14}/>Save Changes</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className={styles.formTitle}>Change Password</h2>
              <form onSubmit={savePassword} style={{display:'flex',flexDirection:'column',gap:16}}>
                <div><label className="lbl">Current Password</label><input type="password" className="inp" value={pwd.currentPassword} onChange={e=>setPwd(p=>({...p,currentPassword:e.target.value}))} required placeholder="••••••••"/></div>
                <div><label className="lbl">New Password</label><input type="password" className="inp" value={pwd.newPassword} onChange={e=>setPwd(p=>({...p,newPassword:e.target.value}))} required placeholder="Min. 6 characters"/></div>
                <div><label className="lbl">Confirm Password</label><input type="password" className="inp" value={pwd.confirm} onChange={e=>setPwd(p=>({...p,confirm:e.target.value}))} required placeholder="Repeat new password"/></div>
                <button type="submit" className="btn btn-purple" style={{width:'fit-content'}} disabled={saving}>
                  {saving?<><div className="spinner"/>Saving…</>:<><Lock size={14}/>Change Password</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
