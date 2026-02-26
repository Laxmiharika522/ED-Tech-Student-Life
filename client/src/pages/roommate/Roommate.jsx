import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { roommateAPI } from '../../api/services'
import toast from 'react-hot-toast'
import styles from './Roommate.module.css'

const INTERESTS = ['Gaming', 'Music', 'Reading', 'Sports', 'Coding', 'Cooking', 'Chess', 'Photography', 'Movies', 'Gym', 'Travel', 'Art', 'Dance', 'Yoga']

const OptionBtn = ({ selected, onClick, children }) => (
  <button type="button" className={`${styles.optBtn} ${selected ? styles.optBtnActive : ''}`} onClick={onClick}>
    {children}
  </button>
)

export default function Roommate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    sleep_schedule: 'flexible', study_habits: 'quiet',
    cleanliness: 3, gender: 'Male',
    budget_range: '', bio: '', year: '', major: '',
    noise_preference: 'moderate', interests: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    roommateAPI.getProfile()
      .then(r => { if (r.data.data.profile) { setForm(p => ({ ...p, ...r.data.data.profile })); setHasProfile(true) } })
      .catch(() => { }).finally(() => setLoading(false))
  }, [])

  const toggleInterest = (i) => {
    setForm(p => ({
      ...p,
      interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i]
    }))
  }

  const submit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        sleep_schedule: form.sleep_schedule,
        study_habits: form.noise_preference === 'quiet' ? 'quiet' : form.noise_preference === 'loud' ? 'social' : 'music',
        cleanliness: parseInt(form.cleanliness),
        gender: form.gender,
        budget_range: form.budget_range,
        bio: form.bio || `Year: ${form.year}, Major: ${form.major}, Interests: ${form.interests.join(', ')}`,
      }
      await roommateAPI.saveProfile(payload)
      await roommateAPI.findMatches()
      toast.success('Profile saved! Finding your matches…')
      setTimeout(() => navigate('/roommate/matches'), 1000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrap" style={{ maxWidth: 900 }}>
      <div className="sec-label" style={{ marginBottom: 8 }}>AI POWERED</div>
      <h1 className={styles.title}>Roommate <span className={styles.titleBlue}>Match</span></h1>
      <p className={styles.sub}>Real matches based on real student profiles</p>

      <form onSubmit={submit} className={styles.form}>
        {/* Year + Major */}
        <div className={styles.formCard}>
          <div className={styles.row2}>
            <div>
              <label className="lbl">YOUR YEAR</label>
              <select className="inp" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}>
                <option value="">Select Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
                <option value="pg">Postgraduate</option>
              </select>
            </div>
            <div>
              <label className="lbl">YOUR MAJOR</label>
              <input className="inp" placeholder="e.g. Computer Science" value={form.major}
                onChange={e => setForm(p => ({ ...p, major: e.target.value }))} />
            </div>
          </div>

          <div className={styles.row2} style={{ marginTop: 16 }}>
            <div>
              <label className="lbl">GENDER</label>
              <select className="inp" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                <option value="Male">Boy (Male)</option>
                <option value="Female">Girl (Female)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Sleep schedule */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>🌙 SLEEP SCHEDULE</div>
            <div className={styles.optRow}>
              <OptionBtn selected={form.sleep_schedule === 'early'} onClick={() => setForm(p => ({ ...p, sleep_schedule: 'early' }))}>
                🌅 Early Bird
              </OptionBtn>
              <OptionBtn selected={form.sleep_schedule === 'night_owl'} onClick={() => setForm(p => ({ ...p, sleep_schedule: 'night_owl' }))}>
                🦉 Night Owl
              </OptionBtn>
              <OptionBtn selected={form.sleep_schedule === 'flexible'} onClick={() => setForm(p => ({ ...p, sleep_schedule: 'flexible' }))}>
                😊 Flexible
              </OptionBtn>
            </div>
          </div>

          {/* Noise preference */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>🔊 NOISE PREFERENCE</div>
            <div className={styles.optRow}>
              <OptionBtn selected={form.noise_preference === 'quiet'} onClick={() => setForm(p => ({ ...p, noise_preference: 'quiet' }))}>
                🤫 Quiet
              </OptionBtn>
              <OptionBtn selected={form.noise_preference === 'moderate'} onClick={() => setForm(p => ({ ...p, noise_preference: 'moderate' }))}>
                🎵 Moderate
              </OptionBtn>
              <OptionBtn selected={form.noise_preference === 'loud'} onClick={() => setForm(p => ({ ...p, noise_preference: 'loud' }))}>
                🎉 Loud
              </OptionBtn>
            </div>
          </div>

          {/* Cleanliness slider */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>✨ CLEANLINESS — {form.cleanliness}/5</div>
            <input type="range" min="1" max="5" className={styles.range}
              value={form.cleanliness} onChange={e => setForm(p => ({ ...p, cleanliness: e.target.value }))} />
            <div className={styles.rangeLabels}>
              <span>Chill</span><span>Average</span><span>Spotless</span>
            </div>
          </div>

          {/* Interests */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>🎯 YOUR INTERESTS</div>
            <div className={styles.interests}>
              {INTERESTS.map(i => (
                <button key={i} type="button"
                  className={`${styles.interestTag} ${form.interests.includes(i) ? styles.interestTagActive : ''}`}
                  onClick={() => toggleInterest(i)}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="lbl">BUDGET RANGE</label>
            <input className="inp" placeholder="e.g. $500–$800/month"
              value={form.budget_range} onChange={e => setForm(p => ({ ...p, budget_range: e.target.value }))} />
          </div>
        </div>

        {/* CTA button */}
        <button type="submit" className={`btn btn-purple ${styles.ctaBtn}`} disabled={saving}>
          {saving ? <><div className="spinner" />Saving…</> : 'Save & Find Matches ✨'}
        </button>
      </form>
    </div>
  )
}
