import axiosClient from './axiosClient';

interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

const AUTH_ENDPOINTS = {
  login: '/users/login',
  register: '/users/register',
} as const;

export const authApi = {
  login: async (credentials: any): Promise<ApiResponse> => {
    try {
      const response = await axiosClient.post(AUTH_ENDPOINTS.login, credentials);
      return response as unknown as ApiResponse;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  registerHost: async (userData: any): Promise<ApiResponse> => {
    try {
      const response = await axiosClient.post(AUTH_ENDPOINTS.register, userData);
      return response as unknown as ApiResponse;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};
