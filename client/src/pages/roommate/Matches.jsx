import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { roommateAPI } from '../../api/services'
import { RefreshCw, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Matches.module.css'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [finding, setFinding] = useState(false)

  const load = async () => {
    try {
      const r = await roommateAPI.getMatches()
      setMatches(r.data.data.matches || [])
    } catch { toast.error('Failed to load matches.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const refresh = async () => {
    setFinding(true)
    try { await roommateAPI.findMatches(); await load(); toast.success('Matches refreshed!') }
    catch (err) { toast.error(err.response?.data?.message || 'Set up your profile first.') }
    finally { setFinding(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await roommateAPI.updateMatchStatus(id, { status })
      setMatches(p => p.map(m => m.id === id ? { ...m, status } : m))
      toast.success(status === 'accepted' ? 'Match accepted!' : 'Match declined.')
    } catch { toast.error('Failed to update.') }
  }

  const scoreColor = s => s >= 80 ? '#22c55e' : s >= 60 ? '#7c5cfc' : '#94a3b8'

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrap">
      <div className={styles.header}>
        <div>
          <div className="sec-label">AI POWERED</div>
          <h1 className={styles.title}>Your Matches</h1>
          <p className={styles.sub}>{matches.length} compatible roommates found</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={refresh} disabled={finding}>
            <RefreshCw size={14} style={finding ? { animation: 'spin 0.8s linear infinite' } : {}} />
            {finding ? 'Finding…' : 'Refresh'}
          </button>
          <Link to="/roommate" className="btn btn-purple">Edit Profile</Link>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: '3rem' }}>🏠</div>
          <h3>No matches yet</h3>
          <p>Set up your roommate profile to get matched with compatible students.</p>
          <Link to="/roommate" className="btn btn-purple" style={{ marginTop: 8 }}>Set Up Profile</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {matches.map((m, i) => {
            const name = m.matched_name || 'Student'
            const score = parseFloat(m.match_score || 0)
            return (
              <div key={m.id} className={styles.card} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{name[0]?.toUpperCase()}</div>
                  <div className={styles.info}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.uni}>{m.matched_user_university || 'University'} • {m.gender === 'Male' ? 'Boy' : m.gender === 'Female' ? 'Girl' : m.gender}</div>
                  </div>
                  <div className={styles.score} style={{ color: scoreColor(score) }}>
                    <div className={styles.scoreNum}>{score.toFixed(0)}%</div>
                    <div className={styles.scoreLbl}>match</div>
                  </div>
                </div>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ width: `${score}%`, background: scoreColor(score) }} />
                </div>
                <div>
                  <span className={`badge ${m.status === 'accepted' ? 'badge-green' : m.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>
                    {m.status}
                  </span>
                </div>
                {m.status === 'pending' && (
                  <div className={styles.actions}>
                    <button className="btn btn-outline btn-sm" onClick={() => updateStatus(m.id, 'rejected')}><X size={13} />Decline</button>
                    <button className="btn btn-purple btn-sm" onClick={() => updateStatus(m.id, 'accepted')}><Check size={13} />Accept</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
