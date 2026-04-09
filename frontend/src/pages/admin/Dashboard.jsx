// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import styles from '../../styles/Dashboard.module.css'

export default function Dashboard() {
    const [stats,   setStats]   = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')

    useEffect(() => {
        async function fetchStats() {
            try {
                const [roomsRes, requestsRes, usersRes] = await Promise.all([
                    api.get('/rooms/'),
                    api.get('/allocations/'),
                    api.get('/users/'),
                ])

                const rooms    = roomsRes.data
                const requests = requestsRes.data
                const users    = usersRes.data

                setStats({
                    totalRooms:       rooms.length,
                    availableRooms:   rooms.filter(r => r.status === 'available').length,
                    occupiedRooms:    rooms.filter(r => r.status === 'occupied').length,
                    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
                    totalRequests:    requests.length,
                    pendingRequests:  requests.filter(r => r.status === 'pending').length,
                    approvedRequests: requests.filter(r => r.status === 'approved').length,
                    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
                    totalStudents:    users.filter(u => u.role === 'student').length,
                })
            } catch (err) {
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) return <div className={styles.center}>Loading...</div>
    if (error)   return <div className={styles.center}>{error}</div>

    return (
        <div>
            <Navbar />
            <div className={styles.page}>
                <h1 className={styles.heading}>Dashboard</h1>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Rooms</h2>
                    <div className={styles.grid}>
                        <StatCard label='Total Rooms'       value={stats.totalRooms}       />
                        <StatCard label='Available'         value={stats.availableRooms}   color='green' />
                        <StatCard label='Occupied'          value={stats.occupiedRooms}    color='red'   />
                        <StatCard label='Under Maintenance' value={stats.maintenanceRooms} color='yellow'/>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Requests</h2>
                    <div className={styles.grid}>
                        <StatCard label='Total Requests'  value={stats.totalRequests}    />
                        <StatCard label='Pending'         value={stats.pendingRequests}  color='yellow' />
                        <StatCard label='Approved'        value={stats.approvedRequests} color='green'  />
                        <StatCard label='Rejected'        value={stats.rejectedRequests} color='red'    />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Users</h2>
                    <div className={styles.grid}>
                        <StatCard label='Total Students' value={stats.totalStudents} />
                    </div>
                </section>
            </div>
        </div>
    )
}

function StatCard({ label, value, color }) {
    const colorClass = {
        green:  styles.green,
        red:    styles.red,
        yellow: styles.yellow,
    }[color] || ''

    return (
        <div className={`${styles.card} ${colorClass}`}>
            <span className={styles.cardValue}>{value}</span>
            <span className={styles.cardLabel}>{label}</span>
        </div>
    )
}