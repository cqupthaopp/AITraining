const express = require('express')
const router = express.Router()
const axios = require('axios')
const { protect } = require('../middleware/auth')
const User = require('../models/User')

// 阿里云百炼大模型API配置
const getAlibabaCloudConfig = () => ({ 
  baseURL: 'https://dashscope.aliyuncs.com/api/v1/services',
  timeout: 60000 // 60秒超时
})

// 验证API Key是否有效
router.post('/validate-api-key', protect, async (req, res) => {
  try {
    // 获取用户的API Key - 明确选择apiKeys字段
    const user = await User.findById(req.user._id).select('+apiKeys')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    console.log('验证API Key - 用户数据:', { 
      userId: user._id, 
      hasApiKeys: !!user.apiKeys, 
      hasAliCloudKey: user.apiKeys?.alicloud ? '存在但不显示' : '不存在'
    })
    
    const apiKey = user.apiKeys?.alicloud
    
    if (!apiKey) {
      return res.status(403).json({
        success: false,
        message: '请先在设置页面配置阿里云百炼API Key'
      })
    }
    
    // 构建一个简单的测试请求来验证API Key
    const client = axios.create(getAlibabaCloudConfig())
    
    try {
      // 发送一个简单的请求来验证API Key
      const testResponse = await client.post('/aigc/text-generation/generation', {
        model: 'qwen-turbo',
        input: {
          prompt: '请返回一个简单的确认消息: "API Key有效"'
        },
        parameters: {
          max_tokens: 10,
          temperature: 0
        }
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('API Key验证成功，响应:', testResponse.data)
      res.status(200).json({
        success: true,
        message: 'API Key 有效'
      })
    } catch (apiError) {
      console.error('API Key验证失败 - 错误详情:', {
        message: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data,
        headers: apiError.response?.headers
      })
      
      let errorMessage = 'API Key 无效或已过期'
      if (apiError.response?.status === 401) {
        errorMessage = 'API Key 无效或已过期'
      } else if (apiError.response?.status === 429) {
        errorMessage = 'API 调用频率过高，请稍后再试'
      } else if (apiError.response?.status === 404) {
        errorMessage = 'API 端点不存在，请检查配置'
      } else if (apiError.response?.status === 500) {
        errorMessage = '阿里云服务器错误，请稍后再试'
      } else if (apiError.code === 'ECONNREFUSED') {
        errorMessage = '无法连接到阿里云API，请检查网络连接'
      } else if (apiError.code === 'ETIMEDOUT') {
        errorMessage = '连接超时，请检查网络连接'
      }
      
      res.status(apiError.response?.status || 401).json({
        success: false,
        message: errorMessage,
        errorDetails: apiError.response?.data || { code: apiError.code }
      })
    }
  } catch (error) {
    console.error('验证API Key时出错:', error)
    res.status(500).json({
      success: false,
      message: '验证API Key时出现错误，请稍后重试'
    })
  }
})

// 生成旅行计划
router.post('/generate-plan', protect, async (req, res) => {
  try {
    const { destination, duration, budget, people, preferences, startDate, endDate } = req.body
    
    // 验证输入
    if (!destination || !duration || !budget || !people || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      })
    }

    // 获取用户的API Key - 明确选择apiKeys字段
    const user = await User.findById(req.user._id).select('+apiKeys')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    console.log('生成计划 - 用户API Key状态:', {
      userId: user._id,
      hasApiKey: !!user.apiKeys?.alicloud
    })
    
    const apiKey = user.apiKeys?.alicloud
    
    if (!apiKey) {
      return res.status(403).json({
        success: false,
        message: '请先在设置页面配置阿里云百炼API Key'
      })
    }

    // 构建提示词
    const prompt = `
      作为专业的AI旅行规划师，请根据用户提供的信息生成详细的旅行计划。
      目的地：${destination}
      旅行天数：${duration}天
      旅行预算：${budget}元
      同行人数：${people}人
      旅行日期：${startDate} 至 ${endDate}
      旅行偏好：${preferences || '无特殊偏好'}
      
      请按照以下JSON格式输出旅行计划：
      {
        "name": "旅行计划名称",
        "schedule": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "activities": [
              {
                "time": "09:00-11:00",
                "activity": "活动名称",
                "destination": {
                  "name": "地点名称",
                  "address": "详细地址",
                  "description": "地点描述",
                  "category": "分类（景点/餐厅/住宿等）"
                },
                "notes": "备注"
              }
            ],
            "accommodation": {
              "name": "住宿名称",
              "address": "住宿地址",
              "description": "住宿描述",
              "category": "住宿"
            }
          }
        ],
        "recommendations": {
          "transportation": "交通建议",
          "dining": "餐饮建议",
          "tips": "旅行提示"
        }
      }
      
      请确保：
      1. 行程安排合理，考虑景点间距离和交通时间
      2. 包含早餐、午餐、晚餐的推荐
      3. 每天的活动不宜过满，留有适当休息时间
      4. 预算分配合理，考虑当地消费水平
      5. 输出严格遵循JSON格式，不要包含其他内容
    `

    // 调用阿里云百炼大模型API
    const client = axios.create(getAlibabaCloudConfig())
    const response = await client.post('/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        prompt: prompt
      },
      parameters: {
        result_format: 'json',
        max_tokens: 4000,
        temperature: 0.7
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // 解析响应
    console.log('阿里云API响应数据结构:', {
      hasOutput: !!response.data?.output,
      hasText: typeof response.data?.output?.text === 'string',
      hasChoices: Array.isArray(response.data?.output?.choices),
      responseKeys: Object.keys(response.data || {})
    })
    
    // 详细记录响应的完整结构用于调试
    console.log('阿里云API响应详情:', JSON.stringify(response.data, null, 2).substring(0, 1000) + '...')
    
    // 尝试从多个可能的路径获取响应文本
    let aiResponse = response.data?.output?.text
    
    // 如果没有直接的text字段，尝试从choices数组获取
    if (!aiResponse && Array.isArray(response.data?.output?.choices)) {
      // 检查choices数组中的第一个元素
      const firstChoice = response.data.output.choices[0]
      if (firstChoice) {
        aiResponse = firstChoice.text || firstChoice.content || firstChoice.message?.content
        console.log('从choices数组获取响应:', { foundText: !!aiResponse })
      }
    }
    
    // 如果仍然没有获取到文本，尝试将整个output对象转为JSON字符串
    if (!aiResponse && response.data?.output) {
      try {
        aiResponse = JSON.stringify(response.data.output)
        console.log('将output对象转为JSON字符串作为响应')
      } catch (e) {
        console.error('无法序列化output对象:', e)
      }
    }
    
    if (!aiResponse) {
      console.error('AI响应缺少文本内容:', {
        responseData: response.data,
        output: response.data?.output,
        choices: response.data?.output?.choices
      })
      return res.status(500).json({
        success: false,
        message: 'AI响应格式错误：缺少文本内容',
        error: 'EmptyAIResponse',
        responseStructure: {
          hasOutput: !!response.data?.output,
          hasChoices: !!response.data?.output?.choices,
          responseType: typeof response.data?.output
        }
      })
    }

    console.log('AI响应文本长度:', aiResponse.length, '前100字符:', aiResponse.substring(0, 100) + '...')

    // 尝试解析JSON
    let planData
    try {
      // 清理响应文本，移除前后可能的非JSON内容
      let cleanResponse = aiResponse.trim()
      
      // 移除可能的Markdown代码块标记
      cleanResponse = cleanResponse.replace(/^```json|```$/g, '').trim()
      
      // 移除可能的前缀文本，直到找到第一个{
      const firstBraceIndex = cleanResponse.indexOf('{')
      if (firstBraceIndex !== -1) {
        cleanResponse = cleanResponse.substring(firstBraceIndex)
      }
      
      // 移除可能的后缀文本，从最后一个}之后截断
      const lastBraceIndex = cleanResponse.lastIndexOf('}')
      if (lastBraceIndex !== -1) {
        cleanResponse = cleanResponse.substring(0, lastBraceIndex + 1)
      }
      
      console.log('清理后的JSON字符串:', cleanResponse.substring(0, 100) + '...')
      
      // 尝试解析清理后的JSON
      planData = JSON.parse(cleanResponse)
      
      // 验证解析后的数据是否包含必要字段
      if (!planData.name || !planData.schedule) {
        throw new Error('缺少必要的计划字段（name或schedule）')
      }
      
      // 添加必要的字段，确保数据完整性
      planData.destination = destination
      planData.duration = duration
      planData.budget = budget
      planData.people = people
      planData.preferences = preferences
      planData.startDate = startDate
      planData.endDate = endDate
      planData.user = req.user._id
      
    } catch (parseError) {
      console.error('JSON解析失败:', parseError, '原始响应:', aiResponse)
      return res.status(500).json({
        success: false,
        message: 'AI生成的旅行计划格式有误，请重试',
        error: 'InvalidJSONFormat',
        errorDetails: parseError.message
      })
    }

    res.status(200).json({
      success: true,
      plan: planData
    })
  } catch (error) {
    console.error('生成旅行计划失败:', error)
    
    // 处理不同类型的错误
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: '阿里云百炼API Key无效或已过期'
      })
    }
    
    res.status(500).json({
      success: false,
      message: '生成旅行计划失败，请重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 语音识别文本处理
router.post('/process-voice', protect, async (req, res) => {
  try {
    const { text } = req.body
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: '请提供语音文本'
      })
    }

    // 获取用户的API Key
    const user = await User.findById(req.user._id).select('+apiKeys')
    const apiKey = user.apiKeys?.alicloud
    
    if (!apiKey) {
      return res.status(403).json({
        success: false,
        message: '请先在设置页面配置阿里云百炼API Key'
      })
    }

    // 构建提示词，提取旅行信息
    const prompt = `
      请分析以下用户语音输入，提取旅行相关信息并以JSON格式输出：
      用户输入："""${text}"""
      
      请提取以下字段（如有）：
      - destination: 目的地
      - duration: 旅行天数
      - budget: 预算金额（元）
      - people: 同行人数
      - preferences: 旅行偏好（如美食、购物、文化、自然等）
      - startDate: 开始日期（如能从文本中提取）
      - endDate: 结束日期（如能从文本中提取）
      
      示例输出格式：
      {
        "destination": "日本东京",
        "duration": 5,
        "budget": 10000,
        "people": 2,
        "preferences": "喜欢美食和动漫",
        "startDate": "",
        "endDate": ""
      }
      
      如果某个字段无法提取，请使用空字符串或0值。
      请确保输出为有效的JSON格式，不要包含其他内容。
    `

    // 调用阿里云百炼大模型API
    const client = axios.create(getAlibabaCloudConfig())
    const response = await client.post('/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        prompt: prompt
      },
      parameters: {
        result_format: 'json',
        max_tokens: 1000,
        temperature: 0.3
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // 解析响应
    const aiResponse = response.data?.output?.text
    if (!aiResponse) {
      throw new Error('AI响应格式错误')
    }

    // 尝试解析JSON
    let extractedData
    try {
      extractedData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      return res.status(500).json({
        success: false,
        message: '解析语音文本失败，请重试'
      })
    }

    res.status(200).json({
      success: true,
      data: extractedData
    })
  } catch (error) {
    console.error('处理语音文本失败:', error)
    res.status(500).json({
      success: false,
      message: '处理语音文本失败，请重试'
    })
  }
})

// 预算分析
router.post('/analyze-budget', protect, async (req, res) => {
  try {
    const { destination, duration, people, currentItems } = req.body
    
    if (!destination || !duration || !people) {
      return res.status(400).json({
        success: false,
        message: '请提供必要的分析参数'
      })
    }

    // 获取用户的API Key
    const user = await User.findById(req.user._id).select('+apiKeys')
    const apiKey = user.apiKeys?.alicloud
    
    if (!apiKey) {
      return res.status(403).json({
        success: false,
        message: '请先在设置页面配置阿里云百炼API Key'
      })
    }

    // 构建提示词
    const prompt = `
      作为旅行预算分析师，请根据以下信息分析旅行预算并提供建议：
      目的地：${destination}
      旅行天数：${duration}天
      同行人数：${people}人
      当前预算项：${JSON.stringify(currentItems || [], null, 2)}
      
      请提供以下分析：
      1. 当前预算分配是否合理
      2. 可能遗漏的预算项目
      3. 各预算类别的合理分配比例
      4. 省钱建议
      
      请以JSON格式输出：
      {
        "isReasonable": true/false,
        "missingItems": ["遗漏项目1", "遗漏项目2"...],
        "recommendedDistribution": {
          "交通": "30%",
          "住宿": "40%",
          "餐饮": "20%",
          "景点门票": "5%",
          "购物": "5%"
        },
        "moneySavingTips": ["建议1", "建议2"...]
      }
      
      请确保输出为有效的JSON格式，不要包含其他内容。
    `

    // 调用阿里云百炼大模型API
    const client = axios.create(getAlibabaCloudConfig())
    const response = await client.post('/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        prompt: prompt
      },
      parameters: {
        result_format: 'json',
        max_tokens: 2000,
        temperature: 0.7
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // 解析响应
    const aiResponse = response.data?.output?.text
    if (!aiResponse) {
      throw new Error('AI响应格式错误')
    }

    // 尝试解析JSON
    let analysisData
    try {
      analysisData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      return res.status(500).json({
        success: false,
        message: '解析预算分析结果失败，请重试'
      })
    }

    res.status(200).json({
      success: true,
      analysis: analysisData
    })
  } catch (error) {
    console.error('分析预算失败:', error)
    res.status(500).json({
      success: false,
      message: '分析预算失败，请重试'
    })
  }
})

module.exports = router