import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/services';
import {
    Users, Heart, Zap, Clock, Shield,
    UserCheck, UserX, Info, TrendingUp, PieChart, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './RoommateManagement.module.css';

export default function RoommateManagement() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getRoommateStats();
            setStats(res.data.data);
        } catch (err) {
            toast.error('Failed to load roommate analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    const { profiles, matches, recentMatches } = stats || {};

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Roommate Match Analytics</h2>
                    <p className={styles.sub}>Monitor student profiles, behavioral trends, and matching health</p>
                </div>
                <div className={styles.quickStats}>
                    <div className={styles.qStatItem}>
                        <div className={styles.qStatIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <Users size={18} />
                        </div>
                        <div>
                            <div className={styles.qStatVal}>{profiles?.total_profiles || 0}</div>
                            <div className={styles.qStatLbl}>Total Profiles</div>
                        </div>
                    </div>
                    <div className={styles.qStatItem}>
                        <div className={styles.qStatIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Heart size={18} />
                        </div>
                        <div>
                            <div className={styles.qStatVal}>{matches?.accepted_matches || 0}</div>
                            <div className={styles.qStatLbl}>Pairs Matched</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Profile Distribution */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><PieChart size={18} /> Profile Demographics</h3>
                    </div>
                    <div className={styles.metricList}>
                        <div className={styles.metricRow}>
                            <span>Male Students</span>
                            <span className={styles.metricVal}>{profiles?.male_profiles || 0}</span>
                        </div>
                        <div className={styles.metricRow}>
                            <span>Female Students</span>
                            <span className={styles.metricVal}>{profiles?.female_profiles || 0}</span>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.metricRow}>
                            <span>Active Searchers</span>
                            <span className={styles.metricVal} style={{ color: '#10b981' }}>{profiles?.active_profiles || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Behavioral Trends */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><Zap size={18} /> Behavioral Averages</h3>
                    </div>
                    <div className={styles.behaviorList}>
                        <div className={styles.behaviorItem}>
                            <div className={styles.bLabel}>
                                <span>Cleanliness Score</span>
                                <span>{parseFloat(profiles?.avg_cleanliness || 0).toFixed(1)}/5.0</span>
                            </div>
                            <div className={styles.bBar}>
                                <div className={styles.bFill} style={{ width: `${(profiles?.avg_cleanliness || 0) * 20}%`, background: '#818cf8' }} />
                            </div>
                        </div>
                        <div className={styles.behaviorItem}>
                            <div className={styles.bLabel}>
                                <span>Night Owl Score</span>
                                <span>{parseFloat(profiles?.avg_sleep || 0).toFixed(1)}/5.0</span>
                            </div>
                            <div className={styles.bBar}>
                                <div className={styles.bFill} style={{ width: `${(profiles?.avg_sleep || 0) * 20}%`, background: '#f472b6' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Match Efficiency */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><TrendingUp size={18} /> Match Efficiency</h3>
                    </div>
                    <div className={styles.matchStats}>
                        <div className={styles.efficiencyCircle}>
                            <div className={styles.effVal}>
                                {matches?.total_matches ? Math.round((matches.accepted_matches / matches.total_matches) * 100) : 0}%
                            </div>
                            <div className={styles.effLbl}>Success Rate</div>
                        </div>
                        <div className={styles.effDetails}>
                            <div className={styles.effRow}>
                                <div className={styles.dot} style={{ background: '#10b981' }} />
                                <span>Accepted: {matches?.accepted_matches || 0}</span>
                            </div>
                            <div className={styles.effRow}>
                                <div className={styles.dot} style={{ background: '#f59e0b' }} />
                                <span>Pending: {matches?.pending_matches || 0}</span>
                            </div>
                            <div className={styles.effRow}>
                                <div className={styles.dot} style={{ background: '#ef4444' }} />
                                <span>Rejected: {matches?.rejected_matches || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.sectionTitle}>
                <Activity size={18} /> Recent Successful Matches
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Match Score</th>
                            <th>Student A</th>
                            <th>Student B</th>
                            <th>Matched On</th>
                            <th>Portal Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentMatches?.map(match => (
                            <tr key={match.id}>
                                <td>
                                    <div className={styles.scoreBadge}>
                                        {Math.round(match.match_score)}%
                                    </div>
                                </td>
                                <td>{match.user1_name}</td>
                                <td>{match.user2_name}</td>
                                <td>{new Date(match.created_at).toLocaleDateString()}</td>
                                <td>
                                    <span className={styles.successBadge}>
                                        <UserCheck size={12} /> Connected
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {recentMatches?.length === 0 && (
                    <div className={styles.empty}>No successful matches recorded yet.</div>
                )}
            </div>
        </div>
    );
}
