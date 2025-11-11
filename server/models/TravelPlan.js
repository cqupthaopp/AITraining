const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

// 目的地子文档
const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: undefined
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  }
})

// 每日活动子文档
const activitySchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  destination: {
    type: destinationSchema,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
})

// 每日行程子文档
const dailyScheduleSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  activities: {
    type: [activitySchema],
    default: []
  },
  accommodation: {
    type: destinationSchema,
    default: undefined
  }
})

// 预算项子文档
const budgetItemSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
})

// 主旅行计划模型
const travelPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, '请输入旅行计划名称'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, '请输入目的地'],
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  people: {
    type: Number,
    required: true,
    min: 1
  },
  preferences: {
    type: String,
    default: ''
  },
  schedule: {
    type: [dailyScheduleSchema],
    default: []
  },
  budgetItems: {
    type: [budgetItemSchema],
    default: []
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

// 更新时间中间件
travelPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

travelPlanSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() })
  next()
})

// 虚拟属性：计算总花费
travelPlanSchema.virtual('totalSpent').get(function() {
  return this.budgetItems.reduce((sum, item) => sum + item.amount, 0)
})

// 虚拟属性：计算剩余预算
travelPlanSchema.virtual('remainingBudget').get(function() {
  return this.budget - this.totalSpent
})

const TravelPlan = mongoose.model('TravelPlan', travelPlanSchema)

module.exports = TravelPlan