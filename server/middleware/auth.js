const jwt = require('jsonwebtoken')
const User = require('../models/User')

// 认证中间件，验证用户身份
exports.protect = async (req, res, next) => {
  let token

  // 检查Authorization头
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // 如果没有token，返回未授权错误
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权，请先登录'
    })
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

    // 根据token中的用户ID查找用户
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 将用户信息存储在请求对象中
    req.user = user
    next()
  } catch (error) {
    // 处理token验证错误
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '登录已过期，请重新登录'
      })
    }
    
    res.status(401).json({
      success: false,
      message: '无效的认证信息'
    })
  }
}

// 可选认证中间件，不会阻止未认证用户访问
exports.optionalAuth = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next() // 没有token，继续处理请求
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.id)
    
    if (user) {
      req.user = user
    }
    
    next()
  } catch (error) {
    // token无效，忽略并继续处理请求
    next()
  }
}