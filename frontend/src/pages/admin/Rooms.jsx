import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import RoomCard from '../../components/RoomCard'
import api from '../../api/axios'
import styles from '../../styles/Rooms.module.css'

const EMPTY_FORM = { room_number: '', floor: '', capacity: '', status: 'available' }

export default function Rooms() {
    const [rooms,       setRooms]       = useState([])
    const [loading,     setLoading]     = useState(true)
    const [error,       setError]       = useState('')
    const [formError,   setFormError]   = useState('')
    const [showForm,    setShowForm]    = useState(false)
    const [editingRoom, setEditingRoom] = useState(null)  // null = create, object = edit
    const [form,        setForm]        = useState(EMPTY_FORM)
    const [submitting,  setSubmitting]  = useState(false)

    useEffect(() => { fetchRooms() }, [])

    async function fetchRooms() {
        try {
            const res = await api.get('/rooms/')
            const sorted = res.data.sort((a, b) => a.room_number.localeCompare(b.room_number))
            setRooms(sorted)
        } catch {
            setError('Failed to load rooms')
        } finally {
            setLoading(false)
        }
    }

    function openCreate() {
        setEditingRoom(null)
        setForm(EMPTY_FORM)
        setFormError('')
        setShowForm(true)
    }

    function openEdit(room) {
        setEditingRoom(room)
        setForm({
            room_number: room.room_number,
            floor:       room.floor,
            capacity:    room.capacity,
            status:      room.status,
        })
        setFormError('')
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditingRoom(null)
        setForm(EMPTY_FORM)
        setFormError('')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        setSubmitting(true)

        const payload = {
            room_number: form.room_number,
            floor:       parseInt(form.floor),
            capacity:    parseInt(form.capacity),
            status:      form.status,
        }

        try {
            if (editingRoom) {
                await api.patch(`/rooms/${editingRoom.id}`, payload)
            } else {
                await api.post('/rooms/', payload)
            }
            await fetchRooms()
            closeForm()
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(room) {
        if (!window.confirm(`Delete room ${room.room_number}?`)) return
        try {
            await api.delete(`/rooms/${room.id}`)
            await fetchRooms()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete room')
        }
    }

    if (loading) return <div className={styles.center}>Loading...</div>

    return (
        <div>
            <Navbar />
            <div className={styles.page}>

                <div className={styles.topbar}>
                    <h1 className={styles.heading}>Rooms</h1>
                    <button className={styles.addButton} onClick={openCreate}>
                        + Add Room
                    </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                {rooms.length === 0
                    ? <p className={styles.empty}>No rooms found. Add one to get started.</p>
                    : <div className={styles.grid}>
                        {rooms.map(room => (
                            <div key={room.id} className={styles.cardWrapper}>
                                <RoomCard room={room} />
                                <div className={styles.actions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => openEdit(room)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(room)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>

            {/* Modal */}
            {showForm && (
                <div className={styles.overlay} onClick={closeForm}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {editingRoom ? 'Edit Room' : 'Add Room'}
                        </h2>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.field}>
                                <label>Room Number</label>
                                <input
                                    value={form.room_number}
                                    onChange={e => setForm({ ...form, room_number: e.target.value })}
                                    placeholder='e.g. A101'
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Floor</label>
                                <input
                                    type='number'
                                    value={form.floor}
                                    onChange={e => setForm({ ...form, floor: e.target.value })}
                                    placeholder='e.g. 1'
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Capacity</label>
                                <input
                                    type='number'
                                    value={form.capacity}
                                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                                    placeholder='e.g. 2'
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value='available'>Available</option>
                                    <option value='occupied'>Occupied</option>
                                    <option value='maintenance'>Maintenance</option>
                                </select>
                            </div>

                            {formError && <p className={styles.error}>{formError}</p>}

                            <div className={styles.modalActions}>
                                <button
                                    type='button'
                                    className={styles.cancelBtn}
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className={styles.submitBtn}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}