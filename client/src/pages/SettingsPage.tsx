import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material'
import { AccountCircle, Lock, Settings as SettingsIcon, Key, Logout } from '@mui/icons-material'
import { useAuthStore } from '@store/authStore'
import { useTravelStore } from '@store/travelStore'
import { toast } from 'react-toastify'
import axios from 'axios'

const SettingsPage: React.FC = () => {
  const { user, updateUserProfile, logout, isLoading: authLoading } = useAuthStore()
  const { updateApiKey } = useTravelStore()
  const [name, setName] = useState(user?.name || '')
  const [apiKey, setApiKey] = useState(localStorage.getItem('alicloud_api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error('请输入姓名')
      return
    }
    
    try {
      await updateUserProfile(name)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (error) {
      toast.error('更新失败，请重试')
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('请输入有效的API Key')
      return
    }
    
    // 保存到localStorage
    updateApiKey(apiKey)
    
    // 保存到服务器数据库
    try {
      await axios.put('/api/auth/api-keys/alicloud', { apiKey })
      setApiKeySaved(true)
      toast.success('API Key 已成功保存到服务器')
    } catch (error: any) {
      console.error('保存API Key到服务器失败:', error.response?.data || error.message)
      toast.error(`服务器保存失败: ${error.response?.data?.message || '请稍后重试'}`)
    }
    
    setTimeout(() => setApiKeySaved(false), 3000)
  }
  
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('请先输入API Key')
      return
    }
    
    try {
      const response = await axios.post('/api/ai/validate-api-key')
      toast.success(response.data.message)
    } catch (error: any) {
      console.error('API Key验证失败 - 详细信息:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      const errorDetails = error.response?.data || {}
      const errorMessage = errorDetails.message || '验证失败，请稍后重试'
      
      // 显示更详细的错误信息
      let fullMessage = `验证失败: ${errorMessage}`
      if (errorDetails.errorDetails) {
        fullMessage += ` (详细信息: ${JSON.stringify(errorDetails.errorDetails)})`
      }
      
      toast.error(fullMessage)
    }
  }

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        系统设置
      </Typography>
      
      <Grid container spacing={4}>
        {/* 个人资料设置 */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: 'primary.main' }}>
                  <AccountCircle fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    个人资料
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    更新您的基本信息
                  </Typography>
                </Box>
              </Box>
              
              {profileSaved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  个人信息已更新
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="您的姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    disabled={authLoading}
                    InputProps={{
                      startAdornment: <AccountCircle color="action" sx={{ mr: 2 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="邮箱地址"
                    value={user?.email || ''}
                    variant="outlined"
                    disabled
                    InputProps={{
                      startAdornment: <Lock color="action" sx={{ mr: 2 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    disabled={authLoading}
                    startIcon={authLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                  >
                    保存更改
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* API Key 设置 */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 3, bgcolor: 'secondary.main' }}>
                  <Key fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    阿里云百炼 API Key
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    配置 API Key 以使用 AI 旅行规划功能
                  </Typography>
                </Box>
              </Box>
              
              {apiKeySaved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  API Key 已保存
                </Alert>
              )}
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  variant="outlined"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="请输入您的阿里云百炼大模型平台 API Key"
                  InputProps={{
                    startAdornment: <Key color="action" sx={{ mr: 2 }} />,
                  }}
                  helperText="您可以在阿里云百炼控制台获取 API Key"
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={showApiKey} 
                        onChange={() => setShowApiKey(!showApiKey)} 
                        color="primary"
                      />
                    }
                    label="显示 API Key"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSaveApiKey}
                    >
                      保存 API Key
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={validateApiKey}
                    >
                      验证 API Key
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              
              <Paper sx={{ mt: 3, p: 3, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  安全提示：
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>请妥善保管您的 API Key</li>
                  <li>API Key 仅存储在您的本地浏览器中</li>
                  <li>不要与他人分享您的 API Key</li>
                  <li>如果您的 API Key 泄露，请立即在阿里云控制台重新生成</li>
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* 其他设置 */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                其他设置
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                <Typography>暗色模式</Typography>
                <Switch color="primary" />
              </Box>
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                <Typography>自动保存</Typography>
                <Switch color="primary" defaultChecked />
              </Box>
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                <Typography>通知提醒</Typography>
                <Switch color="primary" defaultChecked />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 退出登录 */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{ py: 1.5 }}
          >
            退出登录
          </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          AI 旅行规划师 v1.0.0
        </Typography>
      </Box>
    </Container>
  )
}

export default SettingsPage