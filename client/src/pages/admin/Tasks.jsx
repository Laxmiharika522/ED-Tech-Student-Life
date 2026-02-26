import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/services'
import { Plus, Trash2, Edit2, Bot, X, Settings, CheckSquare, MessageSquare, Zap, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Tasks.module.css'

const TYPE_LABELS = ['Email', 'Report', 'SMS', 'Notification', 'Form']
const STATUS_OPTS = ['pending', 'in_progress', 'done']

const empty = { title: '', description: '', assigned_to: '', due_date: '', status: 'pending', task_type: 'Email' }

// Generate a fake progress value seeded by id for visual consistency
const fakeProgress = (id, status) => {
  if (status === 'done') return 100
  if (status === 'pending') return 0
  const seed = (id * 37 + 13) % 70 + 20  // 20–90%
  return seed
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(null) // Task to view submission
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [t, u, s] = await Promise.all([
        adminAPI.getTasks(),
        adminAPI.getUsers(),
        adminAPI.getStats()
      ])
      setTasks(t.data.data.tasks || [])
      setUsers(u.data.data.users || [])
      setStats(s.data.data.stats)
    } catch { toast.error('Failed to load tasks.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = t => { setEditing(t.id); setForm({ title: t.title, description: t.description || '', assigned_to: t.assigned_to || '', due_date: t.due_date?.split('T')[0] || '', status: t.status, task_type: t.task_type || 'Email' }); setModal(true) }

  const submit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const p = { ...form, assigned_to: form.assigned_to || undefined, due_date: form.due_date || undefined }
      if (editing) {
        const r = await adminAPI.updateTask(editing, p)
        setTasks(prev => prev.map(t => t.id === editing ? r.data.data.task : t))
        toast.success('Task updated.')
      } else {
        const r = await adminAPI.createTask(p)
        setTasks(prev => [r.data.data.task, ...prev])
        toast.success('Task created.')
      }
      adminAPI.getStats().then(s => setStats(s.data.data.stats))
      setModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.') }
    finally { setSaving(false) }
  }

  const deleteTask = async id => {
    if (!confirm('Delete this task?')) return
    try { await adminAPI.deleteTask(id); setTasks(p => p.filter(t => t.id !== id)); toast.success('Deleted.') }
    catch { toast.error('Failed to delete.') }
  }

  const handleClone = async id => {
    try {
      const r = await adminAPI.cloneTask(id)
      setTasks(prev => [r.data.data.task, ...prev])
      toast.success('Task cloned! Adjust the due date as needed.')
      // Refresh stats since total tasks increased
      adminAPI.getStats().then(s => setStats(s.data.data.stats))
    } catch { toast.error('Failed to clone.') }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className="sec-label">SMART CAMPUS</div>
          <h1 className={styles.title}>Admin Automation</h1>
          <p className={styles.sub}>Manage campus tasks and monitor student submissions</p>
        </div>
        <button className="btn btn-purple" onClick={openCreate}><Plus size={15} />+ New Task</button>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          { icon: '🎓', value: stats?.users?.students || 0, label: 'Total Students' },
          { icon: '📝', value: stats?.notes?.total_notes || 0, label: 'Notes Shared' },
          { icon: '⚙️', value: stats?.tasks?.total || 0, label: 'Tasks Created' },
          { icon: '✅', value: stats?.tasks?.done || 0, label: 'Completed' },
        ].map((s, i) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statNum}>{s.value.toLocaleString()}</div>
            <div className={styles.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: '2.5rem' }}>⚙️</div>
          <h3>No tasks yet</h3>
          <p>Create automated tasks to streamline campus operations.</p>
          <button className="btn btn-purple" onClick={openCreate}><Plus size={15} />Create First Task</button>
        </div>
      ) : (
        <div className={styles.taskList}>
          {tasks.map(task => {
            const assignedTo = users.find(u => u.id === task.assigned_to)
            const createdDate = new Date(task.created_at).toLocaleDateString()

            return (
              <div key={task.id} className={styles.taskCard}>
                <div className={styles.taskLeft}>
                  <div className={styles.taskBotIcon}><Bot size={16} /></div>
                </div>
                <div className={styles.taskBody}>
                  <div className={styles.taskRow1}>
                    <span className={styles.taskName}>{task.title}</span>
                    <span className={styles.typeTag}>{task.category || 'Administrative'}</span>
                    <span className={`badge ${task.status === 'done' ? 'badge-green' : task.status === 'in_progress' ? 'badge-purple' : 'badge-yellow'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  {task.description && <div className={styles.taskDesc}>{task.description}</div>}

                  <div className={styles.taskMeta}>
                    <span className={styles.metaItem}>Created: {createdDate}</span>
                    <span className={styles.metaDot} />
                    <span className={styles.metaItem}>Assigned to: {assignedTo ? assignedTo.name : 'Everyone (Global)'}</span>
                  </div>
                </div>

                <div className={styles.taskActions}>
                  {task.status === 'done' && task.submission_data && (
                    <button className="btn btn-sm btn-outline" onClick={() => setViewModal(task)}>
                      View Submission
                    </button>
                  )}
                  {task.status === 'pending' && (
                    <button className={`btn btn-sm ${styles.publishBtn}`}
                      onClick={async () => {
                        try {
                          await adminAPI.updateTask(task.id, { ...task, status: 'in_progress' })
                          setTasks(p => p.map(t => t.id === task.id ? { ...t, status: 'in_progress' } : t))
                          toast.success('Task published!')
                        } catch { toast.error('Failed.') }
                      }}>
                      Publish
                    </button>
                  )}
                  {/* Restricted Cloning: Only for Feedback and Reports */}
                  {(task.title.toLowerCase().includes('feedback') || task.title.toLowerCase().includes('report')) && (
                    <button className="btn btn-ghost btn-sm" title="Clone Task" onClick={() => handleClone(task.id)}>
                      <Copy size={13} />
                    </button>
                  )}
                  <button className={`btn btn-ghost btn-sm ${styles.editBtn}`} onClick={() => openEdit(task)}>
                    <Edit2 size={13} />
                  </button>
                  <button className={`btn btn-ghost btn-sm ${styles.delBtn}`} onClick={() => deleteTask(task.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View Submission Modal */}
      {viewModal && (
        <div className="overlay" onClick={() => setViewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Task Submission</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className={styles.submissionHeader}>
                <strong>Task:</strong> {viewModal.title}<br />
                <strong>Completed by:</strong> {viewModal.assigned_to_name || 'Global User'}<br />
                <strong>Status:</strong> Completed ✅
              </div>
              <div className={styles.submissionContent}>
                <label className="lbl">Form Data:</label>
                <div className={styles.dataGrid}>
                  {Object.entries(viewModal.submission_data).map(([key, value]) => (
                    <div key={key} className={styles.dataItem}>
                      <span className={styles.dataKey}>{key.replace('_', ' ')}:</span>
                      <span className={styles.dataValue}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-purple" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editing ? 'Edit Task' : 'New Automation Task'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={submit} className="modal-body">
              <div>
                <label className="lbl">Task Name</label>
                <input className="inp" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Fee Payment Reminder" />
              </div>
              <div>
                <label className="lbl">Description</label>
                <textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="What does this automation do?" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="lbl">Type</label>
                  <select className="inp" value={form.task_type} onChange={e => setForm(p => ({ ...p, task_type: e.target.value }))}>
                    {TYPE_LABELS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Assign To</label>
                  <select className="inp" value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'student').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="lbl">Due Date</label>
                  <input type="date" className="inp" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                {editing && (
                  <div>
                    <label className="lbl">Status</label>
                    <select className="inp" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-purple" disabled={saving}>
                  {saving ? <><div className="spinner" />{editing ? 'Updating…' : 'Creating…'}</> : editing ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
