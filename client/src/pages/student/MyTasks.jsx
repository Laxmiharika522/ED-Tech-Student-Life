import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/services'
import { CheckCircle, Clock, AlertCircle, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './MyTasks.module.css'

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState(null) // { id, type }
  const [formData, setFormData] = useState({})

  const load = async () => {
    try {
      const r = await adminAPI.getMyTasks()
      setTasks(r.data.data.tasks || [])
    } catch { toast.error('Failed to load tasks.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status, data = {}) => {
    try {
      await adminAPI.updateTaskStatus(id, { status, ...data })
      setTasks(p => p.map(t => t.id === id ? { ...t, status } : t))
      if (status === 'done') toast.success('Task completed! 🎉')
      else toast.success('Task started! 🚀')
      setActiveForm(null)
      setFormData({})
    } catch { toast.error('Failed to update task.') }
  }

  const handleStart = (task) => {
    if (task.category === 'Academic') {
      setActiveForm({ id: task.id, type: 'study' })
    } else if (task.category === 'Event') {
      setActiveForm({ id: task.id, type: 'event' })
    } else if (task.category === 'Administrative') {
      if (task.title.includes('Feedback')) setActiveForm({ id: task.id, type: 'feedback' })
      else if (task.title.includes('Report')) setActiveForm({ id: task.id, type: 'report' })
      else if (task.title.includes('Profile')) setActiveForm({ id: task.id, type: 'profile' })
    } else {
      updateStatus(task.id, 'in_progress')
    }
  }

  const handleComplete = (task) => {
    if (task.category === 'Academic' && task.status === 'pending') {
      setActiveForm({ id: task.id, type: 'study' })
      return
    }
    if (task.category === 'Event' && task.status === 'pending') {
      setActiveForm({ id: task.id, type: 'event' })
      return
    }

    // Default complete
    updateStatus(task.id, 'done')
  }

  const renderForm = (taskId, type) => {
    const task = tasks.find(t => t.id === taskId)

    if (type === 'feedback') {
      return (
        <div className={styles.taskForm}>
          <div className={styles.formHeader}>How was your experience?</div>
          <div className={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setFormData({ ...formData, rating: star })}
                className={`${styles.star} ${formData.rating >= star ? styles.starActive : ''}`}>
                ★
              </button>
            ))}
          </div>
          <textarea placeholder="Write your feedback..." className={styles.formText}
            onChange={e => setFormData({ ...formData, comment: e.target.value })} />
          <div className={styles.formBtns}>
            <button className="btn btn-purple btn-sm" onClick={() => updateStatus(taskId, 'done', formData)}>Submit Feedback</button>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveForm(null)}>Cancel</button>
          </div>
        </div>
      )
    }

    if (type === 'report') {
      return (
        <div className={styles.taskForm}>
          <div className={styles.formHeader}>Report Issue</div>
          <select className={styles.formSelect} onChange={e => setFormData({ ...formData, category: e.target.value })}>
            <option>Hostel Issue</option>
            <option>Academic Issue</option>
            <option>Canteen Issue</option>
            <option>Technical Issue</option>
          </select>
          <textarea placeholder="Describe the issue in detail..." className={styles.formText}
            onChange={e => setFormData({ ...formData, report: e.target.value })} />
          <div className={styles.formBtns}>
            <button className="btn btn-purple btn-sm" onClick={() => updateStatus(taskId, 'done', formData)}>Submit Report</button>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveForm(null)}>Cancel</button>
          </div>
        </div>
      )
    }

    if (type === 'profile') {
      return (
        <div className={styles.taskForm}>
          <div className={styles.formHeader}>Verify Profile Details</div>
          <input className={styles.formInput} placeholder="Full Name"
            onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <input className={styles.formInput} placeholder="University"
            onChange={e => setFormData({ ...formData, university: e.target.value })} />
          <div className={styles.formBtns}>
            <button className="btn btn-purple btn-sm" onClick={() => updateStatus(taskId, 'done', formData)}>Confirm & Complete</button>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveForm(null)}>Cancel</button>
          </div>
        </div>
      )
    }

    if (type === 'study') {
      return (
        <div className={styles.taskForm}>
          <div className={styles.formHeader}>Academic Study Portal</div>
          <p className={styles.formHint}>Paste your study summary or key takeaways below to complete this task.</p>
          <textarea placeholder="Enter study notes..." className={styles.formText}
            onChange={e => setFormData({ ...formData, notes: e.target.value })} />
          <div className={styles.formBtns}>
            <button className="btn btn-purple btn-sm" onClick={() => updateStatus(taskId, 'done', formData)}>Finish Study Session</button>
            <button className="btn btn-outline btn-sm" onClick={() => updateStatus(taskId, 'in_progress')}>Keep Studying</button>
            <button className="btn btn-link btn-sm" onClick={() => setActiveForm(null)} style={{ marginLeft: 'auto' }}>Collapse</button>
          </div>
        </div>
      )
    }

    if (type === 'event') {
      return (
        <div className={styles.taskForm}>
          <div className={styles.formHeader}>Event Registration</div>
          <div className={styles.ticketBox}>
            <div className={styles.ticketTop}>
              <span className={styles.ticketCat}>{task.category}</span>
              <span className={styles.ticketTitle}>{task.title}</span>
            </div>
            <div className={styles.ticketMain}>
              <div className={styles.qrMock}>
                <CheckSquare size={40} strokeWidth={1} />
                <span className={styles.qrText}>Generated Ticket</span>
              </div>
              <div className={styles.ticketDetails}>
                <span>Status: Confirmed</span>
                <span>Date: {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className={styles.formBtns}>
            <button className="btn btn-purple btn-sm" onClick={() => updateStatus(taskId, 'done')}>Confirm Attendance</button>
            <button className="btn btn-outline btn-sm" onClick={() => updateStatus(taskId, 'in_progress')}>Remind Me Later</button>
          </div>
        </div>
      )
    }

    return null
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const doneCount = tasks.filter(t => t.status === 'done').length

  return (
    <div className="page-wrap">
      <div className="sec-label">MY WORK</div>
      <h1 className={styles.title}>My Tasks</h1>
      <p className={styles.sub}>{tasks.filter(t => t.status !== 'done').length} tasks remaining</p>

      {/* Status summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <AlertCircle size={15} style={{ color: 'var(--yellow)' }} />
          <span>{pendingCount} Pending</span>
        </div>
        <div className={styles.summaryItem}>
          <Clock size={15} style={{ color: 'var(--purple2)' }} />
          <span>{inProgressCount} In Progress</span>
        </div>
        <div className={styles.summaryItem}>
          <CheckCircle size={15} style={{ color: 'var(--green)' }} />
          <span>{doneCount} Done</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: '3rem' }}>✅</div>
          <h3>No tasks assigned</h3>
          <p>You're all caught up! No tasks have been assigned to you.</p>
        </div>
      ) : (
        <div className={styles.categories}>
          {['Academic', 'Event', 'Administrative'].map(cat => {
            const catTasks = tasks.filter(t => (t.category || 'Administrative') === cat);
            if (catTasks.length === 0) return null;

            const icon = cat === 'Academic' ? '🎓' : cat === 'Event' ? '🎪' : '📋';

            return (
              <div key={cat} className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <span className={styles.catIcon}>{icon}</span>
                  <h2 className={styles.catTitle}>{cat} Tasks</h2>
                  <span className={styles.catCount}>{catTasks.length}</span>
                </div>

                <div className={styles.list}>
                  {catTasks.map((task, i) => (
                    <div key={task.id} className={`card ${styles.taskCard} ${activeForm?.id === task.id ? styles.cardActive : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className={styles.taskTop}>
                        <div className={styles.taskInfo}>
                          <div className={styles.taskTitle}>{task.title}</div>
                          {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                        </div>
                        <span className={`badge ${task.status === 'done' ? 'badge-green' : task.status === 'in_progress' ? 'badge-purple' : 'badge-yellow'}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className={styles.taskMeta}>
                        {task.due_date && (
                          <span className={styles.due}>
                            <Clock size={11} />
                            Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {task.created_by_name && (
                          <span className={styles.assignedBy}>Assigned by {task.created_by_name}</span>
                        )}
                      </div>

                      {task.status !== 'done' && (
                        <div className={styles.taskActions}>
                          {activeForm?.id === task.id ? (
                            renderForm(task.id, activeForm.type)
                          ) : (
                            <div className={styles.actionRow}>
                              {task.status === 'pending' && (
                                <button className="btn btn-outline btn-sm" onClick={() => handleStart(task)}>
                                  {task.category === 'Administrative' ? 'Open Form' : task.category === 'Event' ? 'Register' : 'Start Task'}
                                </button>
                              )}
                              <button className="btn btn-purple btn-sm" onClick={() => handleComplete(task)}>
                                <CheckCircle size={13} /> {task.category === 'Administrative' ? 'Complete Form' : 'Mark Done'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
