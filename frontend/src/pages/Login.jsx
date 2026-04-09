// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import styles from '../styles/Login.module.css'

export default function Login() {
    const { login } = useAuth()
    const navigate  = useNavigate()

    const [isLogin,  setIsLogin]  = useState(true)
    const [name,     setName]     = useState('')
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [role,     setRole]     = useState('student')
    const [error,    setError]    = useState('')
    const [success,  setSuccess]  = useState('')
    const [loading,  setLoading]  = useState(false)

    function parseError(err) {
        const detail = err.response?.data?.detail
        if (!detail)               return 'Something went wrong'
        if (Array.isArray(detail)) return 'Please check your inputs'
        return detail
    }

    function switchMode() {
        setIsLogin(!isLogin)
        setError('')
        setSuccess('')
        setName('')
        setEmail('')
        setPassword('')
        setRole('student')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (isLogin) {
                const res   = await api.post('/auth/login', { email, password })
                const token = res.data.access_token
                login(token)
                const payload = JSON.parse(atob(token.split('.')[1]))
                navigate(payload.role === 'admin' ? '/admin/dashboard' : '/student/home')
            } else {
                await api.post('/auth/register', { name, email, password, role })
                setSuccess('Account created! You can now sign in.')
                setIsLogin(true)
                setEmail('')
                setPassword('')
            }
        } catch (err) {
            setError(parseError(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Room Allotment</h1>
                <p className={styles.subtitle}>
                    {isLogin ? 'Sign in to continue' : 'Create an account'}
                </p>

                <form className={styles.form} onSubmit={handleSubmit}>

                    {!isLogin && (
                        <div className={styles.field}>
                            <label>Name</label>
                            <input
                                type='text'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder='Your full name'
                                required
                            />
                        </div>
                    )}

                    <div className={styles.field}>
                        <label>Email</label>
                        <input
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder='you@example.com'
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder='••••••••'
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className={styles.field}>
                            <label>Role</label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                <option value='student'>Student</option>
                                <option value='admin'>Admin</option>
                            </select>
                        </div>
                    )}

                    {error   && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}

                    <button
                        type='submit'
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading
                            ? isLogin ? 'Signing in...' : 'Creating account...'
                            : isLogin ? 'Sign In'       : 'Create Account'
                        }
                    </button>
                </form>

                <p className={styles.toggle}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    {' '}
                    <button className={styles.toggleBtn} onClick={switchMode}>
                        {isLogin ? 'Register' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    )
}