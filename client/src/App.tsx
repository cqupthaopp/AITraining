import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { useTravelStore } from '@store/travelStore'
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import TravelPlanPage from '@pages/TravelPlanPage'
import BudgetPage from '@pages/BudgetPage'
import SettingsPage from '@pages/SettingsPage'
import NotFoundPage from '@pages/NotFoundPage'
import Header from '@components/Header'
import Sidebar from '@components/Sidebar'
import PrivateRoute from '@components/PrivateRoute'
import PublicRoute from '@components/PublicRoute'
import { Container, Box } from '@mui/material'

const App: React.FC = () => {
  const { token, initializeAuth } = useAuthStore()
  const { loadTravelPlans } = useTravelStore()

  useEffect(() => {
    // 初始化认证状态
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    // 当用户已认证时，加载旅行计划
    if (token) {
      loadTravelPlans()
    }
  }, [token, loadTravelPlans])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {token && <Sidebar />}
      <Box sx={{ flexGrow: 1 }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/plan/:id" element={
              <PrivateRoute>
                <TravelPlanPage />
              </PrivateRoute>
            } />
            <Route path="/budget/:id" element={
              <PrivateRoute>
                <BudgetPage />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

export default App