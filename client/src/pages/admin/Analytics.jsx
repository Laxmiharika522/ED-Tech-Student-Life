import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/services';
import {
    BarChart3, TrendingUp, Users, BookOpen,
    Download, Award, ArrowUpRight, ArrowDownRight,
    Search, Filter, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './Analytics.module.css';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await adminAPI.getAnalytics();
            setData(res.data.data.analytics);
        } catch (err) {
            toast.error('Failed to load platform analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    const { popularNotes, categoryStats, userGrowth } = data || {};

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Platform Analytics</h2>
                    <p className={styles.sub}>Deep visibility into content popularity and user growth</p>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Popular Notes Section */}
                <div className={styles.wideCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><Award size={18} /> Most Popular Notes</h3>
                        <p className={styles.cardSub}>Content with the highest student engagement</p>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Note Title</th>
                                    <th>Subject</th>
                                    <th>Uploader</th>
                                    <th>Downloads</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {popularNotes?.map((note, index) => (
                                    <tr key={note.id}>
                                        <td>
                                            <span className={index < 3 ? styles.topRank : styles.rank}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td className={styles.titleCell}>{note.title}</td>
                                        <td><span className={styles.tag}>{note.subject}</span></td>
                                        <td>{note.uploader_name}</td>
                                        <td className={styles.downloadCell}>
                                            <Download size={14} /> {note.downloads}
                                        </td>
                                        <td>
                                            <button className={styles.viewBtn}>
                                                <ExternalLink size={14} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category performance */}
                <div className={styles.sideCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><BookOpen size={18} /> Category Engagement</h3>
                    </div>
                    <div className={styles.catList}>
                        {categoryStats?.map(cat => (
                            <div key={cat.subject} className={styles.catItem}>
                                <div className={styles.catInfo}>
                                    <span className={styles.catName}>{cat.subject}</span>
                                    <span className={styles.catVal}>{cat.total_downloads} Dl.</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min(100, (cat.total_downloads / categoryStats[0].total_downloads) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Chart */}
                <div className={styles.fullCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}><TrendingUp size={18} /> User Growth (Last 14 Days)</h3>
                    </div>
                    <div className={styles.chartArea}>
                        <div className={styles.chartLabels}>
                            {userGrowth?.map(day => (
                                <div key={day.date} className={styles.chartCol}>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${(day.count / Math.max(...userGrowth.map(d => d.count), 1)) * 120}px` }}
                                        title={`${day.count} new users`}
                                    />
                                    <span className={styles.dateLbl}>{day.date.split('-').slice(1).join('/')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
