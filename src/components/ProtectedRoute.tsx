import React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // No authentication required - all routes accessible
  return <>{children}</>
}