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
import { Person, Mail, Key } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')

  const validateForm = () => {
    if (!name.trim()) {
      setFormError('请输入您的姓名')
      return false
    }
    if (!email.trim()) {
      setFormError('请输入邮箱地址')
      return false
    }
    if (!password.trim()) {
      setFormError('请输入密码')
      return false
    }
    if (password !== confirmPassword) {
      setFormError('两次输入的密码不一致')
      return false
    }
    if (password.length < 6) {
      setFormError('密码长度至少为6位')
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
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      // 错误处理已在 authStore 中完成
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 80, height: 80 }}>
            <Person fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold">
            创建账户
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            加入 AI 旅行规划师，开启智能旅行之旅
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
                id="name"
                label="您的姓名"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: <Person color="action" sx={{ mr: 2 }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="邮箱地址"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Key color="action" sx={{ mr: 2 }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="confirmPassword"
                label="确认密码"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? <CircularProgress size={20} color="inherit" /> : '注册'}
              </Button>
            </Grid>
          </Grid>
          
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <Typography variant="body2">
                已有账户？
                <Link component={RouterLink} to="/login" variant="body2" color="primary" fontWeight="bold">
                  {' 立即登录'}
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

export default RegisterPage