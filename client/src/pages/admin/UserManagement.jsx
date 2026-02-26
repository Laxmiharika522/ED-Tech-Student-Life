import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../api/services';
import {
    Search, Filter, MoreVertical, Edit2, Trash2,
    CheckCircle, XCircle, UserPlus, UserCheck, Shield, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './UserManagement.module.css';

export default function UserManagement() {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [filter, setFilter] = useState('all'); // all, student, admin, pending

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getUsers();
            setUsers(res.data.data.users);
        } catch {
            toast.error('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await adminAPI.updateUser(id, { is_verified: status });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: status } : u));
            toast.success(status ? 'User verified!' : 'User rejected.');
        } catch { toast.error('Action failed.'); }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchSearch;
        if (filter === 'admin') return matchSearch && u.role === 'admin';
        if (filter === 'student') return matchSearch && u.role === 'student';
        if (filter === 'pending') return matchSearch && !u.is_verified;
        return matchSearch;
    });

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>User Management</h2>
                    <p className={styles.sub}>View and manage student registrations and roles</p>
                </div>
                <button className="btn btn-purple"><UserPlus size={16} /> Add User</button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.filters}>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className={styles.select}>
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="admin">Admins</option>
                        <option value="pending">Pending Verification</option>
                    </select>
                    <button className={styles.filterBtn}><Filter size={16} /> Filters</button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name & Profile</th>
                            <th>Academic Info</th>
                            <th>Interests</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>
                                            {user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className={styles.userName}>{user.name}</div>
                                            <div className={styles.userEmail}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.academicInfo}>
                                        <div className={styles.major}>{user.major || 'Not set'}</div>
                                        <div className={styles.year}>{user.year ? `Year ${user.year}` : 'N/A'}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.interests}>
                                        {user.interests ? user.interests.split(',').slice(0, 2).map((interest, i) => (
                                            <span key={i} className={styles.interestTag}>{interest}</span>
                                        )) : '--'}
                                    </div>
                                </td>
                                <td>
                                    {user.is_verified ? (
                                        <span className={`${styles.statusTag} ${styles.verified}`}>
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    ) : (
                                        <span className={`${styles.statusTag} ${styles.pending}`}>
                                            <Clock size={12} /> Pending
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`${styles.roleTag} ${user.role === 'admin' ? styles.admin : styles.student}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        {!user.is_verified && (
                                            <button className={styles.actionIconBtn} title="Verify" onClick={() => handleVerify(user.id, true)}>
                                                <UserCheck size={16} color="#34d399" />
                                            </button>
                                        )}
                                        <button className={styles.actionIconBtn} title="Change Role">
                                            <Shield size={16} />
                                        </button>
                                        <button className={styles.actionIconBtn} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className={styles.actionIconBtn} title="Delete">
                                            <Trash2 size={16} color="#f87171" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className={styles.empty}>No students found matching your criteria.</div>
                )}
            </div>
        </div>
    );
}
