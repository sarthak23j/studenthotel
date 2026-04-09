import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setUser({ id: payload.sub, role: payload.role })
        }
        setLoading(false)
    }, [token])

    function login(token) {
        localStorage.setItem('token', token)
        setToken(token)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.sub, role: payload.role })
    }

    function logout() {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}