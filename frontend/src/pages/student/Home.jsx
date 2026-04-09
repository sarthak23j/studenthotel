// src/pages/student/Home.jsx
import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import styles from '../../styles/Home.module.css'

export default function Home() {
    const { user } = useAuth()
    const [request, setRequest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')

    useEffect(() => { fetchMyRequest() }, [])

    async function fetchMyRequest() {
        try {
            const res = await api.get('/allocations/my')
            // returns a list, grab the latest one
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            setRequest(sorted[0] || null)
        } catch {
            setError('Failed to load your request')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className={styles.center}>Loading...</div>

    return (
        <div>
            <Navbar />
            <div className={styles.page}>

                <div className={styles.welcome}>
                    <h1 className={styles.heading}>Welcome back</h1>
                    <p className={styles.sub}>Here's a summary of your room allotment status.</p>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.statusCard}>
                    <h2 className={styles.cardTitle}>Your Request Status</h2>

                    {!request ? (
                        <div className={styles.noRequest}>
                            <p>You haven't applied for a room yet.</p>
                            <a href='/student/browse' className={styles.browseLink}>
                                Browse available rooms →
                            </a>
                        </div>
                    ) : (
                        <div className={styles.requestInfo}>
                            <div className={styles.row}>
                                <span className={styles.label}>Room</span>
                                <span className={styles.value}>
                                    {request.room?.room_number || `Room #${request.room_id}`}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Floor</span>
                                <span className={styles.value}>
                                    {request.room?.floor ?? '—'}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Capacity</span>
                                <span className={styles.value}>
                                    {request.room?.capacity ? `${request.room.capacity} bed${request.room.capacity > 1 ? 's' : ''}` : '—'}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Applied On</span>
                                <span className={styles.value}>
                                    {new Date(request.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Status</span>
                                <span className={`${styles.badge} ${styles[request.status]}`}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <h3>Apply for a Room</h3>
                        <p>Browse all available rooms and submit a request.</p>
                        <a href='/student/browse' className={styles.infoLink}>Go to Browse →</a>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>Track Your Request</h3>
                        <p>View all your past and current allocation requests.</p>
                        <a href='/student/myrequest' className={styles.infoLink}>Go to My Request →</a>
                    </div>
                </div>

            </div>
        </div>
    )
}