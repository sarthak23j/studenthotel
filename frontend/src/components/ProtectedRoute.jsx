// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to='/login' replace />

    if (role && user.role !== role) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/home'} replace />
    }

    return <Outlet />
}