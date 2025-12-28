/**
 * 认证相关 API
 */
import { apiClient } from './client';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * 更新个人资料请求参数
 */
export interface UpdateProfileRequest {
  name: string;
}

/**
 * 更新个人资料响应
 */
export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * 修改密码响应
 */
export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

/**
 * 密码重置请求参数
 */
export interface ResetRequestParams {
  email: string;
}

/**
 * 密码重置请求响应
 */
export interface ResetRequestResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

/**
 * 密码重置提交参数
 */
export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

/**
 * 密码重置提交响应
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * 刷新令牌请求参数
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      userId: string;
      email: string;
    };
  };
}

/**
 * API 错误响应
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * 认证 API 客户端
 */
export const authApi = {
  /**
   * 用户注册
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * 用户登录
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * 退出登录
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * 更新个人资料
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>(
      '/auth/profile',
      data
    );
    return response.data;
  },

  /**
   * 修改密码
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    const response = await apiClient.put<ChangePasswordResponse>(
      '/auth/password',
      data
    );
    return response.data;
  },

  /**
   * 请求密码重置
   */
  requestPasswordReset: async (
    data: ResetRequestParams
  ): Promise<ResetRequestResponse> => {
    const response = await apiClient.post<ResetRequestResponse>(
      '/auth/reset-request',
      data
    );
    return response.data;
  },

  /**
   * 重置密码
   */
  resetPassword: async (
    data: ResetPasswordParams
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      '/auth/reset-password',
      data
    );
    return response.data;
  },

  /**
   * 刷新访问令牌
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      data
    );
    return response.data;
  },
};
