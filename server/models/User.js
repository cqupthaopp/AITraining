const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入您的姓名'],
    trim: true,
    minlength: [2, '姓名长度至少为2个字符'],
    maxlength: [50, '姓名长度不能超过50个字符']
  },
  email: {
    type: String,
    required: [true, '请输入邮箱地址'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '请设置密码'],
    minlength: [6, '密码长度至少为6个字符'],
    select: false // 默认不返回密码字段
  },
  apiKeys: {
    alicloud: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 密码加密中间件
userSchema.pre('save', async function(next) {
  // 只有当密码被修改时才加密
  if (!this.isModified('password')) return next()
  
  try {
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// 更新时间中间件
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User