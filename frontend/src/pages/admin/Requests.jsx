// src/pages/admin/Requests.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import styles from '../../styles/Requests.module.css'

export default function Requests() {
    const [requests, setRequests] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')
    const [filter,   setFilter]   = useState('all')

    useEffect(() => { fetchRequests() }, [])

    async function fetchRequests() {
        try {
            const res = await api.get('/allocations/')
            setRequests(res.data)
        } catch {
            setError('Failed to load requests')
        } finally {
            setLoading(false)
        }
    }

    async function handleAction(requestId, status) {
        try {
            await api.patch(`/allocations/${requestId}`, { status })
            await fetchRequests()
        } catch (err) {
            setError(err.response?.data?.detail || 'Action failed')
        }
    }

    const filtered = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter)

    if (loading) return <div className={styles.center}>Loading...</div>

    return (
        <div>
            <Navbar />
            <div className={styles.page}>

                <div className={styles.topbar}>
                    <h1 className={styles.heading}>Requests</h1>
                    <div className={styles.filters}>
                        {['all', 'pending', 'approved', 'rejected'].map(f => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                {filtered.length === 0
                    ? <p className={styles.empty}>No requests found.</p>
                    : <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>Student</span>
                            <span>Room</span>
                            <span>Date</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        {filtered.map(req => (
                            <div key={req.id} className={styles.tableRow}>
                                <span>{req.student?.name || `Student #${req.student_id}`}</span>
                                <span>{req.room?.room_number || `Room #${req.room_id}`}</span>
                                <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                <span>
                                    <span className={`${styles.badge} ${styles[req.status]}`}>
                                        {req.status}
                                    </span>
                                </span>
                                <span className={styles.actionBtns}>
                                    {req.status === 'pending' ? (
                                        <>
                                            <button
                                                className={styles.approveBtn}
                                                onClick={() => handleAction(req.id, 'approved')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={() => handleAction(req.id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className={styles.processed}>Processed</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}