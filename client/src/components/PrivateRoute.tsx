import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { Box, CircularProgress, Typography } from '@mui/material'

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { token, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    // 显示加载指示器
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">正在加载...</Typography>
      </Box>
    )
  }

  if (!token) {
    // 如果没有认证，重定向到登录页
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default PrivateRoute