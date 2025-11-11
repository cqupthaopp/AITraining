import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Divider,
  Chip,
  Button,
  Grid,
  TextField,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material'
import {
  Add,
  Delete,
  Edit,
  Wallet,
  CalendarToday,
  MoreVert
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTravelStore } from '@store/travelStore'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPlanById, currentPlan, isLoading, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useTravelStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '餐饮',
    amount: '',
    date: '',
    notes: ''
  })
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null)

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
    if (id) {
      getPlanById(id)
    }
  }, [id, getPlanById])

  useEffect(() => {
    if (transcript) {
      // 解析语音输入，例如："午餐 120元"
      const match = transcript.match(/(.+?)\s*(\d+(?:\.\d+)?)元?/)
      if (match) {
        setFormData(prev => ({
          ...prev,
          name: match[1].trim(),
          amount: match[2]
        }))
      }
    }
  }, [transcript])

  const categories = ['餐饮', '交通', '住宿', '门票', '购物', '娱乐', '其他']
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#A8E6CF']

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        category: item.category,
        amount: item.amount.toString(),
        date: item.date,
        notes: item.notes || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        category: '餐饮',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingItem(null)
    setFormData({
      name: '',
      category: '餐饮',
      amount: '',
      date: '',
      notes: ''
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount || !formData.date) {
      setMessage({ text: '请填写必要信息', severity: 'error' })
      return
    }

    try {
      const budgetItem = {
        name: formData.name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes
      }

      if (editingItem) {
        await updateBudgetItem(id!, editingItem.id, budgetItem)
        setMessage({ text: '预算项更新成功', severity: 'success' })
      } else {
        await addBudgetItem(id!, budgetItem)
        setMessage({ text: '预算项添加成功', severity: 'success' })
      }
      handleCloseDialog()
    } catch (error) {
      setMessage({ text: '操作失败，请重试', severity: 'error' })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('确定要删除这个预算项吗？')) {
      try {
        await deleteBudgetItem(id!, itemId)
        setMessage({ text: '预算项已删除', severity: 'success' })
      } catch (error) {
        setMessage({ text: '删除失败，请重试', severity: 'error' })
      }
    }
  }

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      setMessage({ text: '浏览器不支持语音识别', severity: 'error' })
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

  const getBudgetSummary = () => {
    const summary: { [key: string]: number } = {} 
    currentPlan?.budgetItems.forEach(item => {
      summary[item.category] = (summary[item.category] || 0) + item.amount
    })
    return Object.entries(summary).map(([name, value]) => ({ name, value }))
  }

  const calculateTotalSpent = () => {
    return currentPlan?.budgetItems.reduce((sum, item) => sum + item.amount, 0) || 0
  }

  const calculateRemainingBudget = () => {
    return (currentPlan?.budget || 0) - calculateTotalSpent()
  }

  if (isLoading || !currentPlan) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  const totalSpent = calculateTotalSpent()
  const remainingBudget = calculateRemainingBudget()
  const budgetSummary = getBudgetSummary()

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {currentPlan.name} - 预算管理
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              icon={<Wallet fontSize="small" />} 
              label={`总预算 ¥${currentPlan.budget.toLocaleString()}`}
              color="primary"
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              icon={<Wallet fontSize="small" />} 
              label={`已花费 ¥${totalSpent.toLocaleString()}`}
              color={totalSpent > currentPlan.budget ? 'error' : 'success'}
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              icon={<Wallet fontSize="small" />} 
              label={`剩余 ¥${remainingBudget.toLocaleString()}`}
              color={remainingBudget < 0 ? 'error' : 'info'}
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          startIcon={<Add />}
          sx={{ ml: 2 }}
        >
          添加支出
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* 左侧：预算分析图表 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                支出分类统计
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetSummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {budgetSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  分类明细
                </Typography>
                {budgetSummary.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        bgcolor: COLORS[index % COLORS.length],
                        borderRadius: '50%',
                        mr: 2
                      }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="500">
                      ¥{item.value.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 右侧：支出记录表格 */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                支出记录
              </Typography>
              
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table aria-label="budget items table">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell>名称</TableCell>
                      <TableCell>分类</TableCell>
                      <TableCell align="right">金额 (¥)</TableCell>
                      <TableCell>日期</TableCell>
                      <TableCell>备注</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPlan.budgetItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          暂无支出记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentPlan.budgetItems
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell component="th" scope="row">
                              {item.name}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="small" 
                                label={item.category}
                                sx={{ 
                                  bgcolor: COLORS[categories.indexOf(item.category) % COLORS.length],
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                              {item.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.notes || '-'}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 添加/编辑预算项对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? '编辑支出' : '添加支出'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="支出名称"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="分类"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                variant="outlined"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="金额 (¥)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                variant="outlined"
                required
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleVoiceInput} color={isListening ? 'primary' : 'default'}>
                      {isListening ? '🎤 聆听中...' : '🎤'}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="日期"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="备注 (可选)"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? '更新' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar 
        open={!!message} 
        autoHideDuration={3000} 
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={message?.severity} sx={{ width: '100%' }}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default BudgetPage