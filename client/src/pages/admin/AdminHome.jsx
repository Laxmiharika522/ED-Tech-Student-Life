import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/services';
import {
    Users, BookOpen, Heart, CheckCircle,
    ArrowUpRight, ArrowDownRight, Clock, Plus,
    Send, Calendar, CheckSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './AdminHome.module.css';

export default function AdminHome() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await adminAPI.getStats();
                const data = res.data.data;
                setStats(data.stats);
                setRecentUsers(data.stats.recentUsers || []);
            } catch (err) {
                toast.error('Failed to load dashboard metrics.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    const metricCards = [
        {
            label: 'Total Students',
            value: stats?.users?.students || 0,
            trend: '+12%',
            isUp: true,
            icon: <Users size={20} />,
            color: '#818cf8'
        },
        {
            label: 'Notes Uploaded',
            value: stats?.notes?.total_notes || 0,
            trend: '+5%',
            isUp: true,
            icon: <BookOpen size={20} />,
            color: '#c084fc'
        },
        {
            label: 'Pending Roommates',
            value: stats?.roommate?.total_profiles || 0,
            trend: '-2%',
            isUp: false,
            icon: <Heart size={20} />,
            color: '#f472b6'
        },
        {
            label: 'Tasks Completed',
            value: stats?.tasks?.done || 0,
            trend: '+18%',
            isUp: true,
            icon: <CheckCircle size={20} />,
            color: '#34d399'
        },
    ];

    return (
        <div className={styles.container}>
            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
                {metricCards.map((card, i) => (
                    <div key={i} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                                {card.icon}
                            </div>
                            <div className={`${styles.trend} ${card.isUp ? styles.trendUp : styles.trendDown}`}>
                                {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {card.trend}
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.metricValue}>{card.value.toLocaleString()}</div>
                            <div className={styles.metricLabel}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.middleRow}>
                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <h3 className={styles.sectionTitle}>Quick Actions</h3>
                    <div className={styles.actionGrid}>
                        <button className={styles.actionBtn}>
                            <div className={styles.actionIcon}><Plus size={20} /></div>
                            <span>Approve Notes</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <div className={styles.actionIcon}><Users size={20} /></div>
                            <span>Resolve Matches</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <div className={styles.actionIcon}><Calendar size={20} /></div>
                            <span>Schedule Tasks</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <div className={styles.actionIcon}><Send size={20} /></div>
                            <span>Send Broadcast</span>
                        </button>
                    </div>
                </div>

                {/* Analytics Mini-Chart Placeholder */}
                <div className={styles.miniAnalytics}>
                    <h3 className={styles.sectionTitle}>System Engagement</h3>
                    <div className={styles.chartPlaceholder}>
                        {/* Visual representation of a chart for now */}
                        <div className={styles.barPlaceholder} style={{ height: '60%' }} />
                        <div className={styles.barPlaceholder} style={{ height: '80%' }} />
                        <div className={styles.barPlaceholder} style={{ height: '45%' }} />
                        <div className={styles.barPlaceholder} style={{ height: '90%' }} />
                        <div className={styles.barPlaceholder} style={{ height: '70%' }} />
                        <div className={styles.barPlaceholder} style={{ height: '30%' }} />
                        <div className={styles.barPlaceholder} style={{ height: '85%' }} />
                    </div>
                    <div className={styles.chartLegend}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>

            <div className={styles.bottomRow}>
                {/* Recent Activity */}
                <div className={styles.recentActivity}>
                    <h3 className={styles.sectionTitle}>Recent Student Activity</h3>
                    <div className={styles.activityList}>
                        {recentUsers.length > 0 ? recentUsers.map(user => (
                            <div key={user.id} className={styles.activityItem}>
                                <div className={styles.activityUser}>
                                    <div className={styles.activityAvatar}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={styles.activityName}>{user.name}</div>
                                        <div className={styles.activityEmail}>{user.email}</div>
                                    </div>
                                </div>
                                <div className={styles.activityMeta}>
                                    <div className={styles.activityTag}>New Student</div>
                                    <div className={styles.activityTime}>
                                        <Clock size={12} /> {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyActivity}>No recent activity found.</div>
                        )}
                    </div>
                </div>

                {/* System Logs / Tasks */}
                <div className={styles.systemLogs}>
                    <h3 className={styles.sectionTitle}>Recent Automation Logs</h3>
                    <div className={styles.logList}>
                        <div className={styles.logItem}>
                            <div className={styles.logStatus} style={{ backgroundColor: '#34d399' }} />
                            <div className={styles.logInfo}>
                                <div className={styles.logTitle}>Weekly Newsletter Dispatched</div>
                                <div className={styles.logTime}>12 minutes ago</div>
                            </div>
                        </div>
                        <div className={styles.logItem}>
                            <div className={styles.logStatus} style={{ backgroundColor: '#818cf8' }} />
                            <div className={styles.logInfo}>
                                <div className={styles.logTitle}>User Verification Automated</div>
                                <div className={styles.logTime}>2 hours ago</div>
                            </div>
                        </div>
                        <div className={styles.logItem}>
                            <div className={styles.logStatus} style={{ backgroundColor: '#f472b6' }} />
                            <div className={styles.logInfo}>
                                <div className={styles.logTitle}>Database Backup Completed</div>
                                <div className={styles.logTime}>5 hours ago</div>
                            </div>
                        </div>
                    </div>
                    <button className={styles.viewAllBtn}>View All Logs</button>
                </div>
            </div>
        </div>
    );
}
