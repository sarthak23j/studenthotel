// src/components/Navbar.jsx
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Navbar.module.css'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate         = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/rooms',     label: 'Rooms'     },
        { to: '/admin/requests',  label: 'Requests'  },
    ]

    const studentLinks = [
        { to: '/student/home',      label: 'Home'       },
        { to: '/student/browse',    label: 'Browse'     },
        { to: '/student/myrequest', label: 'My Request' },
    ]

    const links = user?.role === 'admin' ? adminLinks : studentLinks

    return (
        <nav className={styles.navbar}>
            <span className={styles.brand}>Room Allotment</span>

            <div className={styles.links}>
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            isActive ? `${styles.link} ${styles.active}` : styles.link
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>

            <button className={styles.logout} onClick={handleLogout}>
                Logout
            </button>
        </nav>
    )
}