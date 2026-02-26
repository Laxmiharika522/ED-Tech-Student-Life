import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/services';
import {
    Search, Filter, BookOpen, Trash2,
    CheckCircle, XCircle, ExternalLink, AlertTriangle, Download, MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './NoteModeration.module.css';

export default function NoteModeration() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, approved, flagged

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getNotes();
            setNotes(res.data.data.notes || []);
        } catch (err) {
            toast.error('Failed to load notes.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'delete') {
                if (!confirm('Permanently delete this note?')) return;
                await adminAPI.deleteNote(id);
                setNotes(prev => prev.filter(n => n.id !== id));
                toast.success('Note deleted.');
            } else if (action === 'approve') {
                await adminAPI.approveNote(id, true);
                setNotes(prev => prev.map(n => n.id === id ? { ...n, is_approved: 1 } : n));
                toast.success('Note approved!');
            } else if (action === 'flag') {
                await adminAPI.approveNote(id, false);
                setNotes(prev => prev.map(n => n.id === id ? { ...n, is_approved: 0 } : n));
                toast.success('Note flagged.');
            }
        } catch {
            toast.error('Action failed.');
        }
    };

    const filteredNotes = notes.filter(n => {
        const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.subject.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchSearch;
        if (filter === 'pending') return matchSearch && (n.is_approved === 0 || n.is_approved === null); // assuming 0 is pending/flagged
        if (filter === 'approved') return matchSearch && n.is_approved === 1;
        // Adjust logic based on how is_approved is stored (usually 1 for approved, 0 for pending/flagged)
        return matchSearch;
    });

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Note Moderation</h2>
                    <p className={styles.sub}>Review and manage academic notes shared by students</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>{notes.filter(n => !n.is_approved).length}</span>
                        <span className={styles.statLbl}>Pending</span>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by title or subject..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className={styles.select}>
                    <option value="all">All Notes</option>
                    <option value="pending">Pending/Flagged</option>
                    <option value="approved">Approved</option>
                </select>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Note Details</th>
                            <th>Uploader</th>
                            <th>Status</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotes.map(note => (
                            <tr key={note.id}>
                                <td>
                                    <div className={styles.noteInfo}>
                                        <div className={styles.noteIcon}><BookOpen size={18} /></div>
                                        <div>
                                            <div className={styles.noteTitle}>{note.title}</div>
                                            <div className={styles.noteSubject}>{note.subject}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.uploader}>
                                        <div className={styles.uploaderName}>{note.uploader_name || 'Anonymous'}</div>
                                    </div>
                                </td>
                                <td>
                                    {note.is_approved ? (
                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                            <CheckCircle size={12} /> Approved
                                        </span>
                                    ) : (
                                        <span className={`${styles.badge} ${styles.badgeWarning}`}>
                                            <AlertTriangle size={12} /> Pending
                                        </span>
                                    )}
                                </td>
                                <td>{new Date(note.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <a href={note.file_url} target="_blank" rel="noreferrer" className={styles.actionBtn} title="View Source">
                                            <ExternalLink size={16} />
                                        </a>
                                        {!note.is_approved ? (
                                            <button className={styles.actionBtn} onClick={() => handleAction(note.id, 'approve')} title="Approve">
                                                <CheckCircle size={16} color="#34d399" />
                                            </button>
                                        ) : (
                                            <button className={styles.actionBtn} onClick={() => handleAction(note.id, 'flag')} title="Flag/Reject">
                                                <XCircle size={16} color="#fbbf24" />
                                            </button>
                                        )}
                                        <button className={styles.actionBtn} onClick={() => handleAction(note.id, 'delete')} title="Delete">
                                            <Trash2 size={16} color="#f87171" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredNotes.length === 0 && (
                    <div className={styles.empty}>No notes found matching your criteria.</div>
                )}
            </div>
        </div>
    );
}
