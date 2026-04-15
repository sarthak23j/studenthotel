// src/pages/student/Browse.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import RoomCard from '../../components/RoomCard'
import api from '../../api/axios'
import styles from '../../styles/Browse.module.css'

export default function Browse() {
    const [rooms,       setRooms]       = useState([])
    const [loading,     setLoading]     = useState(true)
    const [error,       setError]       = useState('')
    const [success,     setSuccess]     = useState('')
    const [hasRequest,  setHasRequest]  = useState(false)
    const [submitting,  setSubmitting]  = useState(null) // room id being submitted

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const [roomsRes, requestsRes] = await Promise.all([
                api.get('/rooms/'),
                api.get('/allocations/my'),
            ])
            const sorted = roomsRes.data.sort((a, b) => a.room_number.localeCompare(b.room_number))
            setRooms(sorted)
            const hasPending = requestsRes.data.some(r => r.status === 'pending')
            setHasRequest(hasPending)
        } catch {
            setError('Failed to load rooms')
        } finally {
            setLoading(false)
        }
    }

    async function handleApply(room) {
        setError('')
        setSuccess('')
        setSubmitting(room.id)
        try {
            await api.post('/allocations/', { room_id: room.id })
            setSuccess(`Successfully applied for room ${room.room_number}!`)
            setHasRequest(true)
            await fetchData()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to apply')
        } finally {
            setSubmitting(null)
        }
    }

    const availableRooms = rooms.filter(r => r.status === 'available')
    const otherRooms     = rooms.filter(r => r.status !== 'available')

    if (loading) return <div className={styles.center}>Loading...</div>

    return (
        <div>
            <Navbar />
            <div className={styles.page}>
                <h1 className={styles.heading}>Browse Rooms</h1>

                {hasRequest && (
                    <div className={styles.banner}>
                        You already have a pending request. Cancel it from{' '}
                        <a href='/student/myrequest'>My Request</a> to apply for another room.
                    </div>
                )}

                {error   && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Available <span>{availableRooms.length}</span>
                    </h2>

                    {availableRooms.length === 0
                        ? <p className={styles.empty}>No available rooms at the moment.</p>
                        : <div className={styles.grid}>
                            {availableRooms.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onAction={handleApply}
                                    actionLabel={submitting === room.id ? 'Applying...' : 'Apply'}
                                    disabled={hasRequest || submitting !== null}
                                />
                            ))}
                        </div>
                    }
                </section>

                {otherRooms.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Other Rooms</h2>
                        <div className={styles.grid}>
                            {otherRooms.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}