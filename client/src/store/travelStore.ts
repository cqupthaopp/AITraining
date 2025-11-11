import { create } from 'zustand'
import axios from 'axios'
import { toast } from 'react-toastify'

interface Destination {
  name: string
  address: string
  coordinates?: [number, number]
  description?: string
  category?: string
}

interface DailySchedule {
  day: number
  date: string
  activities: Array<{
    time: string
    activity: string
    destination: Destination
    notes?: string
  }>
  accommodation?: Destination
}

interface BudgetItem {
  id: string
  name: string
  category: string
  amount: number
  date: string
  notes?: string
}

interface TravelPlan {
  _id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  duration: number
  budget: number
  people: number
  preferences: string
  schedule: DailySchedule[]
  budgetItems: BudgetItem[]
  createdAt: string
  updatedAt: string
}

interface TravelState {
  plans: TravelPlan[]
  currentPlan: TravelPlan | null
  isLoading: boolean
  error: string | null
  createPlan: (planData: Partial<TravelPlan>) => Promise<void>
  generatePlanWithAI: (prompt: string) => Promise<void>
  loadTravelPlans: () => Promise<void>
  getPlanById: (id: string) => Promise<void>
  updatePlan: (id: string, planData: Partial<TravelPlan>) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  addBudgetItem: (planId: string, item: Omit<BudgetItem, 'id'>) => Promise<void>
  updateBudgetItem: (planId: string, itemId: string, item: Partial<BudgetItem>) => Promise<void>
  deleteBudgetItem: (planId: string, itemId: string) => Promise<void>
  updateApiKey: (apiKey: string) => void
}

export const useTravelStore = create<TravelState>((set, get) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,
  
  createPlan: async (planData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/plans', planData)
      const newPlan = response.data
      set((state) => ({ 
        plans: [...state.plans, newPlan],
        isLoading: false 
      }))
      toast.success('旅行计划创建成功！')
    } catch (error: any) {
      set({ error: error.response?.data?.message || '创建失败', isLoading: false })
      toast.error('创建旅行计划失败')
    }
  },
  
  generatePlanWithAI: async (planData) => {
    set({ isLoading: true, error: null })
    try {
      // 根据后端API要求，直接传递完整的计划参数
      console.log('准备调用AI生成API，参数:', planData)
      const response = await axios.post('/api/ai/generate-plan', planData)
      
      // 检查响应数据结构是否正确
      if (!response.data || !response.data.plan) {
        throw new Error('API响应格式错误：缺少plan数据')
      }
      
      const generatedPlan = response.data.plan
      
      // 检查生成的计划是否包含必要字段
      if (!generatedPlan || !generatedPlan.destination || !generatedPlan.schedule) {
        throw new Error('AI生成的计划数据不完整')
      }
      
      set((state) => ({ 
        plans: [...state.plans, generatedPlan],
        currentPlan: generatedPlan,
        isLoading: false 
      }))
      toast.success('AI 已为您生成旅行计划！')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'AI 生成失败'
      console.error('生成计划API错误:', { 
        response: error.response?.data, 
        message: error.message,
        stack: error.stack
      })
      set({ error: errorMessage, isLoading: false })
      
      // 根据不同错误类型提供更具体的提示
      if (error.response?.status === 401) {
        toast.error('API Key 无效或已过期，请重新配置')
      } else if (error.response?.status === 403) {
        toast.error('请先在设置页面配置有效的API Key')
      } else if (error.response?.status === 400) {
        toast.error('参数错误: ' + errorMessage)
      } else if (errorMessage.includes('格式') || errorMessage.includes('解析')) {
        toast.error('AI响应格式错误，请稍后重试或调整您的提示词')
      } else {
        toast.error(`生成失败: ${errorMessage}`)
      }
    }
  },
  
  loadTravelPlans: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get('/api/plans')
      // 正确处理后端返回的数据结构
      set({ plans: response.data.plans || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || '加载失败', isLoading: false })
    }
  },
  
  getPlanById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/plans/${id}`)
      // 正确处理后端返回的数据结构
      set({ currentPlan: response.data.plan || null, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || '获取计划失败', isLoading: false })
      toast.error('获取旅行计划失败')
    }
  },
  
  updatePlan: async (id, planData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put(`/api/plans/${id}`, planData)
      const updatedPlan = response.data
      set((state) => ({
        plans: state.plans.map(plan => plan._id === id ? updatedPlan : plan),
        currentPlan: state.currentPlan?._id === id ? updatedPlan : state.currentPlan,
        isLoading: false
      }))
      toast.success('旅行计划更新成功')
    } catch (error: any) {
      set({ error: error.response?.data?.message || '更新失败', isLoading: false })
      toast.error('更新旅行计划失败')
    }
  },
  
  deletePlan: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`/api/plans/${id}`)
      set((state) => ({
        plans: state.plans.filter(plan => plan._id !== id),
        currentPlan: state.currentPlan?._id === id ? null : state.currentPlan,
        isLoading: false
      }))
      toast.success('旅行计划已删除')
    } catch (error: any) {
      set({ error: error.response?.data?.message || '删除失败', isLoading: false })
      toast.error('删除旅行计划失败')
    }
  },
  
  addBudgetItem: async (planId, item) => {
    try {
      const response = await axios.post(`/api/plans/${planId}/budget`, item)
      const updatedPlan = response.data
      set((state) => ({
        plans: state.plans.map(plan => plan._id === planId ? updatedPlan : plan),
        currentPlan: state.currentPlan?._id === planId ? updatedPlan : state.currentPlan
      }))
      toast.success('预算项添加成功')
    } catch (error) {
      toast.error('添加预算项失败')
    }
  },
  
  updateBudgetItem: async (planId, itemId, item) => {
    try {
      const response = await axios.put(`/api/plans/${planId}/budget/${itemId}`, item)
      const updatedPlan = response.data
      set((state) => ({
        plans: state.plans.map(plan => plan._id === planId ? updatedPlan : plan),
        currentPlan: state.currentPlan?._id === planId ? updatedPlan : state.currentPlan
      }))
      toast.success('预算项更新成功')
    } catch (error) {
      toast.error('更新预算项失败')
    }
  },
  
  deleteBudgetItem: async (planId, itemId) => {
    try {
      const response = await axios.delete(`/api/plans/${planId}/budget/${itemId}`)
      const updatedPlan = response.data
      set((state) => ({
        plans: state.plans.map(plan => plan._id === planId ? updatedPlan : plan),
        currentPlan: state.currentPlan?._id === planId ? updatedPlan : state.currentPlan
      }))
      toast.success('预算项已删除')
    } catch (error) {
      toast.error('删除预算项失败')
    }
  },
  
  updateApiKey: (apiKey) => {
    localStorage.setItem('alicloud_api_key', apiKey)
  }
}))