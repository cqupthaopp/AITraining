const express = require('express')
const router = express.Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { protect } = require('../middleware/auth')

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // 验证输入
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      })
    }

    // 检查邮箱是否已存在
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      })
    }

    // 创建新用户
    const user = await User.create({
      name,
      email,
      password
    })

    // 生成JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      })
    }

    // 查找用户
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      })
    }

    // 验证密码
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      })
    }

    // 生成JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    })
  }
})

// 获取当前用户信息
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    })
  }
})

// 更新用户信息
router.put('/me', protect, async (req, res) => {
  try {
    const { name } = req.body
    const user = req.user

    if (name) {
      user.name = name
    }

    await user.save()

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    })
  }
})

// 保存阿里云百炼API Key
router.put('/api-keys/alicloud', protect, async (req, res) => {
  try {
    const { apiKey } = req.body
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的API Key'
      })
    }

    console.log('开始保存API Key，用户ID:', req.user._id)
    
    // 使用findOneAndUpdate方法直接更新数据库，确保字段被正确保存
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { 'apiKeys.alicloud': apiKey } },
      { new: true, runValidators: true, select: '+apiKeys' }
    )
    
    console.log('更新后查询结果:', { 
      userFound: !!updatedUser, 
      hasApiKeys: updatedUser?.apiKeys ? true : false,
      hasAliCloudKey: updatedUser?.apiKeys?.alicloud ? '存在但不显示' : '不存在'
    })
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    // 额外的验证查询，确保数据确实保存到了数据库
    const verificationQuery = await User.findById(req.user._id).select('+apiKeys')
    console.log('验证查询结果:', { 
      hasApiKeys: verificationQuery?.apiKeys ? true : false,
      hasAliCloudKey: verificationQuery?.apiKeys?.alicloud ? '存在但不显示' : '不存在'
    })
    
    // 如果验证查询显示API Key仍然不存在，返回警告
    if (!verificationQuery?.apiKeys?.alicloud) {
      console.warn('警告: API Key保存后验证查询未找到Key')
    }

    res.status(200).json({
      success: true,
      message: 'API Key 保存成功',
      saved: !!verificationQuery?.apiKeys?.alicloud
    })
  } catch (error) {
    console.error('保存API Key失败:', error.message, error.stack)
    res.status(500).json({
      success: false,
      message: `保存API Key失败: ${error.message}`
    })
  }
})

// 获取阿里云百炼API Key状态（不返回实际Key，只返回是否已设置）
router.get('/api-keys/alicloud/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+apiKeys')
    const hasApiKey = user.apiKeys && !!user.apiKeys.alicloud

    res.status(200).json({
      success: true,
      hasApiKey
    })
  } catch (error) {
    console.error('获取API Key状态失败:', error)
    res.status(500).json({
      success: false,
      message: '获取API Key状态失败'
    })
  }
})

module.exports = router