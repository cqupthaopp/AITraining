import React, { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Link,
  Alert
} from '@mui/material'
import { Lock, Mail, Key } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('请输入邮箱地址')
      return false
    }
    if (!password.trim()) {
      setFormError('请输入密码')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('请输入有效的邮箱地址')
      return false
    }
    setFormError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      // 错误处理已在 authStore 中完成
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 12 }}>
      <Paper elevation={3} sx={{ p: 6, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 80, height: 80 }}>
            <Lock fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold">
            登录 AI 旅行规划师
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            欢迎回来，请登录您的账户
          </Typography>
        </Box>

        {error || formError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || formError}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="邮箱地址"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <Mail color="action" sx={{ mr: 2 }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="密码"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Key color="action" sx={{ mr: 2 }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : '登录'}
              </Button>
            </Grid>
          </Grid>
          
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <Typography variant="body2">
                还没有账户？
                <Link component={RouterLink} to="/register" variant="body2" color="primary" fontWeight="bold">
                  {' 立即注册'}
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} AI 旅行规划师 - 让旅行更智能
        </Typography>
      </Box>
    </Container>
  )
}

export default LoginPage