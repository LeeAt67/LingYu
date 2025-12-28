import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 标记是否正在执行 logout，避免重复调用
let isLoggingOut = false

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 如果是 401 错误且不是 logout 请求本身，且没有正在执行 logout
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/logout') &&
      !isLoggingOut
    ) {
      isLoggingOut = true
      useAuthStore.getState().logout().finally(() => {
        isLoggingOut = false
        // 只在非登录/注册页面时跳转到登录页
        const currentPath = window.location.pathname
        if (
          !currentPath.startsWith('/auth/') &&
          currentPath !== '/splash' &&
          currentPath !== '/onboarding'
        ) {
          window.location.href = '/auth/login'
        }
      })
    }
    return Promise.reject(error)
  }
)
