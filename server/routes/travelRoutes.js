const express = require('express')
const router = express.Router()
const TravelPlan = require('../models/TravelPlan')
const { protect } = require('../middleware/auth')

// 获取用户的所有旅行计划
router.get('/', protect, async (req, res) => {
  try {
    const plans = await TravelPlan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('name destination startDate endDate budget createdAt')

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    })
  } catch (error) {
    console.error('获取旅行计划失败:', error)
    res.status(500).json({
      success: false,
      message: '获取旅行计划失败'
    })
  }
})

// 创建新的旅行计划
router.post('/', protect, async (req, res) => {
  try {
    const { name, destination, startDate, endDate, duration, budget, people, preferences } = req.body

    // 验证必填字段
    if (!name || !destination || !startDate || !endDate || !duration || !budget || !people) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      })
    }

    const newPlan = await TravelPlan.create({
      user: req.user._id,
      name,
      destination,
      startDate,
      endDate,
      duration,
      budget,
      people,
      preferences
    })

    res.status(201).json({
      success: true,
      plan: newPlan
    })
  } catch (error) {
    console.error('创建旅行计划失败:', error)
    res.status(500).json({
      success: false,
      message: '创建旅行计划失败'
    })
  }
})

// 获取单个旅行计划详情
router.get('/:id', protect, async (req, res) => {
  try {
    const plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    res.status(200).json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('获取旅行计划详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取旅行计划详情失败'
    })
  }
})

// 更新旅行计划
router.put('/:id', protect, async (req, res) => {
  try {
    let plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    // 更新计划
    plan = await TravelPlan.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('更新旅行计划失败:', error)
    res.status(500).json({
      success: false,
      message: '更新旅行计划失败'
    })
  }
})

// 删除旅行计划
router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    await plan.remove()

    res.status(200).json({
      success: true,
      message: '旅行计划已删除'
    })
  } catch (error) {
    console.error('删除旅行计划失败:', error)
    res.status(500).json({
      success: false,
      message: '删除旅行计划失败'
    })
  }
})

// 更新旅行计划的行程安排
router.put('/:id/schedule', protect, async (req, res) => {
  try {
    const { schedule } = req.body
    
    let plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    plan = await TravelPlan.findOneAndUpdate(
      { _id: req.params.id },
      { schedule },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('更新行程安排失败:', error)
    res.status(500).json({
      success: false,
      message: '更新行程安排失败'
    })
  }
})

// 添加预算项
router.post('/:id/budget', protect, async (req, res) => {
  try {
    const { name, category, amount, date, notes } = req.body
    
    // 验证必填字段
    if (!name || !category || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      })
    }

    let plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    // 添加预算项
    const newBudgetItem = {
      name,
      category,
      amount,
      date,
      notes: notes || ''
    }

    plan.budgetItems.push(newBudgetItem)
    await plan.save()

    res.status(201).json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('添加预算项失败:', error)
    res.status(500).json({
      success: false,
      message: '添加预算项失败'
    })
  }
})

// 更新预算项
router.put('/:id/budget/:itemId', protect, async (req, res) => {
  try {
    const { name, category, amount, date, notes } = req.body
    
    let plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    // 查找预算项
    const budgetItem = plan.budgetItems.find(item => item.id === req.params.itemId)
    if (!budgetItem) {
      return res.status(404).json({
        success: false,
        message: '预算项不存在'
      })
    }

    // 更新预算项
    if (name) budgetItem.name = name
    if (category) budgetItem.category = category
    if (amount) budgetItem.amount = amount
    if (date) budgetItem.date = date
    if (notes !== undefined) budgetItem.notes = notes

    await plan.save()

    res.status(200).json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('更新预算项失败:', error)
    res.status(500).json({
      success: false,
      message: '更新预算项失败'
    })
  }
})

// 删除预算项
router.delete('/:id/budget/:itemId', protect, async (req, res) => {
  try {
    let plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '旅行计划不存在'
      })
    }

    // 过滤掉要删除的预算项
    plan.budgetItems = plan.budgetItems.filter(item => item.id !== req.params.itemId)
    await plan.save()

    res.status(200).json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('删除预算项失败:', error)
    res.status(500).json({
      success: false,
      message: '删除预算项失败'
    })
  }
})

module.exports = router