import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { token, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    // 可以在这里返回一个加载指示器
    return null
  }

  if (token) {
    // 如果已经认证，重定向到首页
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default PublicRoute