import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User, LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 基础操作
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 认证操作
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;

  // 个人资料操作
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;

  // 令牌刷新
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 基础操作
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // 登录
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '登录失败，请重试';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // 注册
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '注册失败，请重试';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // 退出登录
      logout: async () => {
        const { token } = get();
        set({ isLoading: true, error: null });
        
        try {
          // 只有在有 token 的情况下才调用后端 logout 接口
          if (token) {
            await authApi.logout();
          }
        } catch (error) {
          console.error('退出登录失败:', error);
        } finally {
          // 无论后端调用是否成功，都清除本地状态
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // 获取当前用户信息
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.getCurrentUser();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '获取用户信息失败';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // 更新个人资料
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateProfile(data);
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '更新个人资料失败';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // 修改密码
      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.changePassword(data);
          // 更新令牌
          set({
            token: response.data.token,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '修改密码失败';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // 刷新访问令牌
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('没有刷新令牌');
        }

        try {
          const response = await authApi.refreshToken({ refreshToken });
          set({
            token: response.data.accessToken,
          });
        } catch (error: any) {
          // 刷新失败，清除认证状态
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

