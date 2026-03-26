import axiosClient from './axiosClient';

interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

interface ForgotPasswordPayload {
  email: string;
}

interface VerifyResetCodePayload {
  email: string;
  code: string;
}

interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
}

const AUTH_ENDPOINTS = {
  login: '/users/login',
  register: '/users/register',
  forgotPassword: '/users/forgot-password',
  verifyResetCode: '/users/verify-reset-code',
  resetPassword: '/users/reset-password',
} as const;

async function post<TPayload>(endpoint: string, payload: TPayload): Promise<ApiResponse> {
  try {
    const response = await axiosClient.post(endpoint, payload);
    return response as unknown as ApiResponse;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export const authApi = {
  login: async (credentials: any): Promise<ApiResponse> => post(AUTH_ENDPOINTS.login, credentials),

  registerHost: async (userData: any): Promise<ApiResponse> => post(AUTH_ENDPOINTS.register, userData),

  requestPasswordReset: async (payload: ForgotPasswordPayload): Promise<ApiResponse> =>
    post(AUTH_ENDPOINTS.forgotPassword, payload),

  verifyResetCode: async (payload: VerifyResetCodePayload): Promise<ApiResponse> =>
    post(AUTH_ENDPOINTS.verifyResetCode, payload),

  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse> =>
    post(AUTH_ENDPOINTS.resetPassword, payload),
    
  refreshToken: async (refreshToken: string): Promise<ApiResponse> =>
    post('/users/refresh-token', { refreshToken }),
};
