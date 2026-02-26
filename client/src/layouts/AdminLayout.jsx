import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3, Users, BookOpen, Heart,
    LogOut, Search, Bell, Menu, X, Bot, LayoutDashboard
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const SIDEBAR_LINKS = [
    { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={18} />, label: 'Users / Students' },
    { path: '/admin/notes', icon: <BookOpen size={18} />, label: 'Note-Sharing' },
    { path: '/admin/roommates', icon: <Heart size={18} />, label: 'Roommate Matching' },
    { path: '/admin/tasks', icon: <Bot size={18} />, label: 'Tasks / Automation' },
    { path: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState('');

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && search.trim()) {
            navigate(`/admin/users?q=${encodeURIComponent(search.trim())}`);
        }
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarHeader}>
                    <Link to="/" className={styles.logo}>
                        <div className={styles.logoIcon}><Zap size={16} fill="#fff" strokeWidth={0} /></div>
                        <span className={styles.logoText}>Campus<b>Admin</b></span>
                    </Link>
                    <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {SIDEBAR_LINKS.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === '/admin'}
                            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        >
                            <span className={styles.navIcon}>{link.icon}</span>
                            <span className={styles.navLabel}>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
                        <LogOut size={18} />
                        <span className={styles.navLabel}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.main}>
                {/* Top Bar */}
                <header className={styles.topBar}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.topBarActions}>
                        <button className={styles.iconBtn} title="System Notifications">
                            <Bell size={18} />
                            <span className={styles.notificationDot} />
                        </button>

                        <div className={styles.adminProfile}>
                            <div className={styles.adminInfo}>
                                <div className={styles.adminName}>{user?.name}</div>
                                <div className={styles.adminRole}>Administrator</div>
                            </div>
                            <div className={styles.avatar}>{initials}</div>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className={styles.content}>
                    <Outlet />
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <div className={styles.footerText}>© 2026 Campus Catalyst. Admin Console v2.0</div>
                    <div className={styles.footerLinks}>
                        <a href="#">Support</a>
                        <a href="#">Documentation</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}

// Minimal Zap icon component within the file for now or import from Navbar
function Zap({ size, fill, strokeWidth }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={fill || "none"}
            stroke="currentColor"
            strokeWidth={strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}
