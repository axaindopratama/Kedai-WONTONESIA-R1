import React from 'react'
import { Navigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  // Authentication disabled - redirect to menu
  return <Navigate to="/menu" replace />
}