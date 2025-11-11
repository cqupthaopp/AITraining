import React from 'react'
import {
  Container,
  Typography,
  Button,
  Box
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h1" component="div" sx={{ fontSize: '5rem', fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
        页面未找到
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 500, mx: 'auto' }}>
        抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续使用应用。
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        startIcon={<ArrowBack />}
        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
      >
        返回首页
      </Button>
    </Container>
  )
}

export default NotFoundPage