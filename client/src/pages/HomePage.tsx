import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Grid,
  Divider,
  Container,
  Tooltip,
  CircularProgress
} from '@mui/material'
import {
  Mic,
  MicOff,
  CalendarToday,
  Map,
  People,
  Wallet,
  Star,
  Delete,
  Edit,
  ChevronRight,
  Add,
  Search
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useTravelStore } from '@store/travelStore'
import { useAuthStore } from '@store/authStore'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { plans, generatePlanWithAI, deletePlan, isLoading } = useTravelStore()
  const [prompt, setPrompt] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 语音识别配置
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    continuous: false,
    language: 'zh-CN'
  })

  useEffect(() => {
    if (transcript) {
      setPrompt(transcript)
    }
  }, [transcript])

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('您的浏览器不支持语音识别功能')
      return
    }

    if (listening) {
      SpeechRecognition.stopListening()
      setIsListening(false)
    } else {
      resetTranscript()
      SpeechRecognition.startListening()
      setIsListening(true)
    }
  }

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) {
      alert('请输入旅行需求')
      return
    }
    
    try {
      // 创建一个符合后端API要求的计划数据对象
      // 注意：在实际应用中，应该从表单中收集这些数据
      // 这里为了演示，使用一些默认值和提示词作为目的地
      const planData = {
        destination: prompt, // 暂时将提示词作为目的地
        duration: 3, // 默认3天
        budget: 5000, // 默认预算5000元
        people: 2, // 默认2人
        preferences: '无特殊偏好', // 默认偏好
        startDate: new Date().toISOString().split('T')[0], // 默认为今天
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3天后
      }
      
      await generatePlanWithAI(planData)
      setPrompt('')
    } catch (error) {
      console.error('生成计划失败', error)
    }
  }

  const handleDeletePlan = (id: string) => {
    if (window.confirm('确定要删除这个旅行计划吗？')) {
      deletePlan(id)
    }
  }

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* 左侧：AI 生成旅行计划 */}
        <Grid item xs={12} md={5} lg={4}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" color="primary">
                智能旅行规划
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                通过语音或文字描述您的旅行需求，AI将为您生成个性化的旅行计划
              </Typography>
              
              <Box sx={{ mt: 3, position: 'relative' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="输入您的旅行需求"
                  placeholder="例如：我想去日本东京，5天，预算1万元，喜欢美食和动漫，带孩子"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  inputRef={inputRef}
                  sx={{ mb: 2 }}
                />
                <Tooltip title={isListening ? "停止语音输入" : "开始语音输入"}>
                  <IconButton
                    color="primary"
                    onClick={handleVoiceInput}
                    sx={{ position: 'absolute', bottom: 12, right: 12 }}
                  >
                    {isListening ? <MicOff color="secondary" /> : <Mic />}
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleGeneratePlan}
                disabled={isLoading || !prompt.trim()}
                sx={{ mt: 2, py: 1.5 }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
              >
                {isLoading ? '生成中...' : '生成旅行计划'}
              </Button>
              
              <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  小贴士：
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>请明确说明目的地、天数、预算</li>
                  <li>提及您的旅行偏好（美食、购物、文化等）</li>
                  <li>说明同行人数和特殊需求</li>
                  <li>可以指定旅行季节或日期</li>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 右侧：旅行计划列表 */}
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              我的旅行计划
            </Typography>
          </Box>

          <Paper sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center' }}>
            <Search color="action" />
            <TextField
              fullWidth
              placeholder="搜索旅行计划..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ ml: 2 }}
            />
          </Paper>

          {filteredPlans.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                还没有旅行计划
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                使用左侧的AI助手生成您的第一个旅行计划
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredPlans.map((plan) => (
                <Grid item xs={12} sm={6} md={12} key={plan._id}>
                  <Card 
                    sx={{ 
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box flexGrow={1}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {plan.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Map fontSize="small" color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="primary">
                              {plan.destination}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Chip 
                              size="small" 
                              icon={<CalendarToday fontSize="small" />} 
                              label={`${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}`}
                              sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                            />
                            <Chip 
                              size="small" 
                              icon={<People fontSize="small" />} 
                              label={`${plan.people} 人`}
                            />
                            <Chip 
                              size="small" 
                              icon={<Wallet fontSize="small" />} 
                              label={`预算 ¥${plan.budget.toLocaleString()}`}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            创建于 {formatDate(plan.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/plan/${plan._id}`)}
                            endIcon={<ChevronRight fontSize="small" />}
                            sx={{ textTransform: 'none', borderRadius: 1 }}
                          >
                            查看
                          </Button>
                          <Tooltip title="删除">
                            <IconButton
                              size="small" 
                              color="error" 
                              onClick={() => handleDeletePlan(plan._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            行程概览
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '70%' }}>
                            {plan.preferences || '根据您的偏好定制的旅行计划'}
                          </Typography>
                        </Box>
                        <Button
                          variant="text"
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/budget/${plan._id}`)}
                          startIcon={<Wallet fontSize="small" />}
                        >
                          管理预算
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default HomePage