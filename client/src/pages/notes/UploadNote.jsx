import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notesAPI } from '../../api/services'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Notes.module.css'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Economics', 'Literature', 'Engineering', 'Psychology', 'Other']
const CATEGORIES = ['Exam Prep', 'Summary', 'Cheat Sheets', 'Mind Maps', 'Theory', 'Other']

export default function UploadNote() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [form, setForm] = useState({ title: '', subject: '', category: '', description: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!file) { toast.error('Please select a file.'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('file', file)
      await notesAPI.upload(fd)
      toast.success('Note uploaded successfully! It is now live.')
      navigate('/notes')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-wrap">
      <div>
        <div className="sec-label">SHARE YOUR KNOWLEDGE</div>
        <h1 style={{ fontFamily: 'var(--font)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>Upload Note</h1>
        <p style={{ color: 'var(--w60)', fontSize: '0.875rem', marginBottom: 28 }}>Help your fellow students by sharing your notes</p>
      </div>

      <div className={`card ${styles.uploadCard}`} style={{ maxWidth: 580 }}>
        <form onSubmit={submit} className={styles.uploadForm}>
          <div>
            <label className="lbl">Title</label>
            <input className="inp" placeholder="e.g. Calculus II — Integration Techniques"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="lbl">Subject</label>
            <select className="inp" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required>
              <option value="">Select a subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">Category</label>
            <select className="inp" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">Description <span style={{ color: 'var(--w30)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>(optional)</span></label>
            <textarea className="inp" placeholder="Brief description of what's covered…"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="lbl">File</label>
            <div
              className={`${styles.dropZone} ${file ? styles.dropZoneActive : ''}`}
              onClick={() => fileRef.current.click()}
            >
              {file ? (
                <><div className={styles.dropIcon}>✅</div>
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.dropSub}>{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</div></>
              ) : (
                <><div className={styles.dropIcon}>📎</div>
                  <div className={styles.dropText}>Click to select a file</div>
                  <div className={styles.dropSub}>PDF, DOC, DOCX, PPT, PPTX · Max 10MB</div></>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0] || null)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/notes')}>Cancel</button>
            <button type="submit" className="btn btn-purple" disabled={loading}>
              {loading ? <><div className="spinner" />Uploading…</> : <><Upload size={15} />Upload Note</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
