import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { notesAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Search, Upload, Download, Heart, Star, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Notes.module.css'

const CATEGORIES = ['All', 'Exam Prep', 'Summary', 'Cheat Sheets', 'Mind Maps', 'Theory']

/* ── Inline star rating widget ────────────────────────────────────── */
function StarRating({ noteId, avgRating, ratingCount, userRating, onRate, disabled }) {
  const [hovered, setHovered] = useState(0)

  const display = hovered || userRating || 0
  const avg = parseFloat(avgRating) || 0

  return (
    <div className={styles.starWrap} title={`${ratingCount} rating${ratingCount !== 1 ? 's' : ''}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          className={`${styles.starBtn} ${star <= display ? styles.starFilled : ''} ${star <= avg && !display ? styles.starAvg : ''}`}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onRate(noteId, star)}
          title={disabled ? 'Log in to rate' : `Rate ${star} star${star !== 1 ? 's' : ''}`}
          type="button"
        >
          <Star size={13} fill={star <= (hovered || display) ? 'currentColor' : 'none'} />
        </button>
      ))}
      <span className={styles.ratingLabel}>
        {avg > 0 ? avg.toFixed(1) : '—'}
        <span className={styles.ratingCount}>({ratingCount})</span>
      </span>
    </div>
  )
}

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recent')   // 'recent' | 'likes' | 'rating'
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Optimistic local state
  const [likedIds, setLikedIds] = useState(new Set())
  const [likeCounts, setLikeCounts] = useState({})
  const [userRatings, setUserRatings] = useState({})  // noteId → user's rating (1-5)
  const [avgRatings, setAvgRatings] = useState({})  // noteId → { avg_rating, rating_count }

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = { search, page, limit: 12, sortBy }
      if (filter !== 'All') params.category = filter
      const r = await notesAPI.getAll(params)
      const fetched = r.data.data.notes || []
      setNotes(fetched)
      setTotal(r.data.data.pagination?.total || 0)

      // Seed local state from server response
      const newLiked = new Set()
      const newCounts = {}
      const newUserR = {}
      const newAvgR = {}
      fetched.forEach(n => {
        if (n.has_liked) newLiked.add(n.id)
        newCounts[n.id] = n.likes ?? 0
        newUserR[n.id] = n.user_rating ?? null
        newAvgR[n.id] = { avg_rating: n.avg_rating ?? 0, rating_count: n.rating_count ?? 0 }
      })
      setLikedIds(newLiked)
      setLikeCounts(newCounts)
      setUserRatings(newUserR)
      setAvgRatings(newAvgR)
    } catch { toast.error('Failed to load notes.') }
    finally { setLoading(false) }
  }, [search, filter, page, sortBy])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  /* ── Download ────────────────────────────────────────────────────── */
  const handleDownload = async (note) => {
    try {
      const r = await notesAPI.download(note.id)
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a'); a.href = url
      const ext = note.file_url ? note.file_url.split('.').pop() : 'pdf'
      a.download = `${note.title}.${ext}`; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch { toast.error('Download failed.') }
  }

  /* ── Like / Unlike ───────────────────────────────────────────────── */
  const handleLike = async (note) => {
    if (!user) { toast.error('Log in to like notes.'); return }
    const isLiked = likedIds.has(note.id)
    const cur = likeCounts[note.id] ?? 0

    setLikedIds(prev => { const s = new Set(prev); isLiked ? s.delete(note.id) : s.add(note.id); return s })
    setLikeCounts(prev => ({ ...prev, [note.id]: isLiked ? Math.max(0, cur - 1) : cur + 1 }))

    try {
      const r = isLiked ? await notesAPI.unlike(note.id) : await notesAPI.like(note.id)
      setLikeCounts(prev => ({ ...prev, [note.id]: r.data.data.likes }))
    } catch {
      setLikedIds(prev => { const s = new Set(prev); isLiked ? s.add(note.id) : s.delete(note.id); return s })
      setLikeCounts(prev => ({ ...prev, [note.id]: cur }))
      toast.error('Could not update like.')
    }
  }

  /* ── Rate ────────────────────────────────────────────────────────── */
  const handleRate = async (noteId, rating) => {
    if (!user) { toast.error('Log in to rate notes.'); return }

    // Optimistic update
    const prev = { ...avgRatings[noteId] }
    setUserRatings(p => ({ ...p, [noteId]: rating }))

    try {
      const r = await notesAPI.rate(noteId, rating)
      setAvgRatings(p => ({
        ...p,
        [noteId]: { avg_rating: r.data.data.avg_rating, rating_count: r.data.data.rating_count }
      }))
      toast.success(rating === userRatings[noteId] ? 'Rating unchanged.' : `Rated ${rating} ★`)
    } catch {
      setUserRatings(p => ({ ...p, [noteId]: prev.user_rating }))
      toast.error('Could not submit rating.')
    }
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className="sec-label">STUDY SMARTER</div>
          <h1 className={styles.title}>Notes Hub</h1>
          <p className={styles.sub}>Upload and discover real class notes from your campus</p>
        </div>
        <Link to="/notes/upload" className={`btn btn-purple ${styles.uploadBtn}`}>
          <Upload size={15} /> Upload Note
        </Link>
      </div>

      {/* Search + filters */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInp}
            placeholder="Search notes, subjects…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filters}>
            {CATEGORIES.map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => { setFilter(f); setPage(1) }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.sortBtns}>
            <button
              className={`${styles.sortBtn} ${sortBy === 'recent' ? styles.sortActive : ''}`}
              onClick={() => { setSortBy('recent'); setPage(1) }}
            >
              <Clock size={13} /> Recent
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'likes' ? styles.sortActiveLikes : ''}`}
              onClick={() => { setSortBy('likes'); setPage(1) }}
            >
              <Heart size={13} /> Most Liked
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'rating' ? styles.sortActiveRating : ''}`}
              onClick={() => { setSortBy('rating'); setPage(1) }}
            >
              <Star size={13} /> Top Rated
            </button>
          </div>
        </div>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : notes.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyEmoji}>📒</div>
          <p>No notes yet! Be the first to <strong>upload one</strong>.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {notes.map((note, i) => {
            const liked = likedIds.has(note.id)
            const likeCount = likeCounts[note.id] ?? note.likes ?? 0
            const userRating = userRatings[note.id] ?? note.user_rating ?? null
            const { avg_rating = 0, rating_count = 0 } = avgRatings[note.id] ?? { avg_rating: note.avg_rating, rating_count: note.rating_count }

            return (
              <div key={note.id} className={styles.noteCard} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={styles.noteTop}>
                  <span className="badge badge-purple">{note.subject}</span>
                  <span className={styles.downloads}><Download size={11} />{note.downloads}</span>
                </div>

                <h3 className={styles.noteTitle}>{note.title}</h3>
                {note.description && <p className={styles.noteDesc}>{note.description}</p>}

                {/* Star rating row */}
                <StarRating
                  noteId={note.id}
                  avgRating={avg_rating}
                  ratingCount={rating_count}
                  userRating={userRating}
                  onRate={handleRate}
                  disabled={!user}
                />

                <div className={styles.noteFoot}>
                  <div className={styles.uploader}>
                    <div className={styles.uploaderAv}>{note.uploader_name?.[0]?.toUpperCase() || '?'}</div>
                    <span>{note.uploader_name || 'Anonymous'}</span>
                  </div>
                  <div className={styles.noteActions}>
                    <button
                      className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
                      onClick={() => handleLike(note)}
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                      <span>{likeCount}</span>
                    </button>
                    <button className={`btn btn-outline btn-sm`} onClick={() => handleDownload(note)}>
                      <Download size={12} /> Download
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(total / 12) > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className={styles.pageInfo}>Page {page} of {Math.ceil(total / 12)}</span>
          <button className="btn btn-outline btn-sm" disabled={page === Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
