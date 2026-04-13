import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  
  const storedUser = localStorage.getItem('segregacy_user') 
    ? JSON.parse(localStorage.getItem('segregacy_user')) 
    : null;
    
  const currentUser = user || storedUser;

  if (!currentUser) return <Navigate to="/" replace />
  if (role && currentUser.role !== role) return <Navigate to="/" replace />
  
  return children
}
