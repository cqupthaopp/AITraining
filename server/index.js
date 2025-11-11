const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// 确保日志目录存在
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// 加载环境变量
dotenv.config()

// 创建Express应用
const app = express()
const PORT = process.env.PORT || 5000

// 中间件配置
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// 配置数据库连接函数（简化重试机制）
async function connectDB() {
  const maxRetries = 2
  let retries = 0
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-planner', {})
      console.log('MongoDB 连接成功')
      return true
    } catch (err) {
      retries++
      console.error(`MongoDB 连接失败 (尝试 ${retries}/${maxRetries}):`, err.message)
      if (retries < maxRetries) {
        const waitTime = 2000
        console.log(`将在 ${waitTime/1000} 秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  console.error('MongoDB 连接失败，已达到最大重试次数')
  return false
}

// 导入路由
const authRoutes = require('./routes/authRoutes')
const travelRoutes = require('./routes/travelRoutes')
const aiRoutes = require('./routes/aiRoutes')

// 使用路由
app.use('/api/auth', authRoutes)
app.use('/api/plans', travelRoutes)
app.use('/api/ai', aiRoutes)

// 静态文件服务（用于生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/client')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client', 'index.html'))
  })
}

// 根路径端点 - 解决Cannot GET /问题
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Travel Planner API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      plans: '/api/plans',
      ai: '/api/ai'
    }
  })
})

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Travel Planner API is running' })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({
    success: false,
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  })
})

// 启动服务器
async function startServer() {
  try {
    // 先连接数据库
    const dbConnected = await connectDB()
    
    // 数据库连接失败时，仍然启动服务器（但可能部分功能不可用）
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`)
      console.log(`健康检查: http://localhost:${PORT}/health`)
      if (!dbConnected) {
        console.warn('警告: 数据库连接失败，但服务器已启动。部分功能可能不可用。')
      }
    })
  } catch (err) {
    console.error('启动服务器时发生错误:', err)
    // 尝试直接启动服务器，即使出错
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`)
      console.log(`健康检查: http://localhost:${PORT}/health`)
      console.error('注意: 服务器以受限模式启动，可能存在错误。')
    })
  }
}

// 启动应用
startServer()