import { create } from 'zustand'
import axios from 'axios'
import { toast } from 'react-toastify'

interface User {
  _id: string
  email: string
  name: string
  createdAt: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  initializeAuth: () => void
  updateUserProfile: (name: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({ token, user, isLoading: false })
      toast.success('登录成功！')
    } catch (error: any) {
      set({ error: error.response?.data?.message || '登录失败，请检查邮箱和密码', isLoading: false })
      toast.error('登录失败，请检查邮箱和密码')
      throw error
    }
  },
  
  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/auth/register', { name, email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({ token, user, isLoading: false })
      toast.success('注册成功！')
    } catch (error: any) {
      set({ error: error.response?.data?.message || '注册失败，请稍后重试', isLoading: false })
      toast.error('注册失败，请稍后重试')
      throw error
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({ token: null, user: null })
    toast.info('已退出登录')
  },
  
  initializeAuth: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      set({ token, isLoading: true })
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await axios.get('/api/auth/me')
        set({ user: response.data, isLoading: false })
      } catch (error) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        set({ token: null, user: null, isLoading: false })
      }
    }
  },
  
  updateUserProfile: async (name) => {
    const { user } = get()
    if (!user) return
    
    set({ isLoading: true })
    try {
      const response = await axios.put('/api/auth/profile', { name })
      set({ user: response.data, isLoading: false })
      toast.success('个人信息更新成功')
    } catch (error) {
      set({ isLoading: false })
      toast.error('更新失败，请稍后重试')
    }
  }
}))