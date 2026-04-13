import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ecoevent_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ecoevent_token')
    if (token) {
      authAPI.me()
        .then(res => {
          setUser(res.data.user)
          localStorage.setItem('ecoevent_user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('ecoevent_token')
          localStorage.removeItem('ecoevent_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loginUser = (token, userData) => {
    localStorage.setItem('ecoevent_token', token)
    localStorage.setItem('ecoevent_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('ecoevent_token')
    localStorage.removeItem('ecoevent_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
