// src/components/RoomCard.jsx
import styles from '../styles/RoomCard.module.css'

export default function RoomCard({ room, onAction, actionLabel, disabled }) {
    const statusClass = {
        available:   styles.available,
        occupied:    styles.occupied,
        maintenance: styles.maintenance,
    }[room.status]

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.roomNumber}>{room.room_number}</h3>
                <span className={`${styles.status} ${statusClass}`}>
                    {room.status}
                </span>
            </div>

            <div className={styles.details}>
                <div className={styles.detail}>
                    <span className={styles.label}>Floor</span>
                    <span className={styles.value}>{room.floor}</span>
                </div>
                <div className={styles.detail}>
                    <span className={styles.label}>Capacity</span>
                    <span className={styles.value}>{room.capacity} bed{room.capacity > 1 ? 's' : ''}</span>
                </div>
            </div>

            {onAction && (
                <button
                    className={styles.button}
                    onClick={() => onAction(room)}
                    disabled={disabled}
                >
                    {actionLabel || 'Select'}
                </button>
            )}
        </div>
    )
}