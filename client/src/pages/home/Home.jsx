import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowRight, BookOpen, Download, Star, Heart,
  Users, Home as HomeIcon, BarChart2, Award
} from 'lucide-react'
import { statsAPI } from '../../api/services'
import styles from './Home.module.css'

const features = [
  {
    tag: 'Real uploads', emoji: '📒', title: 'Note Sharing',
    desc: 'Upload real PDFs, discover notes from real students on your campus.',
    to: '/notes',
  },
  {
    tag: 'Real profiles', emoji: '🏠', title: 'Roommate Matching',
    desc: 'Get matched with real students based on actual lifestyle preferences.',
    to: '/roommate', featured: true,
  },
  {
    tag: '5 automations', emoji: '⚙️', title: 'Admin Automation',
    desc: 'Automate fee reminders, attendance reports, and complaint routing.',
    to: '/tasks',
  },
]

/* Compact star display */
function Stars({ rating }) {
  const r = parseFloat(rating) || 0
  return (
    <span className={styles.miniStars}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={10} fill={s <= Math.round(r) ? 'currentColor' : 'none'} />
      ))}
      <span>{r > 0 ? r.toFixed(1) : '—'}</span>
    </span>
  )
}

export default function Home() {
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'there'

  const [pubStats, setPubStats] = useState({ notesShared: '…', matchesMade: '…' })
  const [myNotes, setMyNotes] = useState([])
  const [matches, setMatches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [contributors, setContributors] = useState([])
  const [recentNotes, setRecentNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [pubRes, recentRes] = await Promise.all([
          statsAPI.getPublic(),
          statsAPI.getRecentNotes(),
        ])
        if (pubRes.data.success) setPubStats(pubRes.data.data)
        if (recentRes.data.success) setRecentNotes(recentRes.data.data.notes)

        // Personal dashboard — only if logged in
        if (user) {
          const dashRes = await statsAPI.getDashboard()
          if (dashRes.data.success) {
            const d = dashRes.data.data
            setMyNotes(d.myNotes || [])
            setMatches(d.matches || [])
            setSubjects(d.subjects || [])
            setContributors(d.contributors || [])
          }
        }
      } catch (err) {
        console.error('Home load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const statCards = [
    { icon: '📓', label: 'My Notes', value: myNotes.length, sub: 'Notes Uploaded', to: '/notes' },
    { icon: '🤝', label: 'My Matches', value: matches.length, sub: 'Roommate Matches', to: '/roommate' },
    { icon: '🆕', label: 'Recently Added', value: recentNotes.length, sub: 'New Notes Added', to: '/notes' },
  ]

  return (
    <div className={styles.page}>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.welcomeBadge}>
          <span>👋</span> Welcome back, {first}!
        </div>
        <h1 className={styles.heroTitle}>
          Your Campus.<br />
          <span className={styles.heroGradient}>Supercharged.</span>
        </h1>
        <p className={styles.heroSub}>
          Share notes, find your ideal roommate, and automate the<br />
          boring admin stuff — all in one place.
        </p>
        <div className={styles.heroBtns}>
          <Link to="/notes" className={`btn btn-purple btn-lg ${styles.exploreBtn}`}>Explore Notes <ArrowRight size={16} /></Link>
          <Link to="/roommate" className={`btn btn-outline btn-lg`}>Find Roommate</Link>
        </div>
        <div className={styles.heroPills}>
          <div className={styles.pill}><span>📒</span> Real notes being shared</div>
          <div className={styles.pill}><span>🏠</span> Real matches found!</div>
          <div className={styles.pill}><span>⚙️</span> Tasks automated</div>
        </div>
      </section>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <section className={styles.statsGrid}>
        {statCards.map((s, i) => (
          <Link key={s.label} to={s.to} className={styles.statCard} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={styles.statEmoji}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statDivider} />
            <div className={styles.statLabel}>{s.sub}</div>
          </Link>
        ))}
      </section>

      {/* ══ Personalised sections (logged-in only) ════════════════ */}
      {user && (
        <>
          {/* ── My Notes ─────────────────────────────────────────── */}
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}><BookOpen size={18} /> My Shared Notes</h2>
                <p className={styles.sectionSub}>Notes you've uploaded to the hub.</p>
              </div>
              <Link to="/notes" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
            </div>

            {myNotes.length === 0 && !loading ? (
              <p className={styles.emptyMsg}>You haven't shared any notes yet. <Link to="/notes/upload">Upload one!</Link></p>
            ) : (
              <div className={styles.myNotesGrid}>
                {myNotes.map((note, i) => (
                  <Link to="/notes" key={note.id} className={styles.myNoteCard} style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className={styles.noteIcon}><BookOpen size={18} /></div>
                    <div className={styles.noteInfo}>
                      <h4 className={styles.noteTitle}>{note.title}</h4>
                      <div className={styles.noteMeta}>
                        <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{note.subject}</span>
                      </div>
                      <div className={styles.noteMeta} style={{ marginTop: 6 }}>
                        <span className={styles.statPill}><Download size={10} />{note.downloads}</span>
                        <span className={styles.statPill}><Heart size={10} />{note.likes}</span>
                        <Stars rating={note.avg_rating} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Roommate Matches ──────────────────────────────────── */}
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}><Users size={18} /> My Roommate Matches</h2>
                <p className={styles.sectionSub}>People you've been matched with based on lifestyle preferences.</p>
              </div>
              <Link to="/roommate" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
            </div>

            {matches.length === 0 && !loading ? (
              <p className={styles.emptyMsg}>No matches yet. <Link to="/roommate">Set up your profile</Link> to get matched.</p>
            ) : (
              <div className={styles.matchGrid}>
                {matches.slice(0, 4).map((m, i) => (
                  <div key={m.id} className={styles.matchCard} style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className={styles.matchAvatar}>{m.matched_name?.[0]?.toUpperCase() || '?'}</div>
                    <div className={styles.matchInfo}>
                      <div className={styles.matchName}>{m.matched_name}</div>
                      <div className={styles.matchMeta}>{m.matched_university || '—'}</div>
                      <div className={styles.matchMeta}>
                        {m.sleep_schedule} · {m.study_habits} ·
                        <span className={`${styles.matchBadge} ${m.status === 'accepted' ? styles.matchAccepted : ''}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.matchScore}>
                      <span className={styles.scoreNum}>{Math.round(m.match_score)}%</span>
                      <span className={styles.scoreLabel}>match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Insights row: Most Active Subjects + Top Contributors ─ */}
          <section className={styles.insightsRow}>
            {/* Most Active Subjects */}
            <div className={styles.insightCard}>
              <div className={styles.insightHeader}>
                <BarChart2 size={16} className={styles.insightIcon} style={{ color: '#818cf8' }} />
                <div>
                  <h3 className={styles.insightTitle}>Most Active Subjects</h3>
                  <p className={styles.insightSub}>Subjects you contribute to most</p>
                </div>
              </div>

              {subjects.length === 0 && !loading ? (
                <p className={styles.emptyMsgSm}>Upload notes to see your active subjects.</p>
              ) : (
                <div className={styles.subjectList}>
                  {subjects.map((s, i) => {
                    const max = subjects[0]?.note_count || 1
                    const pct = Math.round((s.note_count / max) * 100)
                    return (
                      <div key={s.subject} className={styles.subjectRow}>
                        <div className={styles.subjectName}>
                          <span className={styles.subjectRank}>#{i + 1}</span>
                          {s.subject}
                        </div>
                        <div className={styles.barWrap}>
                          <div className={styles.barFill} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.subjectCount}>{s.note_count} note{s.note_count !== 1 ? 's' : ''}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top Contributors */}
            <div className={styles.insightCard}>
              <div className={styles.insightHeader}>
                <Award size={16} className={styles.insightIcon} style={{ color: '#f472b6' }} />
                <div>
                  <h3 className={styles.insightTitle}>Top Contributors</h3>
                  <p className={styles.insightSub}>Peers sharing in your subjects</p>
                </div>
              </div>

              {contributors.length === 0 && !loading ? (
                <p className={styles.emptyMsgSm}>No contributors found yet — upload notes to see who shares your subjects.</p>
              ) : (
                <div className={styles.contributorList}>
                  {contributors.map((c, i) => (
                    <div key={c.id} className={styles.contributorRow}>
                      <div className={styles.contribAvatar}>{c.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className={styles.contribInfo}>
                        <div className={styles.contribName}>{c.name}</div>
                        <div className={styles.contribSubjects}>{c.subjects}</div>
                      </div>
                      <div className={styles.contribCount}>
                        <BookOpen size={11} /> {c.shared_count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Recently Added Notes (everyone) ───────────────────── */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recently Added Notes</h2>
            <p className={styles.sectionSub}>Stay ahead with the latest study materials from your peers.</p>
          </div>
          <Link to="/notes" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
        </div>
        <div className={styles.recentGrid}>
          {recentNotes.length > 0 ? recentNotes.map((note, i) => (
            <div key={note.id} className={styles.noteCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.noteIcon}><BookOpen size={20} /></div>
              <div className={styles.noteInfo}>
                <h4 className={styles.noteTitle}>{note.title}</h4>
                <div className={styles.noteMeta}>
                  <span>{note.subject}</span>
                  <span className={styles.dot}>•</span>
                  <span>{note.uploader_name || 'Anonymous'}</span>
                </div>
              </div>
              <Link to="/notes" className={styles.downloadIcon}><Download size={16} /></Link>
            </div>
          )) : (
            !loading && <p className={styles.empty}>No notes found yet. Be the first to upload!</p>
          )}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresLabel}>EVERYTHING YOU NEED</div>
        <div className={styles.featuresGrid}>
          {features.map(f => (
            <Link
              key={f.title}
              to={f.to}
              className={`${styles.featureCard} ${f.featured ? styles.featureFeatured : ''}`}
            >
              <span className={styles.featureTag}>{f.tag}</span>
              <div className={styles.featureEmoji}>{f.emoji}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <span className={styles.featureLink}>Explore <ArrowRight size={13} /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
