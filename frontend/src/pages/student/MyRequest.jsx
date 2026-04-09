// src/pages/student/MyRequest.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import styles from '../../styles/MyRequest.module.css'

export default function MyRequest() {
    const [requests, setRequests] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')
    const [cancelling, setCancelling] = useState(null) // request id being cancelled

    useEffect(() => { fetchRequests() }, [])

    async function fetchRequests() {
        try {
            const res = await api.get('/allocations/my')
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            setRequests(sorted)
        } catch {
            setError('Failed to load your requests')
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(requestId) {
        if (!window.confirm('Cancel this request?')) return
        setCancelling(requestId)
        try {
            await api.delete(`/allocations/${requestId}`)
            await fetchRequests()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to cancel request')
        } finally {
            setCancelling(null)
        }
    }

    if (loading) return <div className={styles.center}>Loading...</div>

    return (
        <div>
            <Navbar />
            <div className={styles.page}>
                <h1 className={styles.heading}>My Requests</h1>

                {error && <p className={styles.error}>{error}</p>}

                {requests.length === 0
                    ? (
                        <div className={styles.empty}>
                            <p>You haven't made any requests yet.</p>
                            <a href='/student/browse' className={styles.link}>
                                Browse available rooms →
                            </a>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {requests.map(req => (
                                <div key={req.id} className={styles.card}>
                                    <div className={styles.cardTop}>
                                        <div className={styles.roomInfo}>
                                            <span className={styles.roomNumber}>
                                                {req.room?.room_number || `Room #${req.room_id}`}
                                            </span>
                                            <span className={`${styles.badge} ${styles[req.status]}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        {req.status === 'pending' && (
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => handleCancel(req.id)}
                                                disabled={cancelling === req.id}
                                            >
                                                {cancelling === req.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.cardDetails}>
                                        <div className={styles.detail}>
                                            <span className={styles.label}>Floor</span>
                                            <span className={styles.value}>
                                                {req.room?.floor ?? '—'}
                                            </span>
                                        </div>
                                        <div className={styles.detail}>
                                            <span className={styles.label}>Capacity</span>
                                            <span className={styles.value}>
                                                {req.room?.capacity
                                                    ? `${req.room.capacity} bed${req.room.capacity > 1 ? 's' : ''}`
                                                    : '—'}
                                            </span>
                                        </div>
                                        <div className={styles.detail}>
                                            <span className={styles.label}>Applied On</span>
                                            <span className={styles.value}>
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    )
}