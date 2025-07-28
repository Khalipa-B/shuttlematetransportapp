import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  // Get user role from Clerk metadata
  const userRole = user?.publicMetadata?.role || 'parent'

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute